import { StrictMode } from "react";
import { Provider } from "react-redux";
import { reduxstore, persistor } from "./redux/Store.jsx";
import { PersistGate } from "redux-persist/integration/react";
import { createRoot } from "react-dom/client";
import { PrimeReactProvider } from "primereact/api";
import App from "./App.jsx";
import { LayoutProvider } from "../layout/context/layoutcontent.jsx";
import "primereact/resources/themes/lara-light-purple/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import "../styles/layout/layout.scss";
import "./index.css";

createRoot(document.getElementById("root")).render(
    // <StrictMode>
        <Provider store={reduxstore}>
            <PersistGate loading={null} persistor={persistor}>
                <PrimeReactProvider>
                    <LayoutProvider>
                        <App />
                    </LayoutProvider>
                </PrimeReactProvider>
            </PersistGate>
        </Provider>
    // </StrictMode>
);
