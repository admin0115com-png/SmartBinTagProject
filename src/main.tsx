console.log('🔥 main.tsx is running!')
console.log('root element:', document.getElementById('root'))

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootEl = document.getElementById('root');
if (!rootEl) {
  console.error('❌ ROOT ELEMENT NOT FOUND!')
} else {
  console.log('✅ Root element found, rendering App...')
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
