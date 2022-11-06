import { NodeWithIdProps } from 'lib-components/tree-view';

export type UpsertModalProps = {
  node: NodeWithIdProps;
  open: boolean;
  action: 'add' | 'update' | 'delete';
};

export type CommonModalArgs = {
  close: boolean;
  prevPath?: string[];
  newPath: string[];
  newPathValue: any;
};
