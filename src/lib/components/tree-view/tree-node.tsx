import { withImg } from 'lib-utils/common';
import { useContext, useState } from 'react';
import Ctx from './context';
import UlView, {
  ImgIcon,
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

        const hasItems = Boolean(subNodes?.length);
        const isExpanded = expanded.includes(subItemPath);

        return (
          <LiNode
            {...subProps}
            key={subItemPath}
            data-item-id={subItemPath}
            aria-expanded={isExpanded}
            showGuidelines={showGuidelines}
            enableSelection={enableSelection}
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
                hasItems={hasItems}
                expanded={isExpanded}
                onClick={() => handleExpansion(subItemPath)}
              >
                {hasItems && (
                  <ImgIcon
                    alt=''
                    src={withImg(
                      `arrowhead-${isExpanded ? 'down' : 'right'}.png`
                    )}
                  />
                )}
                {nodeRenderer?.(node, { isExpanded, hasItems }) || subName}
              </NodeText>
            </TextContainer>

            {hasItems && isExpanded && (
              <TreeNode
                items={subNodes}
                uniqName={subName}
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
