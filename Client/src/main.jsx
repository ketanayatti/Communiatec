import React from 'react'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.jsx'
import './index.css'
import { Toaster } from './components/ui/sonner.jsx'
import { SocketProvider } from './context/SocketContext.jsx'
import AppWrapper from './components/AppWrapper.jsx'

// register service worker with immediate update check
registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById('root')).render(
  <SocketProvider>
    <AppWrapper>
    <App />
    <Toaster position='top-center' richColors duration={2000} expand />
    </AppWrapper>
  </SocketProvider>
)
