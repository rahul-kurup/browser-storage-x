import { Tab } from 'lib-models/browser';
import { StorageType } from 'lib-models/storage';

export interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
  data: Tab;
  label: string;
}

export type State = {
  srcTab: Tab;
  srcStorage: StorageType;
  destTab: Tab;
  destStorage: StorageType;
};
