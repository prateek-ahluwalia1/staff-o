import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import "./assets/css/bootstrap.min.css";
import "./assets/css/main.css";
import "./assets/css/owl.carousel.css";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store, { persistor } from "./store/store";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

//423205543558-ematljacmhiuoh2ftenk5diu5ntpn6ss.apps.googleusercontent.com        --> Client ID
//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             --> Client Secret

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="423205543558-ematljacmhiuoh2ftenk5diu5ntpn6ss.apps.googleusercontent.com ">
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <App />
          <ToastContainer />
        </PersistGate>
      </Provider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
);
