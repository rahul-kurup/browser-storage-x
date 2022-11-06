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
import { useBrowserTabs } from 'lib/context/browser-tab';
import { FormEvent, memo, useEffect, useMemo, useRef, useState } from 'react';
import { CustomSelectOption, PresetAlerts } from './components';
import {
  convertTreeNodeToCookie,
  convertTreeNodeToStorage,
  filterFn,
} from './helper';
import ShareSpecificModal from './modal-share';
import Form, { Fieldset, Legend, SourceContainer } from './style';
import { ShareState, State } from './type';

function ShareUI() {
  const { tabs, replaced } = useBrowserTabs();

  const [state, setState] = useState({} as State);
  const refPrevState = useRef(state);
  const [shareState, setShareState] = useState<Omit<ShareState, 'onSelection'>>(
    {
      selectedItems: undefined,
      selectedValues: undefined,
    }
  );
  const [progress, setProgress] = useState<
    Progress | { title: string; color: string; message: string }
  >(Progress.idle);

  useEffect(() => {
    setState(prev => {
      let { srcTab, destTab } = prev;
      const srcReplacedTab = replaced[srcTab?.id || ''];
      const destReplacedTab = replaced[destTab?.id || ''];
      if (srcReplacedTab) {
        srcTab = srcReplacedTab;
      }
      if (destReplacedTab) {
        destTab = destReplacedTab;
      }
      return {
        ...prev,
        srcTab,
        destTab,
      };
    });
  }, [replaced]);

  useEffect(() => {
    const prevState = refPrevState.current;
    if (
      prevState.srcTab !== state.srcTab ||
      prevState.srcStorage !== state.srcStorage
    ) {
      prevState.srcTab = state.srcTab;
      prevState.srcStorage = state.srcStorage;
      setShareState(s => ({
        ...s,
        selectedItems: undefined,
        selectedValues: undefined,
      }));
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
            if (shareState.selectedValues?.length) {
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
          if (shareState.selectedValues?.length) {
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

  const isSrcSelected = Boolean(state.srcTab && state.srcStorage);

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
            searchable
            filter={filterFn}
          />

          <SourceContainer sourceSelected={isSrcSelected}>
            <Select
              label='Storage'
              name='srcStorage'
              options={StorageTypeList}
              value={state.srcStorage}
              disabled={disabledField}
              onChange={handleChange}
            />

            {isSrcSelected && (
              <ShareSpecificModal
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
            searchable
            filter={filterFn}
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

export default memo(ShareUI);
