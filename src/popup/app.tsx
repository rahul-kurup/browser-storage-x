import { Alert, Button } from '@mantine/core';
import Select, { ChangeHandlerArgs } from 'lib-components/select';
import { Browser, Cookie, Tab } from 'lib-models/browser';
import { Progress } from 'lib-models/progress';
import detectBrowser, { safelyExecuteScript } from 'lib-utils/browser';
import {
  getAllItems,
  getCookies,
  isCookieType,
  setAllItems,
  StorageTypeList
} from 'lib-utils/storage';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import CheckboxTree, { CheckboxProps } from 'react-checkbox-tree';
import alerts from './alerts';
import { CheckboxTreeLabel, CustomSelectOption } from './components';
import Wrapper, { Fieldset, Form, Heading } from './style';
import { CheckboxTreeState, State } from './type';

const browser = detectBrowser();

const CONSTANTS = {
  SEP: '|:|',
  ALL: '__all__',
};

export default function App() {
  const checkboxTreeRef = useRef<CheckboxTree>();
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [state, setState] = useState({} as State);
  const [browser, setBrowser] = useState<Browser>();
  const [checkboxData, setCheckboxData] = useState<CheckboxTreeState>({
    nodes: [],
    checked: [],
    expanded: [],
  });
  const [selectChecbox, setSelectChecbox] = useState(false);
  const [progress, setProgress] = useState<
    Progress | { title: string; color: string; message: string }
  >(Progress.idle);

  useEffect(() => {
    (async () => {
      setBrowser(await detectBrowser());
    })();
  }, []);

  useEffect(() => {
    if (browser) {
      browser.tabs.query({}, setTabs);
    }
  }, [browser]);

  useEffect(() => {
    if (browser) {
      browser.tabs.onReplaced.addListener(tabReplaceListener);
      return () => {
        browser.tabs.onReplaced.removeListener(tabReplaceListener);
      };
    }
  }, [state, tabs]);

  useEffect(() => {
    /**
     * this effect is to select all checkboxes by default,
     * stupidly the checkboxtree lib doesn't give this functionality
     * https://github.com/jakezatecky/react-checkbox-tree/issues/174#issuecomment-558874694
     */
    if (selectChecbox) {
      //@ts-ignore
      checkboxTreeRef.current?.onCheck({
        value: CONSTANTS.ALL,
        checked: true,
      });
      setSelectChecbox(false);
    }
  }, [selectChecbox]);

  /**
   * when tab is discarded, the tab is replaced, so we must update the srcTab in State as well
   * otherwise all tab operations would throw error saying that tab doesn't exist
   *
   */
  const tabReplaceListener = (addedTabId: number, removedTabId: number) => {
    if (!browser) return;
    //  console.log("🚀 ~ file: app.tsx ~ line 48 ~ tabReplaceListener", "removedTabId", removedTabId, "addedTabId", addedTabId)

    // update the tabs list for select dropdown
    const indexOfReplacedTab = tabs.findIndex(
      oneTab => oneTab.id === removedTabId
    );

    if (~indexOfReplacedTab) {
      browser.tabs.get(addedTabId, addedTab => {
        const newTabs = [...tabs];
        newTabs[indexOfReplacedTab] = addedTab;
        setTabs(newTabs);
      });
    }

    // update the srcTab to reflect current value
    const { srcTab } = state;
    if (srcTab?.id === removedTabId) {
      browser.tabs.get(addedTabId, addedTab => {
        setState({
          ...state,
          srcTab: addedTab,
        });
      });
    }
  };
  async function handleSrcChange(tab: ChangeHandlerArgs<Tab>) {
    Promise.resolve(updateCheckboxTree(tab.name, tab.value));
    await handleChange(tab);
  }

  async function handleChange({ name, value }: ChangeHandlerArgs<Tab>) {
    // console.log("🚀 ~ file: app.tsx ~ line 32 ~ handleChange ~ { name, value }", { name, value })
    setState(s => {
      return { ...s, [name]: value };
    });
  }

  function resetSubmission() {
    setTimeout(() => {
      setProgress(Progress.idle);
    }, 1500);
  }

  async function handleShare(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!browser) return;
    setProgress(Progress.started);

    const { srcStorage, srcTab, destStorage, destTab } = state;

    try {
      if (srcStorage === destStorage && srcTab.id === destTab.id) {
        setProgress(Progress.stopped);
      } else {
        const isSrcCookie = isCookieType(srcStorage);
        const isDestCookie = isCookieType(destStorage);
        if (isSrcCookie || isDestCookie) {
          if (isSrcCookie && isDestCookie) {
            const srcCookies = await getCookies(srcTab);
            for (const cookie of srcCookies) {
              let domain = new URL(destTab.url).hostname;
              if (cookie.domain.startsWith('.')) {
                domain = `.${domain}`;
              }
              try {
                if (~checkboxData.checked?.indexOf(cookieId(cookie))) {
                  await browser.cookies.set({
                    domain,
                    url: destTab.url,
                    path: cookie.path,
                    name: cookie.name,
                    value: String(cookie.value || ''),
                    secure: cookie.secure,
                    httpOnly: cookie.httpOnly,
                    sameSite: cookie.sameSite,
                    expirationDate: cookie.expirationDate,
                  });
                }
              } catch (error) {
                console.error(error);
              }
            }
            setProgress(Progress.pass);
          } else {
            setProgress({
              color: 'red',
              title: '🛑 Mismatch',
              message: 'Source and destination storage should be "cookie"',
            });
          }
        } else {
          const getAll = await safelyExecuteScript(
            srcTab,
            [srcStorage],
            getAllItems,
            false
          );
          const result = getAll?.result;
          if (result) {
            const filteredData = {};
            Object.keys(result).forEach(storageKey => {
              if (~checkboxData.checked?.indexOf(storageKey)) {
                filteredData[storageKey] = result[storageKey];
              }
            });
            await safelyExecuteScript(
              destTab,
              [destStorage, filteredData],
              setAllItems
            );
            setProgress(Progress.pass);
          } else {
            setProgress(Progress.stopped);
          }
        }
      }
    } catch (error) {
      console.error('submit', error);
      setProgress(Progress.fail);
    }
    resetSubmission();
  }

  const PresetAlert = useMemo<JSX.Element>(() => {
    return typeof progress === 'number' ? (
      alerts[progress]
    ) : (
      <Alert color={progress.color} title={progress.title}>
        {progress.message}
      </Alert>
    );
  }, [progress]);

  const updateCheckboxTree = async (name, value) => {
    const { srcTab, srcStorage } = {
      ...state,
      [name]: value,
    } as State;
    if (srcTab?.id && srcStorage) {
      const checkboxTreeData: CheckboxTreeState['nodes'] = [
        {
          label: 'All',
          value: CONSTANTS.ALL,
          children: [],
        },
      ];
      if (isCookieType(srcStorage)) {
        const srcCookies = await getCookies(srcTab);
        // console.log("🚀 ~ file: app.tsx ~ line 141 ~ updateCheckboxTree ~ srcCookies", srcCookies)
        checkboxTreeData[0].children = srcCookies.map(cookie => {
          const label = cookieId(cookie);
          return {
            label: <CheckboxTreeLabel name={label} value={cookie.value} />,
            value: label,
          };
        });
      } else {
        const getAll = await safelyExecuteScript(
          srcTab,
          [srcStorage],
          getAllItems
        );
        checkboxTreeData[0].children =
          (getAll.result &&
            Object.entries(getAll.result).map(storageEntry => {
              return {
                label: (
                  <CheckboxTreeLabel
                    name={storageEntry[0]}
                    value={storageEntry[1]}
                  />
                ),
                value: storageEntry[0],
              };
            })) ??
          [];
      }

      setCheckboxData({
        ...checkboxData,
        nodes: checkboxTreeData,
        expanded: [CONSTANTS.ALL],
      });
      setSelectChecbox(true);
    }
  };

  const onCheckHandler: CheckboxProps['onCheck'] = checked => {
    setCheckboxData({
      ...checkboxData,
      checked,
    });
  };
  const onExpandHandler: CheckboxProps['onExpand'] = expanded => {
    setCheckboxData({
      ...checkboxData,
      expanded,
    });
  };

  const hasAllValues = Object.values(state).filter(Boolean).length === 4;
  const disabledField = !browser || progress !== Progress.idle;

  return (
    <Wrapper>
      <Heading>StorageX</Heading>

      {/* <TreeViewTest /> */}

      <Form onSubmit={handleShare}>
        <Fieldset>
          <legend>Source</legend>

          <Select
            label='Tab'
            name='srcTab'
            options={tabs}
            valueAsObject
            value={state.srcTab}
            onChange={handleSrcChange}
            disabled={disabledField}
            itemComponent={CustomSelectOption}
            fieldKey={{
              value: 'id',
              label: 'title',
            }}
          />

          <Select
            label='Storage'
            name='srcStorage'
            options={StorageTypeList}
            value={state.srcStorage}
            disabled={disabledField}
            onChange={handleSrcChange}
          />

          <CheckboxTree
            nodes={checkboxData.nodes}
            checked={checkboxData.checked}
            expanded={checkboxData.expanded}
            onCheck={onCheckHandler}
            onExpand={onExpandHandler}
            ref={checkboxTreeRef}
          />
        </Fieldset>

        <Fieldset>
          <legend>Destination</legend>

          <Select
            label='Tab'
            name='destTab'
            options={tabs}
            valueAsObject
            value={state.destTab}
            onChange={handleChange}
            disabled={disabledField}
            itemComponent={CustomSelectOption}
            fieldKey={{
              value: 'id',
              label: 'title',
            }}
          />

          <Select
            label='Storage'
            name='destStorage'
            options={StorageTypeList}
            value={state.destStorage}
            disabled={disabledField}
            onChange={handleChange}
          />
        </Fieldset>

        {progress === Progress.idle ? (
          <Button type='submit' disabled={!hasAllValues}>
            Share Tab Storage
          </Button>
        ) : (
          PresetAlert
        )}
      </Form>
    </Wrapper>
  );
}

function cookieId(cookie: Cookie) {
  return cookie.name + CONSTANTS.SEP + cookie.domain;
}
