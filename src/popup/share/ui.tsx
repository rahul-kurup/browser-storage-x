import { Alert, Button } from '@mantine/core';
import Select, { ChangeHandlerArgs } from 'lib-components/select';
import { Cookie, Tab } from 'lib-models/browser';
import { Progress } from 'lib-models/progress';
import Browser from 'lib-utils/browser';
import {
  getAllItems,
  isCookieType,
  setAllItems,
  StorageTypeList,
} from 'lib-utils/storage';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { CustomSelectOption, PresetAlerts } from './components';
import { convertTreeNodeToCookie, convertTreeNodeToStorage } from './helper';
import ShareSpecific from './share-specific';
import Form, { Fieldset, Legend, SourceContainer } from './style';
import { ShareState, State } from './type';

export default function ShareUI() {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [state, setState] = useState({} as State);
  const refPrevState = useRef(state);
  const [shareState, setShareState] = useState<Omit<ShareState, 'onSelection'>>(
    {
      selectedItems: [],
      selectedValues: {},
    }
  );
  const [progress, setProgress] = useState<
    Progress | { title: string; color: string; message: string }
  >(Progress.idle);

  const tabReplaceListener = (addedTabId: number, removedTabId: number) => {
    // update the tabs list for select dropdown
    const indexOfReplacedTab = tabs.findIndex(t => t.id === removedTabId);
    if (indexOfReplacedTab > -1) {
      Browser.tab.get(addedTabId, tab => {
        const newTabs = [...tabs];
        newTabs[indexOfReplacedTab] = tab;
        setTabs(newTabs);

        // update the srcTab/destTab to reflect current value
        let { srcTab, destTab } = state;
        if (srcTab?.id === removedTabId) {
          srcTab = tab;
        }
        if (destTab?.id === removedTabId) {
          destTab = tab;
        }
        setState({
          ...state,
          srcTab,
          destTab,
        });
      });
    }
  };

  useEffect(() => {
    Browser.tab.getAll(setTabs);
    Browser.tab.onReplaced.addListener(tabReplaceListener);
    return () => {
      Browser.tab.onReplaced.removeListener(tabReplaceListener);
    };
  }, []);

  useEffect(() => {
    const prevState = refPrevState.current;
    if (
      prevState.srcTab !== state.srcTab ||
      prevState.srcStorage !== state.srcStorage
    ) {
      prevState.srcTab = state.srcTab;
      prevState.srcStorage = state.srcStorage;
      setShareState(s => ({ ...s, selectedItems: [], selectedValues: {} }));
    }
  }, [state.srcStorage, state.srcTab]);

  function handleChange({ name, value }: ChangeHandlerArgs<Tab>) {
    setState(s => ({ ...s, [name]: value }));
  }

  function resetSubmission() {
    setTimeout(() => {
      setProgress(Progress.idle);
    }, 2000);
  }

  async function shareCookieContent(cookies: Cookie[]) {
    const { destTab } = state;
    for (const cookie of cookies) {
      let domain = new URL(destTab.url).hostname;
      if (cookie.domain.startsWith('.')) {
        domain = `.${domain}`;
      }
      try {
        await Browser.cookies.set({
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
      } catch (error) {
        console.error(error);
      }
    }
    setProgress(Progress.pass);
  }

  async function shareStorageContent(content: any) {
    const { destStorage, destTab } = state;
    if (content) {
      await Browser.script.execute(destTab, setAllItems, [
        destStorage,
        content,
      ]);
      setProgress(Progress.pass);
    } else {
      setProgress(Progress.stopped);
    }
  }

  async function handleShare(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
            if (shareState.selectedValues.length) {
              await shareCookieContent(
                convertTreeNodeToCookie(shareState.selectedValues)
              );
            } else {
              const cookies = await Browser.cookies.getAll(srcTab);
              await shareCookieContent(cookies);
            }
          } else {
            setProgress({
              color: 'red',
              title: '🛑 Storage Mismatch',
              message:
                '"local" or "session" storage CANNOT be shared with "cookie"',
            });
          }
        } else {
          if (shareState.selectedValues.length) {
            await shareStorageContent(
              convertTreeNodeToStorage(shareState.selectedValues)
            );
          } else {
            const output = await Browser.script.execute(srcTab, getAllItems, [
              srcStorage,
            ]);
            await shareStorageContent(output?.result);
          }
        }
      }
    } catch (error) {
      console.error('submit', error);
      setProgress(Progress.fail);
    }
    resetSubmission();
  }

  const hasAllValues = Object.values(state).filter(Boolean).length === 4;
  const disabledField = progress !== Progress.idle;

  const PresetAlert = useMemo<JSX.Element>(() => {
    return typeof progress === 'number' ? (
      PresetAlerts[progress]
    ) : (
      <Alert color={progress.color} title={progress.title}>
        {progress.message}
      </Alert>
    );
  }, [progress]);

  return (
    <>
      <Form onSubmit={handleShare}>
        <Fieldset>
          <Legend>Source</Legend>

          <Select
            label='Tab'
            name='srcTab'
            options={tabs}
            valueAsObject
            value={state.srcTab}
            onChange={handleChange}
            disabled={disabledField}
            itemComponent={CustomSelectOption}
            fieldKey={{
              value: 'id',
              label: 'title',
            }}
          />

          <SourceContainer>
            <Select
              label='Storage'
              name='srcStorage'
              options={StorageTypeList}
              value={state.srcStorage}
              disabled={disabledField}
              onChange={handleChange}
            />

            {state.srcTab && state.srcStorage && (
              <ShareSpecific
                disabled={disabledField}
                srcTab={state.srcTab}
                srcStorage={state.srcStorage}
                {...shareState}
                onSelection={updatedState =>
                  setShareState(s => ({ ...s, ...updatedState }))
                }
              />
            )}
          </SourceContainer>
        </Fieldset>

        <Fieldset>
          <Legend>Destination</Legend>

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
          <>
            <Button type='submit' disabled={!hasAllValues}>
              Share Storage
            </Button>
          </>
        ) : (
          PresetAlert
        )}
      </Form>
    </>
  );
}
