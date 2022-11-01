import { GenNodeArgs, NodeViewProps, NodeWithIdProps } from './type';

export function genNodes({ name, items, parentItemId, ...rest }: GenNodeArgs) {
  let itemId = name;
  let mappedItems = items;

  if (parentItemId) {
    itemId = `${parentItemId}.${name}`.split(' ').join('_');
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
        _prevFindings.push(...findRelation(itemId, f));
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
      const split = itemId.split('.');
      _prevFindings.push(_nodeInfo.itemId);
      for (let i = 0; i < split.length; i++) {
        const parentId = split.slice(0, i + 1).join('.');
        _prevFindings.push(parentId);
      }
    } else {
      _nodeInfo.items?.forEach(f => {
        _prevFindings.push(...findRelation(itemId, f));
      });
    }
    return _prevFindings;
  }

  const prevFindings = findRelation(itemId, nodeInfo);

  return [...new Set(prevFindings)];
}
