import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { ModalProvider } from "./context/modalContext.jsx";
import { DataProvider } from "./context/dataContext.jsx";
import { SocketProvider } from "./context/socketContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <DataProvider>
      <SocketProvider>
        <ModalProvider>
          <App />
        </ModalProvider>
      </SocketProvider>
    </DataProvider>
  </StrictMode>
);
