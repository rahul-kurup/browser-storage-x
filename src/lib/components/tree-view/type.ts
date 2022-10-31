import { ComponentProps } from 'react';

export type NodeProps = {
  name: string;
  parentName?: string;
  nodes?: NodeProps[];
};

export type TreeProps = {
  name?: string;
  parentName?: string;
  nodes: NodeProps[];
};

export type TreeNodeProps = ComponentProps<'li'> & NodeProps;

export type TreeViewProps = ComponentProps<'ul'> & TreeProps;
