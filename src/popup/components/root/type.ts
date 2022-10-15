
import { StorageType } from "../../model/storage";

export interface ItemProps extends React.ComponentPropsWithoutRef<"div"> {
  data: chrome.tabs.Tab;
  label: string;
}

export type State = {
  srcTab: number;
  srcStorage: StorageType;
  destTab: number;
  destStorage: StorageType;
};
