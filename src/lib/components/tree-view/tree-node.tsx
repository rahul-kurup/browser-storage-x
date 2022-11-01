import { useContext, useState } from 'react';
import Ctx from './context';
import UlView, {
  LabelCheckBox,
  LiNode,
  NodeText,
  TextContainer,
} from './style';
import { ExternalProps, NodeViewProps } from './type';

export default function TreeNode({
  uniqName: mainName,
  items: mainNodes,
  itemPath: mainItemPath,
  enableSelection = false,
  showGuidelines = true,
  nodeRenderer,
  ...mainProps
}: NodeViewProps & ExternalProps) {
  const [expanded, setExpanded] = useState([]);

  const { selections, setSelections } = useContext(Ctx);

  function handleExpansion(itemPath: string) {
    setExpanded(prev => {
      if (prev.includes(itemPath)) {
        return [...prev.filter(f => f !== itemPath)];
      }
      prev.push(itemPath);
      return [...prev];
    });
  }

  return (
    <UlView {...mainProps} data-item-id={mainItemPath}>
      {mainNodes.map(node => {
        const {
          uniqName: subName,
          items: subNodes,
          itemPath: subItemPath,
          ...subProps
        } = node;
        return (
          <LiNode
            {...subProps}
            key={subItemPath}
            data-item-id={subItemPath}
            enableSelection={enableSelection}
            showGuidelines={showGuidelines}
          >
            <TextContainer>
              {enableSelection && (
                <LabelCheckBox>
                  <input
                    id={subItemPath}
                    name={subItemPath}
                    type='checkbox'
                    checked={selections.includes(subItemPath)}
                    onChange={() => setSelections(subItemPath)}
                  />
                </LabelCheckBox>
              )}

              <NodeText
                hasItems={!!subNodes?.length}
                expanded={expanded.includes(subItemPath)}
                onClick={() => handleExpansion(subItemPath)}
              >
                {nodeRenderer ? nodeRenderer(node) : subName}
              </NodeText>
            </TextContainer>

            {subNodes?.length && expanded.includes(subItemPath) && (
              <TreeNode
                uniqName={subName}
                items={subNodes}
                itemPath={subItemPath}
                enableSelection={enableSelection}
                showGuidelines={showGuidelines}
              />
            )}
          </LiNode>
        );
      })}
    </UlView>
  );
}
