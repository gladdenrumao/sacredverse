import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId="728163415069-qomtbm2bslm7pceva4vvkfs6k6ofo3se.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);
