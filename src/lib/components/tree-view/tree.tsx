import { useMemo, useState } from 'react';
import Ctx from './context';
import {
  genNodes,
  getItemsChildToParent,
  getItemsParentToChild
} from './helper';
import { LabelCheckBox } from './style';
import TreeNode from './tree-node';
import { ExternalProps, NodeWithIdProps, TreeViewProps } from './type';

export default function Tree({
  name = 'root',
  items,
  ...props
}: TreeViewProps & ExternalProps) {
  const [selections, setSelections] = useState([] as string[]);

  const nodeProps = useMemo(() => genNodes({ name, items }), [name, items]);

  function handleSelection(itemId: string) {
    setSelections(prev => {
      const p2c = getItemsParentToChild(itemId, nodeProps as NodeWithIdProps);
      if (prev.includes(itemId)) {
        const c2p = getItemsChildToParent(itemId, nodeProps as NodeWithIdProps);
        const toRemove = [...new Set([...p2c, ...c2p])];
        return [...prev.filter(f => !toRemove.includes(f))];
      }

      prev.push(...p2c);

      return [...prev];
    });
  }

  return (
    <Ctx.Provider value={{ selections, setSelections: handleSelection }}>
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

      <TreeNode {...props} {...nodeProps} />
    </Ctx.Provider>
  );
}
