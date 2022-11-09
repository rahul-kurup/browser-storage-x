import extractDomain from 'extract-domain';
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
import { noop } from './common';

const PREFIX = {
  d: '.',
  w3: 'www',
  w3d: 'www.',
  dw3d: '.www.',
};

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
    genUrlInfoUsingTab: (cookie: Cookie, tab: Tab) => {
      let { domain, protocol } = this.tab.getUrlInfo(tab);
      const originalDomain = domain;
      if (
        (!cookie.domain.startsWith(PREFIX.w3d) ||
          !cookie.domain.startsWith(PREFIX.dw3d)) &&
        domain.startsWith(PREFIX.w3d)
      ) {
        domain = domain.replace(PREFIX.w3d, '');
      }

      [PREFIX.w3d, PREFIX.dw3d, PREFIX.d].forEach(prefix => {
        if (cookie.domain.startsWith(prefix) && !domain.startsWith(prefix)) {
          domain = `${prefix}${domain}`;
        }
      });

      return { domain, url: `${protocol}//${originalDomain}` };
    },

    genMatchingDomains: (tab: Tab) => {
      const { domain } = this.tab.getUrlInfo(tab);
      const originalDomain = domain;
      const domains = [domain];
      if (domain.includes(PREFIX.w3)) {
        domains.push(
          `${PREFIX.dw3d}${domain}`,
          domain.replace(PREFIX.w3, ''),
          domain.replace(PREFIX.w3d, '')
        );
      } else {
        domains.push(
          `${PREFIX.d}${domain}`,
          `${PREFIX.w3d}${domain}`,
          `${PREFIX.dw3d}${domain}`
        );
      }
      const extracted = extractDomain(domain);
      domains.push(extracted);
      const origWithSubDomain = originalDomain.replace(extracted, '');
      if (origWithSubDomain.endsWith(PREFIX.d)) {
        domains.push(`${PREFIX.d}${extracted}`);
      }
      return [...new Set(domains)];
    },

    storeIds: async (tab: Tab) => {
      const { instance } = await this.detect();
      const stores = await instance.cookies.getAllCookieStores();
      return stores.filter(f => f.tabIds.includes(tab.id));
    },

    getAll: async (tab?: Tab, cbSuccess?: (cookies: Cookie[]) => void) => {
      const { instance } = await this.detect();

      const store = ((await this.cookie.storeIds(tab)?.[0]) ||
        {}) as CookieStore;

      const result: Cookie[] = await new Promise((resolve, _reject) =>
        instance.cookies.getAll({ storeId: store.id }, resolve)
      );

      if (tab) {
        const tabCookieDomains = this.cookie.genMatchingDomains(tab);
        const filtered = result.filter(f => {
          const isTabCookie = tabCookieDomains.includes(f.domain);
          return isTabCookie;
        });
        cbSuccess?.(filtered);
        return filtered;
      }
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
      const result: Tab[] = (await new Promise((resolve, _reject) =>
        instance.tabs.query(query, resolve)
      )) as unknown as Tab[];
      cbSuccess?.(result);
      return result;
    },

    getActiveTab: async (cbSuccess?: (tabs: Tab) => void) => {
      const result = await this.tab.getAll(noop, {
        active: true,
        currentWindow: true,
      });
      const tab = result?.[0];
      cbSuccess(tab);
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
