import type {
  BrowserChrome,
  BrowserVendor,
  Cookie,
  CookieRemoveInfo,
  CookieSetInfo,
  CookieStore,
  Tab,
  TabQueryInfo,
} from 'lib-models/browser';
import { StorageType } from 'lib-models/storage';
import { noop } from './common';
import { getAllItems, removeAllItems, setAllItems } from './storage';

const Promised = <T>(fn: Function, args: any) =>
  new Promise((resolve, reject) => {
    try {
      fn(args, resolve);
    } catch (error) {
      reject(error);
    }
  }) as Promise<T>;

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

  static cookie = {
    stores: async (tab: Tab) => {
      const { instance } = await this.detect();
      const stores = await instance.cookies.getAllCookieStores();
      return stores.filter(f => f.tabIds.includes(tab.id));
    },

    storeId: async (tab: Tab) => {
      const store =
        tab['cookieStoreId'] ||
        (((await this.cookie.stores(tab)?.[0]) ?? {}) as CookieStore);
      return store.id as string;
    },

    getAll: async (tab: Tab, cbSuccess?: (cookies: Cookie[]) => void) => {
      const { instance } = await this.detect();

      const storeId = await this.cookie.storeId(tab);

      const result = await Promised<Cookie[]>(instance.cookies.getAll, {
        storeId,
        url: tab.url,
      });

      cbSuccess?.(result);
      return result;
    },

    set: async (info: CookieSetInfo) => {
      const { instance } = await this.detect();
      return await instance.cookies.set({
        domain: info.domain,
        url: info.url,
        path: info.path,
        name: info.name,
        value: String(info.value ?? ''),
        secure: info.secure,
        httpOnly: info.httpOnly,
        sameSite: info.sameSite,
        expirationDate: info.expirationDate,
      });
    },

    remove: async ({ name, url }: CookieRemoveInfo) => {
      const { instance } = await this.detect();
      return await instance.cookies.remove({ name, url });
    },
  };

  static tab = {
    genUrlInfo: (tab: Tab) => {
      const [_, domain] =
        tab.url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i) || [];
      return {
        url: tab.url,
        domain: domain || this.tab.getUrlInfo(tab).domain,
      };
    },

    getUrlInfo: (tab: Tab) => {
      const { origin: url, protocol, hostname: domain } = new URL(tab.url);
      return { url, domain, protocol };
    },

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

    getAll: async (
      cbSuccess?: (tabs: Tab[]) => void,
      query: TabQueryInfo = {}
    ) => {
      const { instance } = await this.detect();
      const result = await Promised<Tab[]>(instance.tabs.query, query);

      cbSuccess?.(result);
      return result;
    },

    getActiveTabOfCurrentWindow: async (cbSuccess?: (tabs: Tab) => void) => {
      const result = await this.tab.getAll(noop, {
        active: true,
        currentWindow: true,
      });
      const tab = result?.[0];
      cbSuccess?.(tab);
      return tab;
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

    storage: (tab: Tab) => ({
      setAll: (storage: StorageType, content: Object) =>
        this.script.execute(tab, setAllItems, [storage, content]),

      getAll: (storage: StorageType) =>
        this.script.execute(tab, getAllItems, [storage]),

      removeAll: (storage: StorageType) =>
        this.script.execute(tab, removeAllItems, [storage]),
    }),
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

      const execOutput = await Promised<[{ result: any }]>(
        instance.scripting.executeScript,
        {
          target: { tabId: tab.id },
          args,
          func,
        }
      );

      return execOutput?.[0]?.result;
    },
  };
}
