import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AdminSessionProvider from './providers/AdminSessionProvider.jsx'
import PublicDataProvider from './providers/PublicDataProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AdminSessionProvider>
      <PublicDataProvider>
        <App />
      </PublicDataProvider>
    </AdminSessionProvider>
  </StrictMode>,
)
