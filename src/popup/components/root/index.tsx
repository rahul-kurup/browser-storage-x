import { FormEvent, useEffect, useState } from "react";
import Storages, { StorageType } from "../../model/storage";
import { getAllItems, setAllItems } from "../../utils/storage";
import Select from "../select";
import "./index.module.scss";

type State = {
  srcTab: number;
  srcStorage: StorageType;
  destTab: number;
  destStorage: StorageType;
};

const StorageTypes = Object.keys(Storages).reduce(
  (a, c) => [...a, { label: c, value: Storages[c] }],
  []
);

export default function Root() {
  const [tabs, setTabs] = useState<chrome.tabs.Tab[]>([]);
  const [state, setState] = useState({} as State);

  useEffect(() => {
    chrome.tabs.query({}, setTabs);
  }, []);

  function handleChange({ target: { name, value } }: any) {
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
        chrome.scripting.executeScript({
          target: { tabId: +state.destTab },
          args: [state.destStorage, result],
          func: setAllItems,
        }, () => {
          setTimeout(() => {
            window.close();
          }, 500);
        });
      }
    );
  }

  const hasAllValues = Object.values(state).filter(Boolean).length === 4;

  return (
    <section>
      <h1>StorageX</h1>

      <form onSubmit={handleShare}>
        <fieldset>
          <legend>Source</legend>

          <Select
            label="Tab"
            name="srcTab"
            options={tabs}
            value={state.srcTab}
            onChange={handleChange}
            fieldKey={{
              value: "id",
              label: (e) => `${e.title} (${e.url})`,
            }}
          />

          <Select
            label="Storage"
            name="srcStorage"
            options={StorageTypes}
            value={state.srcStorage}
            onChange={handleChange}
          />
        </fieldset>

        <fieldset>
          <legend>Destination</legend>

          <Select
            label="Tab"
            name="destTab"
            options={tabs}
            value={state.destTab}
            onChange={handleChange}
            fieldKey={{
              value: "id",
              label: (e) => `${e.title} (${e.url})`,
            }}
          />

          <Select
            label="Storage"
            name="destStorage"
            options={StorageTypes}
            value={state.destStorage}
            onChange={handleChange}
          />
        </fieldset>

        <button disabled={!hasAllValues}>Share Session</button>
      </form>
    </section>
  );
}
