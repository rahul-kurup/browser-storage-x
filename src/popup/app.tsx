import BrowserTabProvider from 'lib/context/browser-tab';
import ShareUI from './share';
import Wrapper, { Heading } from './style';

function SingleView() {
  return (
    <BrowserTabProvider>
      <ShareUI />
    </BrowserTabProvider>
  );
}

export default function App() {
  return (
    <Wrapper>
      <Heading>StorageX</Heading>
      <SingleView />
      {/* <TabbedView /> */}
    </Wrapper>
  );
}
