import { useContext, useState } from 'react';
import Ctx from './context';
import UlView, {
  LabelCheckBox,
  LiNode,
  NodeText,
  TextContainer
} from './style';
import { ExternalProps, NodeViewProps } from './type';

export default function TreeNode({
  name: mainName,
  items: mainNodes,
  itemId: mainNodeId,
  enableSelection = false,
  showGuidelines = true,
  ...mainProps
}: NodeViewProps & ExternalProps) {
  const [expanded, setExpanded] = useState([]);

  const { selections, setSelections } = useContext(Ctx);

  function handleExpansion(itemId: string) {
    setExpanded(prev => {
      if (prev.includes(itemId)) {
        return [...prev.filter(f => f !== itemId)];
      }
      prev.push(itemId);
      return [...prev];
    });
  }

  return (
    <UlView {...mainProps} data-item-id={mainNodeId}>
      {mainNodes.map(
        ({
          name: subName,
          items: subNodes,
          itemId: subNodeId,
          ...subProps
        }) => {
          return (
            <LiNode
              {...subProps}
              key={subNodeId}
              data-item-id={subNodeId}
              enableSelection={enableSelection}
              showGuidelines={showGuidelines}
            >
              <TextContainer>
                {enableSelection && (
                  <LabelCheckBox>
                    <input
                      id={subNodeId}
                      name={subNodeId}
                      type='checkbox'
                      checked={selections.includes(subNodeId)}
                      onChange={() => setSelections(subNodeId)}
                    />
                  </LabelCheckBox>
                )}

                <NodeText
                  hasItems={!!subNodes?.length}
                  expanded={expanded.includes(subNodeId)}
                  onClick={() => handleExpansion(subNodeId)}
                >
                  {subName}
                </NodeText>
              </TextContainer>

              {subNodes?.length && expanded.includes(subNodeId) && (
                <TreeNode
                  name={subName}
                  items={subNodes}
                  itemId={subNodeId}
                  enableSelection={enableSelection}
                  showGuidelines={showGuidelines}
                />
              )}
            </LiNode>
          );
        }
      )}
    </UlView>
  );
}
