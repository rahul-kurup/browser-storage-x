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
    isDiscarded: (tab: Tab) => tab.discarded || tab.status === 'unloaded',

    discard: async (tab: Tab) => {
      const browser = await this.detect();
      return await browser.tabs.discard(tab.id);
    },

    reloadIfDiscarded: async (tab: Tab) => {
      const browser = await this.detect();
      const isTabUnloaded = this.tab.isDiscarded(tab);
      if (isTabUnloaded) {
        await browser.tabs.reload(tab.id);
      }
      return isTabUnloaded;
    },

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
      args: T[]
    ) => {
      const browser = await this.detect();

      await this.tab.reloadIfDiscarded(tab);

      const [execOutput] = await browser.scripting.executeScript({
        target: { tabId: tab.id },
        args,
        func,
      });

      return execOutput;
    },
  };
}
