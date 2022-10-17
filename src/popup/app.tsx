import { Alert, Button } from "@mantine/core";
import Select, { ChangeHandlerArgs } from "lib-components/select";
import { Progress } from "lib-models/progress";
import { Tab } from "lib-models/tab";
import { getAllItems, setAllItems, StorageTypeList } from "lib-utils/storage";
import { FormEvent, useEffect, useState } from "react";
import CustomSelectOption from "./select-option";
import Wrapper, { Fieldset, Form, Heading } from "./style";
import { State } from "./type";

export default function App() {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [state, setState] = useState({} as State);
  const [progress, setProgress] = useState<Progress>(Progress.idle);

  useEffect(() => {
    chrome.tabs.query({}, setTabs);
  }, []);

  function handleChange({ name, value }: ChangeHandlerArgs<Tab>) {
    setState((s) => ({ ...s, [name]: value }));
  }

  function resetSubmission() {
    setTimeout(() => {
      setProgress(Progress.idle);
    }, 1500);
  }

  function handleShare(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProgress(Progress.started);

    const { srcStorage, srcTab, destStorage, destTab } = state;

    try {
      chrome.scripting.executeScript(
        {
          target: { tabId: srcTab.id },
          args: [srcStorage],
          func: getAllItems,
        },
        ([output]) => {
          if (output?.result) {
            chrome.scripting.executeScript(
              {
                target: { tabId: destTab.id },
                args: [destStorage, output.result],
                func: setAllItems,
              },
              () => {
                setProgress(Progress.pass);
                resetSubmission();
              }
            );
          } else {
            setProgress(Progress.stopped);
            resetSubmission();
          }
        }
      );
    } catch (error) {
      console.error("submit", error);
      setProgress(Progress.fail);
      resetSubmission();
    }
  }

  const hasAllValues = Object.values(state).filter(Boolean).length === 4;
  const disabledField = progress !== Progress.idle;

  return (
    <Wrapper>
      <Heading>StorageX</Heading>

      <Form onSubmit={handleShare}>
        <Fieldset>
          <legend>Source</legend>

          <Select
            label="Tab"
            name="srcTab"
            options={tabs}
            valueAsObject
            value={state.srcTab}
            onChange={handleChange}
            disabled={disabledField}
            itemComponent={CustomSelectOption}
            fieldKey={{
              value: "id",
              label: "title",
            }}
          />

          <Select
            label="Storage"
            name="srcStorage"
            options={StorageTypeList}
            value={state.srcStorage}
            disabled={disabledField}
            onChange={handleChange}
          />
        </Fieldset>

        <Fieldset>
          <legend>Destination</legend>

          <Select
            label="Tab"
            name="destTab"
            options={tabs}
            valueAsObject
            value={state.destTab}
            onChange={handleChange}
            disabled={disabledField}
            itemComponent={CustomSelectOption}
            fieldKey={{
              value: "id",
              label: "title",
            }}
          />

          <Select
            label="Storage"
            name="destStorage"
            options={StorageTypeList}
            value={state.destStorage}
            disabled={disabledField}
            onChange={handleChange}
          />
        </Fieldset>

        {progress === Progress.idle ? (
          <Button type="submit" disabled={!hasAllValues}>
            Share Tab Storage
          </Button>
        ) : (
          <>
            {progress === Progress.started && (
              <Alert color="blue" title="🔁 Sharing">
                Storage is being transferred...
              </Alert>
            )}

            {progress === Progress.stopped && (
              <Alert color="blue" title="⏹ Aborted">
                No data found to be transferred
              </Alert>
            )}

            {progress === Progress.pass && (
              <Alert color="green" title="✅ Done">
                Storage transfer completed!
              </Alert>
            )}

            {progress === Progress.fail && (
              <Alert color="red" title="❌ Some error occurred">
                You may share the logged error in console with the extension
                author
              </Alert>
            )}
          </>
        )}
      </Form>
    </Wrapper>
  );
}
