import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { ConfigProvider } from 'antd-mobile'
import enUS from 'antd-mobile/es/locales/en-US'
import { router } from './routes'
import { AuthProvider } from './context/Auth'
import { FlashScoreProvider } from './context/FlashScore'
import './index.css'
import LoadingMask from './components/LoadingMask'
import { Loading } from './global'
import 'lazysizes';
// import a plugin
import 'lazysizes/plugins/parent-fit/ls.parent-fit';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <FlashScoreProvider>
        <ConfigProvider locale={enUS}>
          <RouterProvider router={router} />
        </ConfigProvider>
      </FlashScoreProvider>
    </AuthProvider>
    <LoadingMask ref={Loading.set} />
  </React.StrictMode>
)
