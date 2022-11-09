import Storages, { StorageType } from '../models/storage';

export function getAllItems(
  storageType: StorageType
): Record<string, string> | undefined {
  try {
    const obj = {};
    const storage = storageType === 'local' ? localStorage : sessionStorage;
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      obj[key] = storage.getItem(key);
    }
    return obj;
  } catch (error) {
    console.error('get', error);
  }
  return undefined;
}

export function setAllItems(storageType: StorageType, data: any) {
  try {
    const storage = storageType === 'local' ? localStorage : sessionStorage;
    const keys = Object.keys(data);
    keys.forEach(key => {
      storage.setItem(key, data[key]);
    });
  } catch (error) {
    console.error('set', error);
  }
}

export const StorageTypeList = Object.keys(Storages).reduce(
  (a, c) => [...a, { label: c, value: Storages[c] }],
  []
);

export const isCookieType = (storage: StorageType) => storage === 'cookie';
