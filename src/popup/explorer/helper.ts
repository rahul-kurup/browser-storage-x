import { NodeWithIdProps, TreeViewProps } from 'lib-components/tree-view';
import { Cookie } from 'lib-models/browser';

type TreeViewNodeItems = TreeViewProps['items'];

export function isValueType(node: NodeWithIdProps) {
  return node.dataType !== 'array' && node.dataType !== 'object';
}

export function valueNodeHint(node: NodeWithIdProps, value = null) {
  return node.dataType === 'array'
    ? `Array (${node.items.length})`
    : node.dataType === 'object'
    ? 'Object'
    : value;
}

function converter(obj: Record<string, any>) {
  if (obj) {
    if (Array.isArray(obj) && obj.length) {
      return obj.map(converter);
    } else {
      if (typeof obj === 'object') {
        const items: TreeViewNodeItems = [];
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const el = obj[key];
            const val = converter(el);
            items.push({
              uniqName: key,
              data: [key, el],
              dataType: Array.isArray(el) ? 'array' : typeof el,
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
  return converter(parsedData);
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
      parsedData[cookie.name] = JSON.parse(cookie.value);
    } catch (error) {
      console.error(error);
    }
  }
  return converter(parsedData);
}

export function convertTreeNodeToCookie(nodeData: Cookie[]): Cookie[] {
  return nodeData.reduce((a, c) => (c ? [...a, c] : a), []);
}

export function stopActionDefEvent(e: any) {
  e.preventDefault();
  e.stopPropagation();
}
