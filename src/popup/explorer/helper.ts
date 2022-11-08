import {
  AcceptedDataType,
  AllDataType,
  TreeViewProps,
} from 'lib-components/tree-view';
import { Cookie } from 'lib-models/browser';
import { checkItem } from 'lib-utils/common';
import { FormEvent } from 'react';

type TreeViewNodeItems = TreeViewProps['items'];

export const basicDt: AllDataType[] = ['string', 'number', 'bigint', 'boolean'];
export const containerDt: AllDataType[] = ['array', 'object'];

export const getValueByType = {
  array: () => [],
  object: () => ({}),
  string: (arg: any) => String(arg),
  number: (arg: any) => Number(arg),
  boolean: (arg: any) =>
    typeof arg === 'string' ? arg === 'true' : Boolean(arg),
};

export const isPrevNewPathSame = (prevPath?: string[], newPath?: string[]) => {
  if (newPath?.length === prevPath?.length) {
    return (
      newPath.length &&
      newPath.every(e => prevPath.includes(e)) &&
      prevPath.every(e => newPath.includes(e))
    );
  }
};

export function isBasicDataType(arg: any) {
  const ty = typeof arg;
  return (
    ty === 'string' || ty === 'number' || ty === 'boolean' || ty === 'bigint'
  );
}
function getDataType(m: any) {
  return (
    Array.isArray(m) ? 'array' : m === null ? 'null' : typeof m
  ) as AcceptedDataType;
}

function converter(
  obj: Record<string, any>,
  {
    parentDataType,
    path,
  }: { parentDataType?: AcceptedDataType; path: string[] }
) {
  if (checkItem.isNullOrUndefined(obj)) {
    return obj;
  } else if (Array.isArray(obj) && obj.length) {
    return obj
      .filter(f => !checkItem.isUndefined(f))
      .map((m, i) => {
        const typeofObjItem = getDataType(m);
        const newPath = [...path, String(i)];
        const items = isBasicDataType(m)
          ? {
              nodeName: m,
              data: {
                name: m,
                value: m,
                parentDataType: 'array',
                path: newPath,
              },
              dataType: typeofObjItem,
            }
          : converter(m, { parentDataType: typeofObjItem, path: newPath });
        const item = {
          nodeName: i,
          data: {
            name: i,
            value: m,
            parentDataType: 'array',
            path: newPath,
          },
          dataType: typeofObjItem,
          dataSubType: 'index',
          items,
        };
        return item;
      });
  } else if (typeof obj === 'object') {
    const items: TreeViewNodeItems = [];
    const keys = Object.keys(obj).sort();
    keys.forEach(key => {
      const el = obj[key];
      const dataType = getDataType(el);
      const newPath = [...path, key];
      const val = converter(el, {
        path: newPath,
        parentDataType: dataType,
      });

      items.push({
        nodeName: key,
        data: { name: key, value: el, parentDataType, path: newPath },
        dataType,
        items: typeof val === 'object' ? val : undefined,
      });
    });
    return items;
  } else {
    return obj;
  }
}

export function convertStorageToTreeNode(storageData = {}) {
  const parsed = {};
  const keys = Object.keys(storageData).sort();
  keys.forEach(key => {
    parsed[key] = storageData[key];
    try {
      parsed[key] = JSON.parse(storageData[key]);
    } catch (error) {
      console.error(error);
    }
  });
  const converted = converter(parsed, {
    parentDataType: 'object',
    path: [],
  });
  return { converted, parsed, originalData: storageData };
}

export function convertCookieToTreeNode(cookies: Cookie[] | Object) {
  let parsed = cookies;
  if (Array.isArray(cookies)) {
    parsed = {};
    for (const cookie of cookies) {
      parsed[cookie.name] = cookie.value;
      try {
        parsed[cookie.name] = JSON.parse(decodeURIComponent(cookie.value));
      } catch (error) {
        console.error(error);
      }
    }
  }
  const converted = converter(parsed, { parentDataType: 'object', path: [] });
  return { converted, parsed, originalData: cookies };
}

export function convertContentToStorage(content: any) {
  const keys = Object.keys(content);
  const changed = {};
  keys.forEach(key => {
    changed[key] = content[key];
    try {
      changed[key] = JSON.stringify(content[key]);
    } catch (error) {
      console.error(error);
    }
  });
  return changed;
}

export function convertContentToCookie(
  content: any,
  originalCookies: Cookie[]
) {
  const changed: Cookie[] = [];
  const keys = Object.keys(content);
  keys.forEach(cookieName => {
    const cookieValue = encodeURIComponent(JSON.stringify(content[cookieName]));
    // TODO: Find a way to track cookie, whose name gets changed
    const found = originalCookies.find(f => f.name === cookieName);
    if (found) {
      changed.push({
        ...found,
        value: cookieValue,
      });
    }
  });
  return changed;
}

export function stopDefaultEvent(e?: FormEvent) {
  e?.preventDefault();
  e?.stopPropagation();
}
