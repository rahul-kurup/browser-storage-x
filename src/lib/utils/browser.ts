import { Tab } from 'lib-models/browser';

export default async function detectBrowser() {
  return Promise.resolve(chrome); // Promisified to handle future browser async detection
}

export async function safelyExecuteScript(
  tabToExecuteOn: Tab,
  args: any[],
  func: (...args: any[]) => unknown,
  discardAfterExecution = true
) {
  const browser = await detectBrowser();
  /**
   * if tab is discarded/unloaded from memory, executescript fails
   * so we reload the tab first and then fetch storage
   */
  const isTabUnloaded =
    tabToExecuteOn.discarded || tabToExecuteOn.status === 'unloaded'; // 'unloaded' comes from type TabStatus which exists in chrome docs but not in TS types https://developer.chrome.com/docs/extensions/reference/tabs/#type-TabStatus

  if (isTabUnloaded) {
    await browser.tabs.reload(tabToExecuteOn.id);
  }

  const [execOutput] = await browser.scripting.executeScript({
    target: { tabId: tabToExecuteOn.id },
    args: [...args],
    func,
  });

  console.log(
    '🚀 ~ file: app.tsx ~ line 139 ~ updateCheckboxTree ~ getAll',
    execOutput.result
  );
  /**
   * So we discard the tab again as it was discarded earlier and don't want to consume user's memory
   * BUT BUT BUT due to discarding the tab, tab is replaced, and is not the same
   * so we use browser.tabs.onReplaced, check in main app file, we add a listener there
   * the discard fn here also returns the new tab, but onReplace handles more cases like tab getting discarded automatically
   * so we use that
   */
  if (discardAfterExecution && isTabUnloaded) {
    await browser.tabs.discard(tabToExecuteOn.id);
  }
  return execOutput;
}
