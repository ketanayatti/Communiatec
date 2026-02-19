import React from "react";
import ReactDOM from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.jsx";
import "./index.css";
import { Toaster } from "./components/ui/sonner.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import AppWrapper from "./components/AppWrapper.jsx";

// Register Service Worker only in production; otherwise ensure any old SW is removed
if (import.meta.env.PROD) {
  registerSW({ immediate: true });
} else if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((r) => r.unregister());
  });
  if (typeof caches !== "undefined") {
    caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <SocketProvider>
    <AppWrapper>
      <App />
      <Toaster />
    </AppWrapper>
  </SocketProvider>
);
