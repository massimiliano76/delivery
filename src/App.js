import React, { useState, useEffect, Fragment } from "react";
import { Route, Switch } from "react-router-dom";
import CheckoutHome from "./CheckoutHome";
import { I18nProvider } from "@lingui/react";
import "react-notifications/lib/notifications.css";
import { NotificationContainer } from "react-notifications";
import CssBaseline from "@material-ui/core/CssBaseline";
import Products from "./components/products/ProductList";
import EditOrAddProduct from "./components/products/EditOrAddProduct";
import { useSnackbar } from "notistack";
import * as serviceWorker from "./serviceWorker";
import { Button } from "@material-ui/core";
import * as ROUTES from "./constants/routes";
import SignUpPage from "./components/SignUp";
import SignInPage from "./components/SignIn";
import SignOutButton from "./components/SignOut";
import { withAuthentication } from "./components/Session";
import PasswordForgetPage from "./components/PasswordForget";

function App(props) {
  const { language } = props;
  const localeMessage = require(`./locales/${language}/messages.js`);
  const { enqueueSnackbar } = useSnackbar();
  const [
    newVersionAvailableAndWorker,
    setNewVersionAvailableAndWorker,
  ] = useState({
    newVersionAvailable: false,
    waitingWorker: {},
  });

  useEffect(() => {
    const onServiceWorkerUpdate = (registration) => {
      setNewVersionAvailableAndWorker({
        newVersionAvailable: true,
        waitingWorker: registration && registration.waiting,
      });
    };

    const updateServiceWorker = () => {
      const { waitingWorker } = newVersionAvailableAndWorker;
      waitingWorker && waitingWorker.postMessage({ type: "SKIP_WAITING" });

      setNewVersionAvailableAndWorker({
        newVersionAvailable: false,
      });
      window.location.reload();
    };

    const refreshAction = (key) => {
      return (
        <Fragment>
          <Button
            className="snackbar-button"
            size="small"
            color="primary"
            variant="contained"
            onClick={updateServiceWorker}
          >
            {"Atualizar"}
          </Button>
        </Fragment>
      );
    };

    const { newVersionAvailable } = newVersionAvailableAndWorker;
    if (process.env.NODE_ENV === "production") {
      serviceWorker.register({ onUpdate: onServiceWorkerUpdate });
    }

    if (newVersionAvailable) {
      enqueueSnackbar("Uma nova versão foi disponibilizada", {
        persist: true,
        variant: "success",
        action: refreshAction(),
      });
    }
  }, [newVersionAvailableAndWorker, enqueueSnackbar]);

  return (
    <I18nProvider language={language} catalogs={{ [language]: localeMessage }}>
      <CssBaseline />

      <Switch>
        <Route exact path={["/", "/checkout"]} component={CheckoutHome} />
        <Route exact path="/products" component={Products} />
        <Route exact path="/products/add" component={EditOrAddProduct} />
        <Route path="/products/:id" component={EditOrAddProduct} />

        <Route path={ROUTES.SIGN_UP} component={SignUpPage} />
        <Route path={ROUTES.SIGN_IN} component={SignInPage} />
        <Route path={ROUTES.PASSWORD_FORGET} component={PasswordForgetPage} />
        {/*<Route path={ROUTES.HOME} component={HomePage} />
        <Route path={ROUTES.ACCOUNT} component={AccountPage} />
        <Route path={ROUTES.ADMIN} component={AdminPage} /> */}
      </Switch>

      <SignOutButton />

      <NotificationContainer />
    </I18nProvider>
  );
}

export default withAuthentication(App);
