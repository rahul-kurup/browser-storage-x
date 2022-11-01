import { GenNodeArgs, NodeViewProps, NodeWithIdProps } from './type';

export const CONSTANTS = {
  separator: { itemId: '§' },
  rootItemId: 'root',
};

export function genNodes({ name, items, parentItemId, ...rest }: GenNodeArgs) {
  let itemId = name;
  let mappedItems = items;

  if (parentItemId) {
    itemId = `${parentItemId}${CONSTANTS.separator.itemId}${name}`
      .split(' ')
      .join('_');
  }

  if (items?.length) {
    mappedItems = items.map(m => genNodes({ ...m, parentItemId: itemId }));
  }

  return {
    ...rest,
    name,
    itemId,
    parentItemId,
    items: mappedItems,
  } as NodeViewProps;
}

export function getItemsParentToChild(
  itemId: string,
  nodeInfo: NodeWithIdProps
) {
  function findRelation(
    _itemId: string,
    _nodeInfo: NodeWithIdProps,
    _prevFindings: string[] = []
  ) {
    if (_nodeInfo.itemId === _itemId) {
      _prevFindings.push(_nodeInfo.itemId);
      _nodeInfo.items?.forEach(f => {
        _prevFindings.push(f.itemId);
        _prevFindings.push(...findRelation(f.itemId, f));
      });
    } else {
      _nodeInfo.items?.forEach(f => {
        _prevFindings.push(...findRelation(_itemId, f));
      });
    }

    return _prevFindings;
  }

  const prevFindings = findRelation(itemId, nodeInfo);

  return [...new Set(prevFindings)];
}

export function getItemsChildToParent(
  itemId: string,
  nodeInfo: NodeWithIdProps
) {
  function findRelation(
    _itemId: string,
    _nodeInfo: NodeWithIdProps,
    _prevFindings: string[] = []
  ) {
    if (_nodeInfo.itemId === _itemId) {
      const split = itemId.split(CONSTANTS.separator.itemId);
      _prevFindings.push(_nodeInfo.itemId);
      for (let i = 0; i < split.length; i++) {
        const parentId = split.slice(0, i + 1).join(CONSTANTS.separator.itemId);
        _prevFindings.push(parentId);
      }
    } else {
      _nodeInfo.items?.forEach(f => {
        _prevFindings.push(...findRelation(_itemId, f));
      });
    }
    return _prevFindings;
  }

  const prevFindings = findRelation(itemId, nodeInfo);

  return [...new Set(prevFindings)];
}

export function getData(itemIds: string[], nodeInfo: NodeWithIdProps) {
  const prevFindings = {};

  function findData(_itemId: string, _info: NodeWithIdProps) {
    if (_info.itemId === _itemId) {
      prevFindings[_itemId] = _info.data;
    } else {
      _info.items?.forEach(item => {
        findData(_itemId, item);
      });
    }
  }

  itemIds.forEach(itemId => {
    findData(itemId, nodeInfo);
  });

  return prevFindings;
}
