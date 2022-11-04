import { Tabs } from '@mantine/core';
import BrowserTabProvider from 'lib/context/browser-tab';
import Explorer from './explorer';
import Share from './share';
import Wrapper, { Heading } from './style';

function TabbedView() {
  return (
    <Tabs defaultValue='share'>
      <Tabs.List>
        <Tabs.Tab value='share'>Share</Tabs.Tab>
        <Tabs.Tab value='explorer'>Explorer</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value='share' pt='xs'>
        <BrowserTabProvider>
          <Share />
        </BrowserTabProvider>
      </Tabs.Panel>

      <Tabs.Panel value='explorer' pt='xs'>
        <BrowserTabProvider>
          <Explorer />
        </BrowserTabProvider>
      </Tabs.Panel>
    </Tabs>
  );
}

export default function App() {
  return (
    <Wrapper>
      <Heading>StorageX</Heading>
      <TabbedView />
    </Wrapper>
  );
}
