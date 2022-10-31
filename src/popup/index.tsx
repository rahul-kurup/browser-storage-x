import { MantineProvider } from '@mantine/core';
import { createRoot } from 'react-dom/client';
import App from './app';

const container = document.createElement('popup');
document.body.appendChild(container);

const root = createRoot(container);
root.render(
  <MantineProvider withGlobalStyles withNormalizeCSS>
    <App />
  </MantineProvider>
);

// console.log("Popup 👋");
