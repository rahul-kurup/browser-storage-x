import { useEffect, useMemo, useRef, useState } from 'react';
import Ctx from './context';
import {
  CONSTANTS,
  genNodes,
  getData,
  getItemsChildToParent,
  getItemsParentToChild
} from './helper';
import { LabelCheckBox } from './style';
import TreeNode from './tree-node';
import { ExternalProps, NodeWithIdProps, TreeViewProps } from './type';

export default function Tree({
  name = CONSTANTS.rootItemId,
  items,
  allSelectedByDefault,
  onChecked,
  ...props
}: TreeViewProps & ExternalProps) {
  const refMount = useRef(false);
  const [selections, setSelections] = useState([] as string[]);

  const nodeProps = useMemo(() => genNodes({ name, items }), [name, items]);

  function handleSelection(itemId: string) {
    if (props.enableSelection) {
      setSelections(prev => {
        const p2c = getItemsParentToChild(itemId, nodeProps as NodeWithIdProps);
        if (prev.includes(itemId)) {
          const c2p = getItemsChildToParent(
            itemId,
            nodeProps as NodeWithIdProps
          );
          const toRemove = [...new Set([...p2c, ...c2p])];
          return [...prev.filter(f => !toRemove.includes(f))];
        }
        prev.push(...p2c);
        return [...new Set(prev)];
      });
    }
  }

  useEffect(() => {
    refMount.current = true;
  }, []);

  useEffect(() => {
    if (props.enableSelection && allSelectedByDefault) {
      handleSelection(CONSTANTS.rootItemId);
    }
  }, [allSelectedByDefault, props.enableSelection]);

  useEffect(() => {
    if (props.enableSelection && refMount.current) {
      const sels = [...selections].sort();
      const obj = getData(sels, nodeProps as NodeWithIdProps);
      onChecked?.(Object.values(obj))
    }
  }, [selections, props.enableSelection]);

  return (
    <>
      {props.enableSelection && (
        <LabelCheckBox>
          <input
            id={nodeProps.itemId}
            name={nodeProps.itemId}
            type='checkbox'
            checked={selections.includes(nodeProps.itemId)}
            onChange={() => handleSelection(nodeProps.itemId)}
          />
          All
        </LabelCheckBox>
      )}

      <Ctx.Provider value={{ selections, setSelections: handleSelection }}>
        <TreeNode {...props} {...nodeProps} />
      </Ctx.Provider>
    </>
  );
}
