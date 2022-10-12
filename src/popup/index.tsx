import { createRoot } from "react-dom/client";
import AppRoot from "./components/root";
import './index.scss';

const container = document.createElement("popup");
document.body.appendChild(container);

const root = createRoot(container);
root.render(<AppRoot />);

// console.log("Popup 👋");
