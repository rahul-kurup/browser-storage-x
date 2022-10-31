import { useState } from 'react';
import View, { Node, NodeChkBx, NodeLabel, NodeLabelContainer } from './style';
import { TreeNodeProps, TreeViewProps } from './type';

function NodeView({ name, nodes, parentName, ...props }: TreeNodeProps) {
  let nodeId = name;
  const [expanded, setExpanded] = useState(false);

  if (parentName) {
    nodeId = `${parentName}.${name}`.split(' ').join('_');
  }

  return (
    <Node {...props} data-node-id={nodeId}>
      <NodeLabelContainer>
        <NodeChkBx>
          <input type='checkbox' name={nodeId} id={nodeId} />
        </NodeChkBx>

        <NodeLabel onClick={() => setExpanded(s => !s)}>{name}</NodeLabel>
      </NodeLabelContainer>

      {nodes?.length && expanded && (
        <TreeView
          name={name}
          parentName={nodeId}
          nodes={nodes}
          style={{ marginLeft: 15 }}
        />
      )}
    </Node>
  );
}

function TreeView({ nodes, parentName, ...props }: TreeViewProps) {
  return (
    <View {...props}>
      {nodes.map(m => (
        <NodeView key={m.name} {...m} parentName={parentName} />
      ))}
    </View>
  );
}

export default TreeView;
