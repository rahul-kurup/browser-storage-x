import {
  AcceptedDataType,
  NodeWithIdProps,
  TreeViewProps,
} from 'lib-components/tree-view';
import { Tab } from 'lib-models/browser';
import { Progress } from 'lib-models/progress';
import { StorageType } from 'lib-models/storage';

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
  /**
   * NOTE: this is only to track root level cookie name changes
   */
  changes: [newName: string, oldName: string];
};

export type ExplorerState = {
  progress?: Progress;
  tab: Tab;
  storage: StorageType;
  original: any;
  content: any;
  /**
   * NOTE: this is only to track root level cookie name changes
   */
  changes?: Record<string, string>;
  treeContent: TreeViewProps['items'];
};

export type ParentIdArgs = {
  dataType?: AcceptedDataType;
  path: string[];
};
