import { TreeViewProps } from 'lib-components/tree-view';
import { Cookie } from 'lib-models/browser';

export function convertStorageToTreeNode(data = {}): TreeViewProps['items'] {
  const keys = Object.keys(data);
  const nodeItems: TreeViewProps['items'] = [];
  keys.forEach(key =>
    nodeItems.push({ uniqName: key, data: [key, data[key]] })
  );
  return nodeItems;
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

export function convertCookieToTreeNode(
  cookies: Cookie[]
): TreeViewProps['items'] {
  const nodeItems: TreeViewProps['items'] = [];
  cookies.forEach(cookie =>
    nodeItems.push({
      uniqName: `${cookie.name} (${cookie.domain})`,
      data: cookie,
    })
  );
  return nodeItems;
}

export function convertTreeNodeToCookie(nodeData: Cookie[]): Cookie[] {
  return nodeData.reduce((a, c) => (c ? [...a, c] : a), []);
}
