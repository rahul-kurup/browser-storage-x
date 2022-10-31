import { Tab } from 'lib-models/browser';
import { StorageType } from 'lib-models/storage';
import { CheckboxProps } from 'react-checkbox-tree';

export interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
  data: Tab;
  label: string;
}

export type CheckboxTreeState = Pick<
  CheckboxProps,
  'nodes' | 'expanded' | 'checked'
>;

export type State = {
  srcTab: Tab;
  srcStorage: StorageType;
  destTab: Tab;
  destStorage: StorageType;
};
