import { NodeWithIdProps } from 'lib-components/tree-view';

export type UpsertModalProps = {
  node?: NodeWithIdProps;
  open: boolean;
  title: React.ReactNode;
  action: 'add' | 'update' | 'delete';
};
