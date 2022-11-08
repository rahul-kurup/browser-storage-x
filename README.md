# StorageX

![StorageX logo](/src/assets/images/logo/128.png)

An all in one localstorage/sessionstorage/cookie manager browser extension for chrome based/firefox browsers.

## Features

### Share

- lets you copy localstorage/sessionstorage/cookies across different domains
- only pick items that you want to share
- search tabs by url or title of a tab

### Explorer

- tree view to explore JSON for localstorage/sessionstorage/cookies
- add/edit/delete values in the tree view itself
- custom editors for different data types
- search tabs by url or title of a tab

## Extension links

- Chrome - https://chrome.google.com/webstore/detail/storagex/pafddkhaocklakonboekmgodcmgmfcbp
- Firefox - https://addons.mozilla.org/en-US/firefox/addon/storagex/
- Edge - https://microsoftedge.microsoft.com/addons/detail/storagex/gamhkdfigfofibfjhkcamegmckfmnode

## Development Setup

- This project uses `yarn`, so make sure to have that globally installed
- Check package.json and use the correct "engines" version locally, which includes _node_ and _yarn_ versions
- Run `yarn install`. This will install packages and additionally create a _tmp_ profile folder
- Run `yarn build` to build the extension. The extension can be found in _dist\[BROWSER]_ directory. Install this locally in your browser
- Test the extension (StorageX) that in now available in your browser
