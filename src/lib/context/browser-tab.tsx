import { Tab } from 'lib-models/browser';
import Browser from 'lib-utils/browser';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';

type CtxState = {
  tabs: Tab[];
  replaced: Record<number, Tab>;
};

const Ctx = createContext({} as CtxState);

export default function BrowserTabProvider({
  children,
}: PropsWithChildren<{}>) {
  const [state, setState] = useState<CtxState>({
    tabs: [],
    replaced: {},
  });

  const handleTabReplace = (addedTabId: number, removedTabId: number) => {
    // update the tabs list for select dropdown
    const { tabs: allTabs, replaced: replacedTabs } = state;
    const idxOfReplacedTab = allTabs.findIndex(t => t.id === removedTabId);
    if (idxOfReplacedTab > -1) {
      Browser.tab.get(addedTabId, tab => {
        const newTabs = [...allTabs];
        newTabs[idxOfReplacedTab] = tab;
        replacedTabs[removedTabId] = tab;
        setState({ tabs: newTabs, replaced: { ...replacedTabs } });
      });
    }
  };

  useEffect(() => {
    Browser.tab.getAll(tabs => setState(s => ({ ...s, tabs })));
  }, []);

  useEffect(() => {
    Browser.tab.onReplaced.addListener(handleTabReplace);
    return () => {
      Browser.tab.onReplaced.removeListener(handleTabReplace);
    };
  }, [state.tabs]);

  return <Ctx.Provider value={{ ...state }}>{children}</Ctx.Provider>;
}

export const useBrowserTabs = () => useContext(Ctx);
