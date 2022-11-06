import { TreeViewProps } from 'lib-components/tree-view';
import { Cookie } from 'lib-models/browser';
import { SelectProps } from '@mantine/core';

type TreeViewNodeItems = TreeViewProps['items'];

export function convertStorageToTreeNode(data = {}) {
  const keys = Object.keys(data);
  const nodeItems: TreeViewNodeItems = [];
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

export function convertCookieToTreeNode(cookies: Cookie[]) {
  const nodeItems: TreeViewNodeItems = [];
  cookies.forEach(cookie =>
    nodeItems.push({
      uniqName: `${cookie.name}@${cookie.domain}`,
      data: cookie,
    })
  );
  return nodeItems;
}

export function convertTreeNodeToCookie(nodeData: Cookie[]): Cookie[] {
  return nodeData.reduce((a, c) => (c ? [...a, c] : a), []);
}

export const filterFn: SelectProps['filter'] = (value, item) => {
  let inUrl = false,
    inTitle = false;
  inUrl = item?.data?.url
    ?.toLowerCase()
    .trim()
    .includes(value.toLowerCase().trim());
  if (!inUrl) {
    inTitle = item.label
      .toLowerCase()
      .trim()
      .includes(value.toLowerCase().trim());
  }
  return inUrl || inTitle;
};
