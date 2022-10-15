import { Button, Group, Text } from "@mantine/core";
import { FormEvent, forwardRef, useEffect, useState } from "react";
import Storages from "../../model/storage";
import { getAllItems, setAllItems } from "../../utils/storage";
import Select from "../select";
import { ChangeHandlerArgs } from "../select/type";
import Wrapper, { Fieldset, Form, H1 } from "./style";
import { ItemProps, State } from "./type";

const StorageTypes = Object.keys(Storages).reduce(
  (a, c) => [...a, { label: c, value: Storages[c] }],
  []
);

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ data, label, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        <div>
          <Text size="sm">{data.title}</Text>
          <Text size="xs" color="dimmed">
            {data.url}
          </Text>
        </div>
      </Group>
    </div>
  )
);

export default function Root() {
  const [tabs, setTabs] = useState<chrome.tabs.Tab[]>([]);
  const [state, setState] = useState({} as State);

  useEffect(() => {
    chrome.tabs.query({}, setTabs);
  }, []);

  function handleChange({ name, value }: ChangeHandlerArgs) {
    setState((s) => ({ ...s, [name]: value }));
  }

  function handleShare(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    chrome.scripting.executeScript(
      {
        target: { tabId: +state.srcTab },
        args: [state.srcStorage],
        func: getAllItems,
      },
      ([{ result }]) => {
        chrome.scripting.executeScript(
          {
            target: { tabId: +state.destTab },
            args: [state.destStorage, result],
            func: setAllItems,
          },
          () => {
            setTimeout(() => {
              window.close();
            }, 500);
          }
        );
      }
    );
  }

  const hasAllValues = Object.values(state).filter(Boolean).length === 4;

  console.log(state);

  return (
    <Wrapper>
      <H1>StorageX</H1>

      <Form onSubmit={handleShare}>
        <Fieldset>
          <legend>Source</legend>

          <Select
            label="Tab"
            name="srcTab"
            options={tabs}
            value={state.srcTab}
            onChange={handleChange}
            itemComponent={SelectItem}
            fieldKey={{
              value: "id",
              label: "title",
            }}
          />

          <Select
            label="Storage"
            name="srcStorage"
            options={StorageTypes}
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
            value={state.destTab}
            onChange={handleChange}
            itemComponent={SelectItem}
            fieldKey={{
              value: "id",
              label: "title",
            }}
          />

          <Select
            label="Storage"
            name="destStorage"
            options={StorageTypes}
            value={state.destStorage}
            onChange={handleChange}
          />
        </Fieldset>

        <Button type="submit" disabled={!hasAllValues}>
          Share Tab Storage
        </Button>
      </Form>
    </Wrapper>
  );
}
