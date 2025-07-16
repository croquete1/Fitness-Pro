import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
// ...
ReactDOM.createRoot(...).render(
  <BrowserRouter basename="/">
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);
