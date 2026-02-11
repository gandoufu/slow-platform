import React from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider } from 'antd';
import AppRouter from './router';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider>
      <AppRouter />
    </ConfigProvider>
  </React.StrictMode>,
);
