// display-client/src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import ScanDisplay from './ScanDisplay'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ScanDisplay />
  </React.StrictMode>,
)
