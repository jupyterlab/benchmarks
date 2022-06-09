export async function setup(page) {}

export async function createTests(page) {
  return Promise.resolve([
    {
      description: "Create a notebook",
    },
  ]);
}

export async function iteration(page, data) {
  await page.click('.jp-LauncherCard[data-category="Notebook"]');
  await page.waitForXPath(
    '//div[contains(@class, "lm-TabBar-tabLabel")][contains(text(), "Untitled")]'
  );
  // Wait for UI stabilization once the notebook is opened
  await page.waitForTimeout(2000);
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
  // Wait for UI stabilization once the notebook is deleted
  await page.waitForTimeout(2000);
}
