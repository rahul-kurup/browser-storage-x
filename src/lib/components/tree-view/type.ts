import { ComponentProps } from 'react';

export type NodeProps = {
  name: string;
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
  itemId: string;
  name: string;
  parentItemId?: string;
  items?: NodeWithIdProps[];
};

export type TreeViewProps = ComponentProps<'ul'> &
  DataProps & {
    name?: string;
    items?: TreeViewProps[];
  };

export type NodeViewProps = ComponentProps<'ul'> & {
  name?: string;
  itemId: string;
  parentItemId?: string;
  items: (ComponentProps<'li'> & NodeWithIdProps)[];
};

export type GenNodeArgs = {
  name?: string;
  parentItemId?: string;
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

  /**
   * @default false
   *
   * @description Event fires when tree nodes are checked. Works only when _enableSelection_ is `true`
   * */
  onChecked?: (args: string[]) => void;

  /** @default true */
  showGuidelines?: boolean;
};
