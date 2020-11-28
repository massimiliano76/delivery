import React, { Component } from "react";
import OrderRepository from "./repository/OrderRepository";
import { Trans } from "@lingui/react";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import Typography from "@material-ui/core/Typography";
import { getValueFormatted } from "./utilities/ComponentUtils";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Box from "@material-ui/core/Box";
import PropTypes from "prop-types";
import Badge from "@material-ui/core/Badge";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ListIcon from "@material-ui/icons/List";
import CloseOutlinedIcon from "@material-ui/icons/CloseOutlined";
import Hidden from "@material-ui/core/Hidden";
import Fab from "@material-ui/core/Fab";
import Pagination from "@material-ui/lab/Pagination";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

const useStylesAccordion = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
}));

function OrderCard(props) {
  const classesAccordion = useStylesAccordion();
  const handleCancelOrder = props.handleCancelOrder;
  const handleShippedOrder = props.handleShippedOrder;
  const handleDeliveredOrder = props.handleDeliveredOrder;

  function _getMinutesOnQueue(utcDate) {
    var today = new Date();
    var utcDateToCompare = new Date(utcDate);
    var diffMs = today - utcDateToCompare;

    var diffDays = Math.floor(diffMs / 86400000);
    if (diffDays >= 1) {
      return `${diffDays}d`;
    }

    var diffHrs = Math.floor((diffMs % 86400000) / 3600000);
    var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
    if (diffHrs >= 1) {
      return `${diffHrs}h ${diffMins}min`;
    }

    return `${diffMins}min`;
  }

  function _getLocalDate(utcDate) {
    var localDate = new Date(utcDate);
    return localDate.toLocaleString();
  }

  function handleCancelClick() {
    handleCancelOrder(props.order.id);
  }

  function handleShippedClick() {
    handleShippedOrder(props.order.id);
  }

  function handleDeliveredClick() {
    handleDeliveredOrder(props.order.id);
  }

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id={`panel-header-${props.order.id}`}
      >
        <Typography className={classesAccordion.heading}>
          {props.order.address} {props.order.complement}
        </Typography>
        <Typography
          className={classesAccordion.title}
          color="textSecondary"
          gutterBottom
        >
          ({_getMinutesOnQueue(props.order.created)})
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Card className={classesAccordion.root} variant="outlined">
          <CardContent>
            <Typography
              className={classesAccordion.title}
              color="textSecondary"
              gutterBottom
            >
              {_getLocalDate(props.order.created)}
            </Typography>
            <Typography variant="h7" component="h7" display="block">
              {props.order.address} {props.order.complement}
            </Typography>

            {props.order.phonenumber === "" ? null : (
              <Typography variant="overline" display="block">
                TEL.: {props.order.phonenumber}
              </Typography>
            )}

            {props.order.notes === "" ? null : (
              <Typography variant="overline" display="block">
                OBS.: {props.order.notes}
              </Typography>
            )}

            {props.order.products.map((prod) => (
              <Typography color="textSecondary" gutterBottom>
                {prod.quantity} {prod.description}
              </Typography>
            ))}

            <Typography variant="body2" component="p">
              Total em{" "}
              {
                <Trans
                  id={
                    props.order.credit_card_payment
                      ? "checkout.card"
                      : "checkout.cash"
                  }
                >
                  Total
                </Trans>
              }
              : {getValueFormatted(props.order.total_amount)}
            </Typography>

            {props.order.change_difference == null ? null : (
              <Typography variant="body2" component="p">
                Levar troco de{" "}
                {getValueFormatted(props.order.change_difference)}
              </Typography>
            )}
          </CardContent>
          <CardActions>
            <Button size="small" variant="outlined" onClick={handleCancelClick}>
              Cancelar
            </Button>
            {handleShippedOrder == null ? null : (
              <Button
                size="small"
                color="primary"
                variant="contained"
                onClick={handleShippedClick}
              >
                Entregar
              </Button>
            )}
            {handleDeliveredOrder == null ? null : (
              <Button
                size="small"
                color="primary"
                variant="contained"
                onClick={handleDeliveredClick}
              >
                Entregue
              </Button>
            )}
          </CardActions>
        </Card>
      </AccordionDetails>
    </Accordion>
  );
}

const drawerWidth = 380;

const useStyles = (theme) => ({
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
  marginFloatButton: {
    position: "fixed",
    top: theme.spacing(2),
    right: theme.spacing(2),
  },
  marginFloatCloseTabButton: {
    position: "fixed",
    top: theme.spacing(1),
    right: theme.spacing(2),
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
    marginRight: drawerWidth,
  },
  badgePadding: {
    padding: theme.spacing(0, 2),
  },
  pagination: {
    background: "#ffffff",
  },
});

const ordersPerPage = 25;
const orderQueueTab = 0;
const orderShippedTab = 1;

