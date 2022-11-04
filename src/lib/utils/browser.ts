import type {
  BrowserChrome,
  BrowserVendor,
  Cookie,
  CookieSetInfo,
  Tab
} from 'lib-models/browser';

type TabReplaceEvent = (addedTabId: number, removedTabId: number) => void;
export default class Browser {
  static async detect(): Promise<{
    vendor: BrowserVendor;
    instance: BrowserChrome;
  }> {
    const isFirefox = chrome.runtime.getURL('').startsWith('moz-extension://');
    // Promisified to handle future browser async detection
    return Promise.resolve({
      vendor: isFirefox ? 'firefox' : 'chromium',
      instance: chrome,
    });
  }

  static cookies = {
    getAll: async (tab?: Tab, cbSuccess?: (cookies: Cookie[]) => void) => {
      const { instance } = await this.detect();

      const result: Cookie[] = await new Promise((resolve, _reject) =>
        instance.cookies.getAll({}, resolve)
      );

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
      const { instance } = await this.detect();
      await instance.cookies.set(info);
    },
  };

  static tab = {
    isDiscarded: (tab: Tab) => tab.discarded || tab.status === 'unloaded',

    discard: async (tab: Tab) => {
      const { instance } = await this.detect();
      return await instance.tabs.discard(tab.id);
    },

    reloadIfDiscarded: async (tab: Tab) => {
      const { instance } = await this.detect();
      const isTabUnloaded = this.tab.isDiscarded(tab);
      if (isTabUnloaded) {
        await instance.tabs.reload(tab.id);
      }
      return isTabUnloaded;
    },

    getAll: async (cbSuccess?: (tabs: Tab[]) => void) => {
      const { instance } = await this.detect();
      const result: Tab[] = (await new Promise((resolve, _reject) =>
        instance.tabs.query({}, resolve)
      )) as unknown as Tab[];
      cbSuccess?.(result);
      return result;
    },

    get: async (tabId: number, cb: (tab: Tab) => void) => {
      const { instance } = await this.detect();
      instance.tabs.get(+tabId, cb);
    },

    onReplaced: {
      addListener: async (cb: TabReplaceEvent) => {
        const { instance } = await this.detect();
        instance.tabs.onReplaced.addListener(cb);
      },

      removeListener: async (cb: TabReplaceEvent) => {
        const { instance } = await this.detect();
        instance.tabs.onReplaced.removeListener(cb);
      },
    },
  };

  static script = {
    execute: async <T = any>(
      tab: Tab,
      func: (...args: T[]) => unknown,
      args: T[]
    ) => {
      const { instance } = await this.detect();

      /**
       * if tab is discarded/unloaded from memory, executescript fails
       * so we reload the tab first and then fetch storage
       */
      await this.tab.reloadIfDiscarded(tab);

      const execOutput = (await new Promise((resolve, _reject) =>
        instance.scripting.executeScript(
          {
            target: { tabId: tab.id },
            args,
            func,
          },
          resolve
        )
      )) as unknown as [{ result: any }];
      return execOutput?.[0]?.result;
    },
  };
}
