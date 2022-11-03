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

export type ShareState = {
  selectedItems: string[];
  selectedValues: any;
  onSelection: (content: Partial<Omit<ShareState, 'onSelection'>>) => void;
};

export type SpecificProps = Pick<State, 'srcStorage' | 'srcTab'> &
  ShareState & {
    disabled: boolean;
  };

export type TreeDataState = 'HIDDEN' | 'LOADING' | 'LOADED';
