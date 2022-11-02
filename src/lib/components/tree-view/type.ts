import { ComponentProps } from 'react';

export type NodeProps = {
  uniqName: string;
  items?: NodeProps[];
};

export type DataProps = {
  data?: any;
  dataType?:
    | 'string'
    | 'boolean'
    | 'number / bigint'
    | 'undefined / null'
    | 'array'
    | 'object';
};

export type NodeWithIdProps = DataProps & {
  itemPath: string;
  uniqName: string;
  parentItemPath?: string;
  items?: NodeWithIdProps[];
};

export type TreeViewProps = ComponentProps<'ul'> &
  DataProps & {
    uniqName?: string;
    items?: TreeViewProps[];
  };

export type NodeViewProps = ComponentProps<'ul'> & {
  uniqName?: string;
  itemPath: string;
  parentItemPath?: string;
  items: (ComponentProps<'li'> & NodeWithIdProps)[];
};

export type GenNodeArgs = {
  uniqName?: string;
  parentItemPath?: string;
  items?: GenNodeArgs[];
};

export type ExternalProps = {
  /** @default false */
  enableSelection?: boolean;

  /**
   * @default false
   *
   * @description Selects all tree elements by default. Works only when _enableSelection_ is `true`
   * */
  allSelectedByDefault?: boolean;

  checkedItems?: string[];

  /**
   *
   * @description Event fires when tree nodes are checked. Works only when _enableSelection_ is `true`
   * */
  onChecked?: (args: Record<string, any>) => void;

  /** @default true */
  showGuidelines?: boolean;

  /**
   * custom node renderer
   */
  nodeRenderer?: (args: NodeWithIdProps) => JSX.Element;
};
