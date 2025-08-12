import { Buffer } from "buffer";
globalThis.Buffer = Buffer;
window.Buffer = Buffer;

import ReactDOM from "react-dom/client";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import App from "./App";
import "./index.scss";
import "./patch-local-storage-for-github-pages";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

// Build an absolute URL to the manifest under the current origin and base path
const base = (import.meta as any).env?.BASE_URL || "/";
const manifestFile = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
  ? 'tonconnect-manifest.dev.json'
  : 'tonconnect-manifest.json';
const manifestUrl = new URL(base.replace(/\/$/, "/") + manifestFile, window.location.origin).toString();

root.render(
  <TonConnectUIProvider manifestUrl={manifestUrl}>
    <App />
  </TonConnectUIProvider>
);
