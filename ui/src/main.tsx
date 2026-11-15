import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './app/App.tsx'
import { AppProviders } from './app/AppProviders.tsx'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element #root not found')
}

if (__MOCK_API__) {
  const { startMockApi } = await import('./mocks/browser.ts')
  // Render anyway if the worker cannot start, e.g. outside a secure context (`vite --host` over plain HTTP).
  await startMockApi().catch((error: unknown) => {
    console.error('[mock] Mock API failed to start, /api goes to the proxy', error)
  })
}

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
)
