import {
  AcceptedDataType,
  NodeWithIdProps,
  TreeViewProps,
} from 'lib-components/tree-view';
import { Cookie } from 'lib-models/browser';

type TreeViewNodeItems = TreeViewProps['items'];

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
  { parentDataType, path }: { parentDataType?: AcceptedDataType; path: string }
) {
  if (obj) {
    if (Array.isArray(obj) && obj.length) {
      return obj.map((m, i) => {
        const newPath = `${path}[${i}]`;
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
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const el = obj[key];
            const dataType = (
              Array.isArray(el) ? 'array' : typeof el
            ) as AcceptedDataType;
            const newPath = { path: `${path ? `${path}.` : ''}${key}` };
            const val = converter(el, {
              ...newPath,
              parentDataType: dataType,
            });
            items.push({
              uniqName: key,
              data: { name: key, value: el, parentDataType, ...newPath },
              dataType: (Array.isArray(el)
                ? 'array'
                : typeof el) as AcceptedDataType,
              items: typeof val === 'object' ? val : undefined,
            });
          }
        }
        return items;
      }
      return obj;
    }
  }
  return obj;
}

export function convertStorageToTreeNode(storageData = {}) {
  const parsedData = {};
  for (const key in storageData) {
    if (Object.prototype.hasOwnProperty.call(storageData, key)) {
      parsedData[key] = storageData[key];
      try {
        parsedData[key] = JSON.parse(storageData[key]);
      } catch (error) {
        console.error(error);
      }
    }
  }
  const x = converter(parsedData, { parentDataType: 'object', path: '' });
  console.log(x);
  return x;
}

export function convertTreeNodeToStorage(nodeData: [string, any][]): {} {
  return nodeData.reduce((a, c) => {
    if (c) {
      const [k, v] = c;
      return { ...a, [k]: v };
    }
    return a;
  }, {});
}

export function convertCookieToTreeNode(cookies: Cookie[]) {
  const parsedData = {};
  for (const cookie of cookies) {
    parsedData[cookie.name] = cookie.value;
    try {
      parsedData[cookie.name] = JSON.parse(decodeURIComponent(cookie.value));
    } catch (error) {
      console.error(error);
    }
  }
  return converter(parsedData, { parentDataType: 'object', path: '' });
}

export function convertTreeNodeToCookie(nodeData: Cookie[]): Cookie[] {
  return nodeData.reduce((a, c) => (c ? [...a, c] : a), []);
}

export function stopActionDefEvent(e: any) {
  e.preventDefault();
  e.stopPropagation();
}
