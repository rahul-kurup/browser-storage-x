import { GenNodeArgs, NodeViewProps, NodeWithIdProps } from './type';

export const CONSTANTS = {
  separator: { itemPath: '§' },
  rootItemPath: 'root',
};

export function genNodes({
  nodeName: name,
  items,
  parentItemPath,
  ...rest
}: GenNodeArgs) {
  let itemPath = name;
  let mappedItems = items;

  if (parentItemPath) {
    itemPath = `${parentItemPath}${CONSTANTS.separator.itemPath}${name}`
      .split(' ')
      .join('_');
  }

  if (items?.length) {
    mappedItems = items.map(m => genNodes({ ...m, parentItemPath: itemPath }));
  }

  return {
    ...rest,
    nodeName: name,
    itemPath,
    parentItemPath,
    items: mappedItems,
  } as NodeViewProps;
}

export function getItemsParentToChild(
  itemPath: string,
  nodeInfo: NodeWithIdProps
) {
  function findRelation(
    _itemPath: string,
    _nodeInfo: NodeWithIdProps,
    _prevFindings: string[] = []
  ) {
    if (_nodeInfo.itemPath === _itemPath) {
      _prevFindings.push(_nodeInfo.itemPath);
      _nodeInfo.items?.forEach(f => {
        _prevFindings.push(f.itemPath);
        _prevFindings.push(...findRelation(f.itemPath, f));
      });
    } else {
      _nodeInfo.items?.forEach(f => {
        _prevFindings.push(...findRelation(_itemPath, f));
      });
    }

    return _prevFindings;
  }

  const prevFindings = findRelation(itemPath, nodeInfo);

  return [...new Set(prevFindings)];
}

export function getItemsChildToParent(
  itemPath: string,
  nodeInfo: NodeWithIdProps
) {
  function findRelation(
    _itemPath: string,
    _nodeInfo: NodeWithIdProps,
    _prevFindings: string[] = []
  ) {
    if (_nodeInfo.itemPath === _itemPath) {
      const split = itemPath.split(CONSTANTS.separator.itemPath);
      _prevFindings.push(_nodeInfo.itemPath);
      for (let i = 0; i < split.length; i++) {
        const parentId = split
          .slice(0, i + 1)
          .join(CONSTANTS.separator.itemPath);
        _prevFindings.push(parentId);
      }
    } else {
      _nodeInfo.items?.forEach(f => {
        _prevFindings.push(...findRelation(_itemPath, f));
      });
    }
    return _prevFindings;
  }

  const prevFindings = findRelation(itemPath, nodeInfo);

  return [...new Set(prevFindings)];
}

export function getData(itemPaths: string[], nodeInfo: NodeWithIdProps) {
  const prevFindings = {};

  function findData(_itemPath: string, _info: NodeWithIdProps) {
    if (_info.itemPath === _itemPath) {
      prevFindings[_itemPath] = _info.data;
    } else {
      _info.items?.forEach(item => {
        findData(_itemPath, item);
      });
    }
  }

  itemPaths.forEach(itemPath => {
    findData(itemPath, nodeInfo);
  });

  return prevFindings;
}
