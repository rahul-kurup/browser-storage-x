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
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { CustomSelectOption, PresetAlerts } from './components';
import ShareSpecificModal from './share-specific-modal';
import Form, { Actions, Fieldset, Legend } from './style';
import { State } from './type';

export default function ShareUI() {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [state, setState] = useState({} as State);
  const [opened, setOpened] = useState(false);
  const [progress, setProgress] = useState<
    Progress | { title: string; color: string; message: string }
  >(Progress.idle);

  useEffect(() => {
    Browser.tab.getAll(setTabs);
  }, []);

  function handleChange({ name, value }: ChangeHandlerArgs<Tab>) {
    setState(s => ({ ...s, [name]: value }));
  }

  function resetSubmission() {
    setTimeout(() => {
      setProgress(Progress.idle);
    }, 2000);
  }

  async function shareCookie() {
    const { srcTab } = state;
    const cookies = await Browser.cookies.getAll(srcTab);
    shareCookieContent(cookies);
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

  async function shareStorage() {
    const { srcStorage, srcTab } = state;
    const output = await Browser.script.execute(srcTab, getAllItems, [
      srcStorage,
    ]);
    shareStorageContent(output?.result);
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

  async function validateAndShare(
    cbCookie?: () => Promise<void>,
    cbStorage?: () => Promise<void>
  ) {
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
            await cbCookie?.();
          } else {
            setProgress({
              color: 'red',
              title: '🛑 Storage Mismatch',
              message:
                '"local" or "session" storage CANNOT be shared with "cookie"',
            });
          }
        } else {
          await cbStorage?.();
        }
      }
    } catch (error) {
      console.error('submit', error);
      setProgress(Progress.fail);
    }
    resetSubmission();
  }

  async function handleShare(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await validateAndShare(shareCookie, shareStorage);
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

          <Select
            label='Storage'
            name='srcStorage'
            options={StorageTypeList}
            value={state.srcStorage}
            disabled={disabledField}
            onChange={handleChange}
          />
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
          <Actions>
            <Button type='submit' disabled={!hasAllValues}>
              Share Everything
            </Button>

            <Button
              type='button'
              color='indigo'
              disabled={!hasAllValues}
              onClick={async () => {
                const cb = () => Promise.resolve(setOpened(true));
                await validateAndShare(cb, cb);
              }}
            >
              Share Specific
            </Button>
          </Actions>
        ) : (
          PresetAlert
        )}
      </Form>

      <ShareSpecificModal
        open={opened}
        shareState={state}
        setOpen={setOpened}
        onShare={async data => {
          setOpened(false);
          await validateAndShare(
            () => shareCookieContent(data),
            () => shareStorageContent(data)
          );
        }}
      />
    </>
  );
}
