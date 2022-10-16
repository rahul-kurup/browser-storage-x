import { Button } from "@mantine/core";
import Select, { ChangeHandlerArgs } from "lib-components/select";
import { Tab } from "lib-models/tab";
import {
  getAllItems,
  isCookieType,
  setAllItems,
  StorageTypeList
} from "lib-utils/storage";
import { FormEvent, useEffect, useState } from "react";
import CustomSelectOption from "./select-option";
import Wrapper, { Fieldset, Form, Heading } from "./style";
import { State } from "./type";

export default function App() {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [state, setState] = useState({} as State);
  const [inProgress, setProgress] = useState(false);

  useEffect(() => {
    chrome.tabs.query({}, setTabs);
  }, []);

  function handleChange({ name, value }: ChangeHandlerArgs<Tab>) {
    setState((s) => ({ ...s, [name]: value }));
  }

  function handleShare(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProgress(true);

    const { srcStorage, srcTab, destStorage, destTab } = state;

    try {
      if (isCookieType(srcStorage) || isCookieType(destStorage)) {
        // TODO: maybe in future update
      } else {
        chrome.scripting.executeScript(
          {
            target: { tabId: srcTab.id },
            args: [srcStorage],
            func: getAllItems,
          },
          ([{ result }]) => {
            chrome.scripting.executeScript(
              {
                target: { tabId: destTab.id },
                args: [destStorage, result],
                func: setAllItems,
              },
              () => {
                setProgress(false);
                setTimeout(() => {
                  window.close();
                }, 100);
              }
            );
          }
        );
      }
    } catch (error) {
      console.error(error);
      setProgress(false);
    }
  }

  const hasAllValues = Object.values(state).filter(Boolean).length === 4;

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
            onChange={handleChange}
          />
        </Fieldset>

        <Button type="submit" disabled={inProgress || !hasAllValues}>
          {inProgress ? "Sharing..." : "Share Tab Storage"}
        </Button>
      </Form>
    </Wrapper>
  );
}
