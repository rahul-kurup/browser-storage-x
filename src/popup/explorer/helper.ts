import { AcceptedDataType, TreeViewProps } from 'lib-components/tree-view';
import { Cookie } from 'lib-models/browser';
import { checkItem } from 'lib-utils/common';
import { FormEvent } from 'react';
import { ExplorerState, ParentIdArgs } from './type';

type TreeViewNodeItems = TreeViewProps['items'];

export const emptyDt: AcceptedDataType[] = ['null'];
export const basicDt: AcceptedDataType[] = [
  'string',
  'number',
  'bigint',
  'boolean',
];
export const containerDt: AcceptedDataType[] = ['array', 'object'];

export const getValueByType: Record<
  Exclude<AcceptedDataType, 'index'>,
  (arg: any) => void
> = {
  array: () => [],
  object: () => ({}),
  null: (arg: any) => String(arg),
  string: (arg: any) => String(arg),
  number: (arg: any) => Number(arg),
  bigint: (arg: any) => BigInt(arg),
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
  obj: any,
  { dataType: parentDataType, path: parentPath }: ParentIdArgs = {
    dataType: 'object',
    path: [],
  }
) {
  if (checkItem.isNullOrUndefined(obj)) {
    return obj;
  } else if (Array.isArray(obj) && obj.length) {
    return obj
      .filter(f => !checkItem.isUndefined(f))
      .map((m, i) => {
        const typeofObjItem = getDataType(m);
        const newPath = [...parentPath, String(i)];
        const items = isBasicDataType(m)
          ? {
              nodeName: m,
              data: {
                name: m,
                value: m,
                dataType: 'array',
                path: newPath,
              },
              dataType: typeofObjItem,
            }
          : converter(m, { dataType: typeofObjItem, path: newPath });
        const item = {
          nodeName: i,
          data: {
            name: i,
            value: m,
            dataType: 'array',
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
      const newPath = [...parentPath, key];
      const val = converter(el, {
        path: newPath,
        dataType,
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

export function convertStorageToTreeNode(originalData = {}) {
  const parsed = {};
  const keys = Object.keys(originalData).sort();
  keys.forEach(key => {
    const keyValue = originalData[key];
    parsed[key] = keyValue;
    try {
      parsed[key] = JSON.parse(keyValue);
    } catch (error) {
      console.error(error);
    }
  });
  const converted = converter(parsed);
  return { converted, parsed, originalData };
}

export function convertCookieToTreeNode(originalData: Cookie[] | Object) {
  let parsed = originalData;
  if (Array.isArray(originalData)) {
    parsed = {};
    for (const cookie of originalData) {
      const { name, value } = cookie;
      parsed[name] = value;
      try {
        parsed[name] = JSON.parse(decodeURIComponent(value));
      } catch (error) {
        console.error(error);
      }
    }
  }
  const converted = converter(parsed);
  return { converted, parsed, originalData };
}

export function convertContentToStorage(content: any) {
  const keys = Object.keys(content);
  const changed = {};
  keys.forEach(key => {
    const value = content[key];
    changed[key] = value;
    try {
      changed[key] = typeof value === 'object' ? JSON.stringify(value) : value;
    } catch (error) {
      console.error(error);
    }
  });
  return changed;
}

export function convertContentToCookie(
  content: any,
  originalCookies: Cookie[],
  changes: ExplorerState['changes']
) {
  const changed: Cookie[] = [];
  const keys = Object.keys(content);
  const findOrigCookie = (name: string) =>
    originalCookies.find(f => f.name === name);

  keys.forEach(cookieName => {
    const cookieValue = encodeURIComponent(JSON.stringify(content[cookieName]));
    // TODO: Find a better way to track cookie, whose name gets changed
    let found = findOrigCookie(cookieName);

    if (!found) {
      const foundOldCookieName = changes[cookieName];
      if (foundOldCookieName) {
        found = findOrigCookie(foundOldCookieName);
      }
    }

    if (found) {
      changed.push({
        ...found,
        name: cookieName,
        value: cookieValue,
      });
    } else {
      console.error(
        `COOKIE_NOT_FOUND: Didn't find '${cookieName}' to match with in the original cookie data`
      );
    }
  });
  return changed;
}

export function stopDefaultEvent(e?: FormEvent) {
  e?.preventDefault();
  e?.stopPropagation();
}
