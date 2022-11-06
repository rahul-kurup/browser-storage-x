import { NodeWithIdProps } from 'lib-components/tree-view';

export type UpsertModalProps = {
  node: NodeWithIdProps;
  open: boolean;
  action: 'add' | 'update' | 'delete';
};
