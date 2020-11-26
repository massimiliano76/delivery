import React from "react";
import Checkout from "./Checkout";
import "react-notifications/lib/notifications.css";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import OrderQueue from "./OrderQueue";
import OrderRepository from "./repository/OrderRepository";
import { AuthUserContext } from "./components/Session";

const drawerWidth = 380;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  appBar: {
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginRight: drawerWidth,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginLeft: theme.spacing(2),
  },
  hide: {
    display: "none",
  },
  drawer: {
    width: 0,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: "flex-end",
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: 0,
  },
  contentShift: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    [theme.breakpoints.up("sm")]: {
      marginRight: drawerWidth,
    },
  },
  badgePadding: {
    padding: theme.spacing(0, 2),
  },
}));

function CheckoutHome() {
  const classes = useStyles();
  const open = true;
  const orderRepository = new OrderRepository();

  return (
    <div className={classes.root}>
      <OrderQueue orderRepository={orderRepository} />

      <main
        className={clsx(classes.content, {
          [classes.contentShift]: open,
        })}
      >
        <AuthUserContext.Consumer>
          {(authUser) =>
            authUser ? <Checkout orderRepository={orderRepository} /> : null
          }
        </AuthUserContext.Consumer>
      </main>
    </div>
  );
}

export default CheckoutHome;
