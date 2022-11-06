import {
  AcceptedDataType,
  NodeWithIdProps,
  TreeViewProps,
} from 'lib-components/tree-view';
import { Cookie } from 'lib-models/browser';

type TreeViewNodeItems = TreeViewProps['items'];

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

export function isValueType(node?: NodeWithIdProps) {
  return node?.dataType !== 'array' && node?.dataType !== 'object';
}

export function isBasicDataType(arg: any) {
  const ty = typeof arg;
  return (
    ty === 'string' || ty === 'number' || ty === 'boolean' || ty === 'bigint'
  );
}

function converter(
  obj: Record<string, any>,
  {
    parentDataType,
    path,
  }: { parentDataType?: AcceptedDataType; path: string[] }
) {
  if (obj) {
    if (Array.isArray(obj) && obj.length) {
      return obj.map((m, i) => {
        const newPath = [...path, String(i)];
        return isBasicDataType(m)
          ? {
              uniqName: m,
              data: { name: m, value: m, parentDataType, path: newPath },
              dataType: typeof m,
            }
          : converter(m, { parentDataType, path: newPath });
      });
    } else {
      if (typeof obj === 'object') {
        const items: TreeViewNodeItems = [];
        const keys = Object.keys(obj).sort();
        keys.forEach(key => {
          const el = obj[key];
          const dataType = (
            Array.isArray(el) ? 'array' : typeof el
          ) as AcceptedDataType;
          const newPath = [...path, key];
          const val = converter(el, {
            path: newPath,
            parentDataType: dataType,
          });
          items.push({
            uniqName: key,
            data: { name: key, value: el, parentDataType, path: newPath },
            dataType: (Array.isArray(el)
              ? 'array'
              : typeof el) as AcceptedDataType,
            items: typeof val === 'object' ? val : undefined,
          });
        });
        return items;
      }
      return obj;
    }
  }
  return obj;
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
    changed.push({
      ...found,
      value: cookieValue,
    });
  });
  return changed;
}

export function stopActionDefEvent(e: any) {
  e.preventDefault();
  e.stopPropagation();
}
