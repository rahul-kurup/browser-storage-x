export type Tab = Omit<chrome.tabs.Tab, 'status'> & {
  status: 'unloaded' | 'loading' | 'complete';
};

export type Cookie = chrome.cookies.Cookie;

export type CookieSetInfo = chrome.cookies.SetDetails;

export type Browser = typeof chrome;
