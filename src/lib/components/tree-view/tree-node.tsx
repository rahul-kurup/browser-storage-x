import { useColorScheme } from '@mantine/hooks';
import { IconArrowDownRight, IconArrowRight } from '@tabler/icons';
import { useContext, useState } from 'react';
import Ctx from './context';
import UlView, {
  LabelCheckBox,
  LiNode,
  NodeWrapper,
  TextContainer,
} from './style';
import { ExternalProps, NodeViewProps } from './type';

export default function TreeNode({
  nodeName: mainName,
  items: mainNodes,
  itemPath: mainItemPath,
  enableSelection = false,
  showGuidelines = true,
  nodeRenderer,
  ...mainProps
}: NodeViewProps & ExternalProps) {
  const [expanded, setExpanded] = useState([]);
  const colorScheme = useColorScheme();

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
          nodeName: subName,
          items: subNodes,
          itemPath: subItemPath,
          ...subProps
        } = node;

        const hasItems = Boolean(subNodes?.length);
        const isExpanded = expanded.includes(subItemPath);

        return (
          <LiNode
            {...subProps}
            expanded={isExpanded}
            key={subItemPath}
            hasItems={hasItems}
            data-item-id={subItemPath}
            aria-expanded={isExpanded}
            showGuidelines={showGuidelines}
            enableSelection={enableSelection}
          >
            <TextContainer isColorSchemeDark={colorScheme === 'dark'}>
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

              <NodeWrapper
                hasItems={hasItems}
                expanded={isExpanded}
                onClick={() => handleExpansion(subItemPath)}
              >
                {hasItems && (
                  <>
                    {isExpanded ? (
                      <IconArrowDownRight size={15} />
                    ) : (
                      <IconArrowRight size={15} />
                    )}
                  </>
                )}
                {nodeRenderer?.(node, { isExpanded, hasItems }) || subName}
              </NodeWrapper>
            </TextContainer>

            {hasItems && isExpanded && (
              <TreeNode
                items={subNodes}
                nodeName={subName}
                itemPath={subItemPath}
                nodeRenderer={nodeRenderer}
                showGuidelines={showGuidelines}
                enableSelection={enableSelection}
              />
            )}
          </LiNode>
        );
      })}
    </UlView>
  );
}
