export default function browser() {
  return chrome;
}


export const safelyExecuteScript = async (tabToExecuteOn: chrome.tabs.Tab, args, func, browser: typeof chrome, discardAfterExecution=true) => {
  /**
   * if tab is discarded/unloaded from memory, executescript fails
   * so we reload the tab first and then fetch storage
   */
  const isTabUnloaded = tabToExecuteOn.discarded || tabToExecuteOn.status === 'unloaded' // type TabStatus exists in chrome docs but not in TS types https://developer.chrome.com/docs/extensions/reference/tabs/#type-TabStatus
  isTabUnloaded && await browser.tabs.reload(tabToExecuteOn.id)
  const [getAll] = await browser.scripting.executeScript({
    target: { tabId: tabToExecuteOn.id },
    args: [...args],
    func: func,
  });
  console.log("🚀 ~ file: app.tsx ~ line 139 ~ updateCheckboxTree ~ getAll", getAll.result)
  /**
   * So we discard the tab again as it was discarded earlier and don't want to consume user's memory
   * BUT BUT BUT due to discarding the tab, tab is replaced, and the tab we have in srcTab is not the same
   * so we use browser.tabs.onReplaced, check on top
   * this discard also returns the new tab, but onReplace handles more cases like tab getting discarded automatically
   * so we use that
   */
   discardAfterExecution && isTabUnloaded && await browser.tabs.discard(tabToExecuteOn.id)
   return getAll
}