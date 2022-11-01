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
  return nodeData.reduce((a, [k, v]) => ({ ...a, [k]: v }), {});
}

export function convertCookieToTreeNode(
  cookies: Cookie[]
): TreeViewProps['items'] {
  const nodeItems: TreeViewProps['items'] = [];
  cookies.forEach(cookie =>
    nodeItems.push({ uniqName: cookie.name, data: cookie })
  );
  return nodeItems;
}

export function convertTreeNodeToCookie(nodeData: Cookie[]): {} {
  return nodeData.reduce((a, c) => [...a, c], []);
}
