// src/main.jsx

-import React from 'react'
-import ReactDOM from 'react-dom/client'
-import { ChakraProvider, theme } from 'horizon-ui-chakra'
+import React from 'react'
+import ReactDOM from 'react-dom/client'
 import { BrowserRouter } from 'react-router-dom'
 import App from './App'

 // importa o CSS do CoreUI
 import '@coreui/coreui/dist/css/coreui.min.css'

-ReactDOM.createRoot(document.getElementById('root')).render(
-  <ChakraProvider theme={theme}>
-    <App />
-  </ChakraProvider>
-)
+ReactDOM.createRoot(document.getElementById('root')).render(
+  <BrowserRouter>
+    <App />
+  </BrowserRouter>
+)
