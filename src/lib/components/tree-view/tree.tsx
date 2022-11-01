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
  uniqName: name = CONSTANTS.rootItemPath,
  items,
  allSelectedByDefault,
  onChecked,
  ...props
}: TreeViewProps & ExternalProps) {
  const refMount = useRef(false);
  const [selections, setSelections] = useState([] as string[]);

  const nodeProps = useMemo(
    () => genNodes({ uniqName: name, items }),
    [name, items]
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
    if (props.enableSelection && allSelectedByDefault && nodeProps) {
      handleSelection(CONSTANTS.rootItemPath);
    }
  }, [allSelectedByDefault, props.enableSelection, nodeProps]);

  useEffect(() => {
    if (props.enableSelection && refMount.current) {
      const sels = [...selections].sort();
      const obj = getData(sels, nodeProps as NodeWithIdProps);
      onChecked?.(Object.values(obj));
    }
  }, [selections, props.enableSelection]);

  return (
    <>
      {props.enableSelection && (
        <LabelCheckBox>
          <input
            id={nodeProps.itemPath}
            name={nodeProps.itemPath}
            type='checkbox'
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
