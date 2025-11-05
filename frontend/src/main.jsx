import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
<StrictMode>
<App />
</StrictMode>
// Debug helper: log when main.jsx is executed so we can confirm the app bundle loads
console.log('[debug] main.jsx loaded')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
