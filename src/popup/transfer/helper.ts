import { TreeViewProps } from 'lib-components/tree-view';

export function convertStorageToTreeNode(data = {}): TreeViewProps['items'] {
  const keys = Object.keys(data);
  const nodeItems: TreeViewProps['items'] = [];
  keys.forEach(key => nodeItems.push({ name: key, data: [key, data[key]] }));
  return nodeItems;
}

export function convertTreeNodeToStorage(nodeData: [string, any]): {} {
 return  nodeData.reduce((a, [k, v]) => ({ ...a, [k]: v }), {});
}
