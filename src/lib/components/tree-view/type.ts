import { ComponentProps } from 'react';

export type SubDataType = 'index';

export type AllDataType =
  | 'string'
  | 'boolean'
  | 'number'
  | 'bigint'
  | 'undefined'
  | 'null'
  | 'symbol'
  | 'function'
  | 'array'
  | 'object'
  | SubDataType;

export type AcceptedDataType =
  | 'string'
  | 'boolean'
  | 'number'
  | 'bigint'
  | 'array'
  | 'object'
  | SubDataType;

export type NodeProps = {
  nodeName: string;
  items?: NodeProps[];
};

export type DataProps = {
  data?: any;
  dataType?: AcceptedDataType;
  dataSubType?: SubDataType;
};

export type NodeWithIdProps = DataProps & {
  itemPath: string;
  nodeName: string;
  parentItemPath?: string;
  items?: NodeWithIdProps[];
};

export type TreeViewProps = ComponentProps<'ul'> &
  DataProps & {
    nodeName?: string;
    items?: TreeViewProps[];
  };

export type NodeViewProps = ComponentProps<'ul'> & {
  nodeName?: string;
  itemPath: string;
  parentItemPath?: string;
  items: (ComponentProps<'li'> & NodeWithIdProps)[];
};

export type GenNodeArgs = {
  nodeName?: string;
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
  selectAllByDefault?: boolean;

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
  nodeRenderer?: (
    args: NodeWithIdProps,
    opts: { isExpanded: boolean; hasItems: boolean }
  ) => JSX.Element;
};
