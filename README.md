![StorageX logo](social/assets/img/logo/128.png)

# <u>StorageX</u>

An all-in-one localStorage/sessionStorage/cookie manager browser extension for Chrome/Edge/Firefox browser.


[![ko-fi](https://img.shields.io/static/v1?label=buy%20me%20a&message=ko-fi&color=ff5f5f)](https://ko-fi.com/rahulkurup)

## <u>Extension</u>

| Link | Stars | Users |
| -------- | ------- | ----- |
|  [![Chrome](https://img.shields.io/chrome-web-store/v/pafddkhaocklakonboekmgodcmgmfcbp)](https://chrome.google.com/webstore/detail/storagex/pafddkhaocklakonboekmgodcmgmfcbp) | ![](https://img.shields.io/chrome-web-store/stars/pafddkhaocklakonboekmgodcmgmfcbp) | ![](https://img.shields.io/chrome-web-store/users/pafddkhaocklakonboekmgodcmgmfcbp) |
| [![Firefox](https://img.shields.io/amo/v/storagex)](https://addons.mozilla.org/en-US/firefox/addon/storagex/)  | ![](https://img.shields.io/amo/stars/storagex) | ![](https://img.shields.io/amo/users/storagex) |
| [![Edge](https://img.shields.io/static/v1?label=edge%20add-on&message=v0.0.12&color=black)](https://microsoftedge.microsoft.com/addons/detail/storagex/gamhkdfigfofibfjhkcamegmckfmnode)| ![](https://img.shields.io/static/v1?label=stars&message=0&color=black) | ![](https://img.shields.io/static/v1?label=users&message=7&color=black) |


## <u>Features</u>

### Share

- Lets you copy localstorage/sessionstorage/cookies across different domains
- Only pick items that you want to share
- Search tabs by url or title of a tab

### Explorer

- Tree view to explore JSON for localstorage/sessionstorage/cookies
- Add/edit/delete values in the tree view itself
- Custom editors for different data types
- Search tabs by url or title of a tab

## <u>Development Setup</u>

- This project uses `yarn`, so make sure to have that globally installed
- Check package.json and use the correct "engines" version locally, which includes _node_ and _yarn_ versions
- Run `yarn install`. This will install packages and additionally create a _tmp_ profile folder
- Run `yarn build` to build the extension. The extension can be found in _dist/[BROWSER]_ directory. Install this locally in your browser
- Test the extension (StorageX) that in now available to you
