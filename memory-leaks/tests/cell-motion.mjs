export async function setup(page) {
  await page.waitForXPath(
    '//div[contains(@class, "lm-TabBar-tabLabel")][text()="Launcher"]'
  );

  await page.click('.jp-LauncherCard[data-category="Notebook"]');

  await page.waitForXPath(
    '//div[contains(@class, "lm-TabBar-tabLabel")][contains(text(), "Untitled")]'
  );
  const addCell = await page.waitForSelector(
    '.jp-ToolbarButtonComponent[title="Insert a cell below (B)"]'
  );
  // Add a cell
  await addCell.click();

  // Add a cell of each type
  for (const type of ["code", "markdown", "raw"]) {
    await addCell.click();

    await page.waitForTimeout(100);

    switch (type) {
      case "raw":
        await page.keyboard.press("R");
        await page.waitForSelector(".jp-RawCell");
        break;
      case "markdown":
        await page.keyboard.press("M");
        await page.waitForSelector(".jp-MarkdownCell");
        break;
      case "code":
        await page.keyboard.press("C");
        await page.waitForSelector(".jp-CodeCell");
        break;
    }

    // Switch to edit mode
    await page.keyboard.press("Enter");

    await page.keyboard.type("# Dummy _text_ compatible with **all** types.");

    // Execute the cell
    await page.keyboard.down("Control");
    await page.keyboard.press("Enter");
    await page.keyboard.up("Control");
  }

  // Wait for UI stabilization once the notebook is opened
  await page.waitForTimeout(2000);
}

export async function createTests(page) {
  return Promise.resolve([
    {
      description: "Move a code cell",
      data: {
        type: "code",
      },
    },
    {
      description: "Move a markdown cell",
      data: {
        type: "markdown",
      },
    },
    {
      description: "Move a raw cell",
      data: {
        type: "raw",
      },
    },
  ]);
}

export async function iteration(page, data) {
  // Select the first cell
  const target = await page.waitForXPath(
    '//div[contains(@class, "jp-CodeCell")][position() = 1]'
  );
  const targetBBox = await target.boundingBox();

  let cell;
  switch (data.type) {
    case "raw":
      cell = await page.waitForSelector(".jp-RawCell");
      break;
    case "markdown":
      cell = await page.waitForSelector(".jp-MarkdownCell");
      break;
    case "code":
      cell = await page.waitForXPath(
        '//div[contains(@class, "jp-CodeCell")][position() = last()]'
      );
      break;
  }

  const promptBBox = await (
    await cell.waitForSelector(".jp-InputArea-prompt")
  ).boundingBox();

  await page.mouse.move(
    promptBBox.x + 0.5 * promptBBox.width,
    promptBBox.y + 0.5 * promptBBox.height
  );
  await page.mouse.down();
  await page.mouse.move(targetBBox.x + 5, targetBBox.y + 5);
  await page.mouse.up();

  // Wait for UI stabilization
  await page.waitForTimeout(2000);

  const promptBBox2 = await (
    await cell.waitForSelector(".jp-InputArea-prompt")
  ).boundingBox();

  let targetBBox2;
  switch (data.type) {
    case "raw":
      targetBBox2 = await (
        await page.waitForSelector(".jp-MarkdownCell")
      ).boundingBox();
      break;
    case "markdown":
      targetBBox2 = await (
        await page.waitForXPath(
          '//div[contains(@class, "jp-CodeCell")][position() = last()]'
        )
      ).boundingBox();
      break;
    case "code":
      targetBBox2 = await (
        await page.waitForXPath(
          '//div[contains(@class, "jp-CodeCell")][position() = last()]'
        )
      ).boundingBox();
      break;
  }

  await page.mouse.move(
    promptBBox2.x + 0.5 * promptBBox2.width,
    promptBBox2.y + 0.5 * promptBBox2.height
  );
  await page.mouse.down();
  await page.mouse.move(
    targetBBox2.x + 5,
    targetBBox2.y + targetBBox2.height + 5
  );
  await page.mouse.up();

  // Wait for UI stabilization
  await page.waitForTimeout(2000);
}

export async function teardown(page) {
  const browserItem = await page.waitForXPath(
    '//li[contains(@class, "jp-DirListing-item")][contains(@title, "Untitled.ipynb")]'
  );
  await browserItem.click({ button: "right" });
  const deleteItem = await page.waitForXPath(
    // The `D` is wrap in a sub span
    '//div[contains(@class, "lm-Menu-itemLabel")][text()="elete"]'
  );
  await deleteItem.click();
  const button = await page.waitForSelector("button.jp-mod-warn");
  await button.click("button.jp-mod-warn");
  await page.waitForXPath(
    '//div[contains(@class, "lm-TabBar-tabLabel")][text()="Launcher"]'
  );
}
