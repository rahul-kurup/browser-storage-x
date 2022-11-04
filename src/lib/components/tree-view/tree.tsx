import { useEffect, useMemo, useRef, useState } from 'react';
import Ctx from './context';
import {
  CONSTANTS,
  genNodes,
  getData,
  getItemsChildToParent,
  getItemsParentToChild,
} from './helper';
import { LabelCheckBox } from './style';
import TreeNode from './tree-node';
import { ExternalProps, NodeWithIdProps, TreeViewProps } from './type';

export default function Tree({
  uniqName = CONSTANTS.rootItemPath,
  items,
  onChecked,
  checkedItems,
  selectAllByDefault,
  ...props
}: TreeViewProps & ExternalProps) {
  const refMount = useRef(false);
  const [selections, setSelections] = useState(checkedItems || []);

  const nodeProps = useMemo(
    () => genNodes({ uniqName, items }),
    [uniqName, items]
  );

  function handleSelection(itemPath: string) {
    if (props.enableSelection) {
      setSelections(prev => {
        const p2c = getItemsParentToChild(
          itemPath,
          nodeProps as NodeWithIdProps
        );
        if (prev.includes(itemPath)) {
          const c2p = getItemsChildToParent(
            itemPath,
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
    if (
      props.enableSelection &&
      selectAllByDefault &&
      nodeProps &&
      !checkedItems
    ) {
      setSelections(
        getItemsParentToChild(
          CONSTANTS.rootItemPath,
          nodeProps as NodeWithIdProps
        )
      );
    }
  }, [selectAllByDefault, props.enableSelection, nodeProps, checkedItems]);

  useEffect(() => {
    if (props.enableSelection && refMount.current) {
      const selItems = [...selections].sort();
      const values = getData(selItems, nodeProps as NodeWithIdProps);
      onChecked?.(values);
    }
  }, [selections, props.enableSelection]);

  return (
    <>
      {props.enableSelection && (
        <LabelCheckBox>
          <input
            type='checkbox'
            id={nodeProps.uniqName}
            name={nodeProps.uniqName}
            checked={selections.includes(nodeProps.itemPath)}
            onChange={() => handleSelection(nodeProps.itemPath)}
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
