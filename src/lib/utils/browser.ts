import type {
  Browser as BrowserType,
  Cookie,
  CookieSetInfo,
  Tab,
} from 'lib-models/browser';

type TabReplaceEvent = (addedTabId: number, removedTabId: number) => void;
export default class Browser {
  static async detect(): Promise<BrowserType> {
    // Promisified to handle future browser async detection
    return Promise.resolve(chrome);
  }

  static cookies = {
    getAll: async (tab?: Tab, cbSuccess?: (cookies: Cookie[]) => void) => {
      const browser = await this.detect();
      const result = await browser.cookies.getAll({});
      if (tab) {
        const filtered = result.filter(f =>
          tab.url.includes(f.domain.split('.').filter(Boolean).join('.'))
        );
        cbSuccess?.(filtered);
        return filtered;
      }
      cbSuccess?.(result);
      return result;
    },

    set: async (info: CookieSetInfo) => {
      const browser = await this.detect();
      await browser.cookies.set(info);
    },
  };

  static tab = {
    getAll: async (cbSuccess?: (tabs: Tab[]) => void) => {
      const browser = await this.detect();
      const result = (await browser.tabs.query({})) as Tab[];
      cbSuccess?.(result);
      return result;
    },

    get: async (tabId: number, cb: (tab: Tab) => void) => {
      const browser = await this.detect();
      browser.tabs.get(+tabId, cb);
    },

    onReplaced: {
      addListener: async (cb: TabReplaceEvent) =>
        (await this.detect()).tabs.onReplaced.addListener(cb),

      removeListener: async (cb: TabReplaceEvent) =>
        (await this.detect()).tabs.onReplaced.removeListener(cb),
    },
  };

  static script = {
    execute: async <T = any>(
      tab: Tab,
      func: (...args: T[]) => unknown,
      args: T[],
      discardAfterExecution = true
    ) => {
      const browser = await this.detect();
      /**
       * if tab is discarded/unloaded from memory, executescript fails
       * so we reload the tab first and then fetch storage
       */
      const isTabUnloaded = tab.discarded || tab.status === 'unloaded';

      if (isTabUnloaded) {
        await browser.tabs.reload(tab.id);
      }

      const [execOutput] = await browser.scripting.executeScript({
        target: { tabId: tab.id },
        args,
        func,
      });

      /**
       * So we discard the tab again as it was discarded earlier and don't want to consume user's memory
       * BUT BUT BUT due to discarding the tab, tab is replaced, and is not the same
       * so we use browser.tabs.onReplaced, check in main app file, we add a listener there
       * the discard fn here also returns the new tab, but onReplace handles more cases like tab getting discarded automatically
       * so we use that
       */
      if (discardAfterExecution && isTabUnloaded) {
        await browser.tabs.discard(tab.id);
      }
      return execOutput;
    },
  };
}