class OrderQueue extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ordersQueue: [],
      ordersQueueSize: 0,
      ordersShipped: [],
      ordersShippedSize: 0,
      value: 0,
      open: false,
      ordersQueuePage: 1,
      ordersShippedPage: 1,
    };
    this.window = this.props.window;
    this.container =
      this.window !== undefined ? () => this.window.document.body : undefined;
  }

  componentDidMount() {
    this.fetchOrdersInQueue();
    //REMOVE TIMER AND APPLY REDUX
    this.timer = setInterval(() => this.fetchOrdersInQueue(), 2000);
  }

  fetchOrdersInQueue = () => {
    const ordersQueueSize = OrderRepository.allInTheQueueSize();
    const ordersShippedSize = OrderRepository.allShippedSize();
    this.setState({ ordersQueueSize, ordersShippedSize });

    if (this.state.value === orderQueueTab) {
      this.fetchQueue();
    } else if (this.state.value === orderShippedTab) {
      this.fetchShipped();
    }
  };

  handleQueuePageChange = (event, value) => {
    this.setState({ ordersQueuePage: value }, () => this.fetchQueue());
  };

  handleShippedPageChange = (event, value) => {
    this.setState({ ordersShippedPage: value }, () => this.fetchShipped());
  };

  fetchQueue = () => {
    const ordersQueue = OrderRepository.allInTheQueue(
      this.state.ordersQueuePage,
      ordersPerPage
    );
    this.setState({ ordersQueue });
  };

  fetchShipped = () => {
    const ordersShipped = OrderRepository.allShipped(
      this.state.ordersShippedPage,
      ordersPerPage
    );
    this.setState({ ordersShipped });
  };

  handleShippedOrder = (orderId) => {
    OrderRepository.markAsShipped(orderId);
    this.removeOrderQueueFromState(orderId);
  };

  handleCancelOrder = (orderId) => {
    OrderRepository.markAsCanceled(orderId);
    this.removeOrderQueueFromState(orderId);
    this.removeOrderShippedFromState(orderId);
  };

  handleDeliveredOrder = (orderId) => {
    OrderRepository.markAsDeliverid(orderId);
    this.removeOrderShippedFromState(orderId);
  };

  handleChange = (event, newValue) => {
    this.setState({ value: newValue }, () => this.fetchOrdersInQueue());
  };

  removeOrderQueueFromState(orderId) {
    this.setState({
      ordersQueue: this.state.ordersQueue.filter(
        (order) => order.id !== orderId
      ),
    });
  }

  removeOrderShippedFromState(orderId) {
    this.setState({
      ordersShipped: this.state.ordersShipped.filter(
        (order) => order.id !== orderId
      ),
    });
  }

  render() {
    const { classes } = this.props;
    const drawer = (
      <div>
        <Paper square>
          <Tabs
            value={this.state.value}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            onChange={this.handleChange}
          >
            <Tab
              label={
                <Badge
                  className={classes.badgePadding}
                  color="primary"
                  badgeContent={this.state.ordersQueueSize}
                  max={999}
                >
                  Fila
                </Badge>
              }
            />
            <Tab
              label={
                <Badge
                  className={classes.badgePadding}
                  color="primary"
                  badgeContent={this.state.ordersShippedSize}
                  max={999}
                >
                  Rota
                </Badge>
              }
            />
          </Tabs>
          <TabPanel value={this.state.value} index={orderQueueTab}>
            {this.state.ordersQueue.map((order) => (
              <OrderCard
                key={`order-${order.id}`}
                order={order}
                handleCancelOrder={this.handleCancelOrder}
                handleShippedOrder={this.handleShippedOrder}
              />
            ))}
            <Box hidden={this.state.ordersQueueSize < ordersPerPage}>
              <Pagination
                count={Math.ceil(this.state.ordersQueueSize / ordersPerPage)}
                size="small"
                className={classes.pagination}
                page={this.state.ordersQueuePage}
                onChange={this.handleQueuePageChange}
              />
            </Box>
          </TabPanel>
          <TabPanel value={this.state.value} index={orderShippedTab}>
            {this.state.ordersShipped.map((order) => (
              <OrderCard
                key={`order-${order.id}`}
                order={order}
                handleCancelOrder={this.handleCancelOrder}
                handleDeliveredOrder={this.handleDeliveredOrder}
              />
            ))}
            <Box hidden={this.state.ordersShippedSize < ordersPerPage}>
              <Pagination
                count={Math.ceil(this.state.ordersShippedSize / ordersPerPage)}
                size="small"
                className={classes.pagination}
                page={this.state.ordersShippedPage}
                onChange={this.handleShippedPageChange}
              />
            </Box>
          </TabPanel>
        </Paper>
      </div>
    );

    return (
      <React.Fragment>
        <Hidden xsDown implementation="css">
          <Drawer
            id="drawer-regular-size"
            container={this.container}
            className={classes.drawer}
            variant="persistent"
            anchor="right"
            open={true}
            classes={{
              paper: classes.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
          >
            {drawer}
          </Drawer>
        </Hidden>
        <Hidden mdUp>
          <Box zIndex="modal">
            <Fab
              size="small"
              color="primary"
              aria-label="list"
              className={classes.marginFloatButton}
              onClick={() => this.setState({ open: true })}
            >
              <ListIcon />
            </Fab>
          </Box>

          <Drawer
            id="drawer-small-size"
            container={this.container}
            className={classes.drawer}
            variant="variant"
            anchor="right"
            open={this.state.open}
            classes={{
              paper: classes.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
          >
            {drawer}

            <Fab
              size="small"
              aria-label="close"
              className={classes.marginFloatCloseTabButton}
              onClick={() => this.setState({ open: false })}
            >
              <CloseOutlinedIcon />
            </Fab>
          </Drawer>
        </Hidden>
      </React.Fragment>
    );
  }
}

export default withStyles(useStyles)(OrderQueue);
