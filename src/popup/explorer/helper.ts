import { IconBallpen, IconPlus, IconTrashX } from '@tabler/icons';
import {
  AcceptedDataType,
  CONSTANTS,
  TreeViewProps,
} from 'lib-components/tree-view';
import { Cookie } from 'lib-models/browser';
import { checkItem } from 'lib-utils/common';
import { FormEvent } from 'react';
import { ExplorerState, ParentIdArgs } from './type';

export const actionBtnProps = {
  add: {
    color: 'green',
    title: 'Add',
    Icon: IconPlus,
  },
  update: {
    color: 'blue',
    title: 'Edit',
    Icon: IconBallpen,
  },
  remove: {
    color: 'red',
    title: 'Delete',
    Icon: IconTrashX,
  },
};

type TreeViewNodeItems = TreeViewProps['items'];

export const emptyDt: AcceptedDataType[] = ['null'];
export const primitiveDt: AcceptedDataType[] = [
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

export function isPrimitiveDataType(arg: any) {
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
        const items = isPrimitiveDataType(m)
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
    for (const cookie of originalData as Cookie[]) {
      const { name, path, domain, storeId, value } = cookie;
      const key = [name /*, path, domain, storeId */].join(
        CONSTANTS.separator.cookieKey
      );
      parsed[key] = value;
      try {
        const decoded = decodeURIComponent(value);
        const decodedObj = JSON.parse(decoded);
        parsed[key] =
          decodedObj && typeof decodedObj === 'object' ? decodedObj : value;
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
    // TODO: Find a better way to track cookie, whose name gets changed
    let found = findOrigCookie(cookieName);

    if (!found) {
      const foundOldCookieName = changes[cookieName];
      if (foundOldCookieName) {
        found = findOrigCookie(foundOldCookieName);
      }
    }

    if (found) {
      let cookieValue = content[cookieName];
      if (cookieValue && typeof cookieValue === 'object') {
        cookieValue = encodeURIComponent(JSON.stringify(cookieValue));
      }

      changed.push({
        ...found,
        name: cookieName,
        value: cookieValue,
      });
    } else {
      console.error(
        `NOT_FOUND: Didn't find '${cookieName}' to match with in the original cookie data`
      );
    }
  });
  return changed;
}

export function stopDefaultEvent(e?: FormEvent) {
  e?.preventDefault();
  e?.stopPropagation();
}
