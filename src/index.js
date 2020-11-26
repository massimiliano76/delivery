import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import "react-notifications/lib/notifications.css";
import { Provider } from "react-redux";
import store from "./redux/store";
import App from "./App";
import { SnackbarProvider } from "notistack";
import Firebase, { FirebaseContext } from "./components/Firebase";

ReactDOM.render(
  <Router>
    <Provider store={store}>
      <SnackbarProvider>
        <FirebaseContext.Provider value={new Firebase()}>
          <App language="pt-BR" />
        </FirebaseContext.Provider>
      </SnackbarProvider>
    </Provider>
  </Router>,
  document.getElementById("root")
);
