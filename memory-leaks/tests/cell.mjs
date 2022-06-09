export async function setup(page) {
  await page.waitForXPath(
    '//div[contains(@class, "lm-TabBar-tabLabel")][text()="Launcher"]'
  );

  await page.click('.jp-LauncherCard[data-category="Notebook"]');

  await page.waitForXPath(
    '//div[contains(@class, "lm-TabBar-tabLabel")][contains(text(), "Untitled")]'
  );
  // Wait for UI stabilization once the notebook is opened
  await page.waitForTimeout(2000);
}

export async function createTests(page) {
  return Promise.resolve([
    {
      description: "Create a code cell",
      data: {
        type: "code",
      },
    },
    {
      description: "Create a markdown cell",
      data: {
        type: "markdown",
      },
    },
    {
      description: "Create a raw cell",
      data: {
        type: "raw",
      },
    },
  ]);
}

export async function iteration(page, data) {
  const addCell = await page.waitForSelector(
    '.jp-ToolbarButtonComponent[title="Insert a cell below (B)"]'
  );
  await addCell.click();

  await page.waitForTimeout(100);

  switch (data.type) {
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

  // Wait for UI stabilization
  await page.waitForTimeout(2000);

  // Delete the added cell
  await page.keyboard.press("KeyD");
  await page.keyboard.press("KeyD");

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
