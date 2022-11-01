import { ComponentProps } from 'react';

export type NodeProps = {
  name: string;
  items?: NodeProps[];
};

export type NodeWithIdProps = {
  itemId: string;
  name: string;
  parentItemId?: string;
  items?: NodeWithIdProps[];
};

export type TreeViewProps = ComponentProps<'ul'> & {
  name?: string;
  data?: any;
  dataType?:
    | 'string'
    | 'boolean'
    | 'number / bigint'
    | 'undefined / null'
    | 'array'
    | 'object';
  items?: TreeViewProps[];
} ;

export type NodeViewProps = ComponentProps<'ul'> & {
  name?: string;
  itemId: string;
  parentItemId?: string;
  items: (ComponentProps<'li'> & NodeWithIdProps)[];
} ;

export type GenNodeArgs = {
  name?: string;
  parentItemId?: string;
  items?: GenNodeArgs[];
};

export type ExternalProps = {
  /** @default false */
  enableSelection?: boolean;
  /** @default true */
  showGuidelines?: boolean;
}
