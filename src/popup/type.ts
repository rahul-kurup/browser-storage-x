import { Tab } from "lib-models/browser";
import { StorageType } from "lib-models/storage";
import {CheckboxProps} from 'react-checkbox-tree';

export interface ItemProps extends React.ComponentPropsWithoutRef<"div"> {
  data: Tab;
  label: string;
}

type CheckboxTreeState = Pick<CheckboxProps, 'nodes' | 'expanded'| 'checked'>

export type State = {
  srcTab: Tab;
  srcStorage: StorageType;
  selectedVals?: CheckboxTreeState;
  destTab: Tab;
  destStorage: StorageType;
};
