import { StorageType } from "../model/storage";

export function getAllItems(storageType: StorageType) {
  const obj = {};
  const storage = storageType === "local" ? localStorage : sessionStorage;
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    obj[key] = storage.getItem(key);
  }
  return obj;
}

export function setAllItems(storageType: StorageType, data: any) {
  const storage = storageType === "local" ? localStorage : sessionStorage;
  const keys = Object.keys(data);
  keys.forEach((key) => {
    storage.setItem(key, data[key]);
  });
}
