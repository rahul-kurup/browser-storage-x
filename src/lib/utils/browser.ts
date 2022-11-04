import type {
  BrowserChrome,
  BrowserVendor,
  Cookie,
  CookieSetInfo,
  Tab
} from 'lib-models/browser';

type TabReplaceEvent = (addedTabId: number, removedTabId: number) => void;
export default class Browser {
  static async detect(): Promise<[BrowserVendor, BrowserChrome]> {
    const isFirefox = chrome.runtime.getURL('').startsWith('moz-extension://');
    // Promisified to handle future browser async detection
    return Promise.resolve([isFirefox ? 'firefox' : 'chromium', chrome]);
  }

  static cookies = {
    getAll: async (tab?: Tab, cbSuccess?: (cookies: Cookie[]) => void) => {
      const [vendor, instance] = await this.detect();
      let result: Cookie[] = [];
      if (tab) {
        if (vendor === 'chromium') {
          result = await instance.cookies.getAll({});
        } else {
          result = await new Promise((resolve, _reject) =>
            instance.cookies.getAll({}, resolve)
          );
        }
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
      const [vendor, instance] = await this.detect();
      await instance.cookies.set(info);
    },
  };

  static tab = {
    isDiscarded: (tab: Tab) => tab.discarded || tab.status === 'unloaded',

    discard: async (tab: Tab) => {
      const [vendor, instance] = await this.detect();
      return await instance.tabs.discard(tab.id);
    },

    reloadIfDiscarded: async (tab: Tab) => {
      const [vendor, instance] = await this.detect();
      const isTabUnloaded = this.tab.isDiscarded(tab);
      if (isTabUnloaded) {
        await instance.tabs.reload(tab.id);
      }
      return isTabUnloaded;
    },

    getAll: async (cbSuccess?: (tabs: Tab[]) => void) => {
      const [vendor, instance] = await this.detect();
      let result: Tab[] = [];
      if (vendor === 'chromium') {
        result = (await instance.tabs.query({})) as Tab[];
      } else {
        result = (await new Promise((resolve, _reject) =>
          instance.tabs.query({}, resolve)
        )) as unknown as Tab[];
      }
      cbSuccess?.(result);
      return result;
    },

    get: async (tabId: number, cb: (tab: Tab) => void) => {
      const [vendor, instance] = await this.detect();
      instance.tabs.get(+tabId, cb);
    },

    onReplaced: {
      addListener: async (cb: TabReplaceEvent) => {
        const [vendor, instance] = await this.detect();
        instance.tabs.onReplaced.addListener(cb);
      },

      removeListener: async (cb: TabReplaceEvent) => {
        const [vendor, instance] = await this.detect();
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
      const [vendor, instance] = await this.detect();

      /**
       * if tab is discarded/unloaded from memory, executescript fails
       * so we reload the tab first and then fetch storage
       */
      await this.tab.reloadIfDiscarded(tab);

      if (vendor === 'chromium') {
        const [execOutput] = await instance.scripting.executeScript({
          target: { tabId: tab.id },
          args,
          func,
        });
        return execOutput;
      } else {
        const [execOutput] = (await new Promise((resolve, _reject) =>
          instance.scripting.executeScript(
            {
              target: { tabId: tab.id },
              args,
              func,
            },
            resolve
          )
        )) as any;

        return execOutput;
      }
    },
  };
}
