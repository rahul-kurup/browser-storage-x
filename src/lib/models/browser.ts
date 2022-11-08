export type Tab = Omit<chrome.tabs.Tab, 'status'> & {
  status: 'unloaded' | 'loading' | 'complete';
};

export type TabQueryInfo = chrome.tabs.QueryInfo;

export type Cookie = chrome.cookies.Cookie;

export type CookieSetInfo = chrome.cookies.SetDetails;

export type CookieRemoveInfo = chrome.cookies.Details;

export type CookieStore = chrome.cookies.CookieStore;

export type BrowserChrome = typeof chrome;

export type BrowserVendor = 'firefox' | 'chromium' | 'safari';
