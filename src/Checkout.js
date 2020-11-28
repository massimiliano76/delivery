import React, { Component } from "react";
import { Input, Row, Icon, Button, Card, Modal, Col } from "react-materialize";
import Cart from "./Cart";
import {
  handleInputChangeBind,
  getValueFormatted,
} from "./utilities/ComponentUtils";
import AutocompleteCustom from "./components/AutocompleteCustom";
import { Trans } from "@lingui/react";
import { NotificationManager } from "react-notifications";
import OrderRepository from "./repository/OrderRepository";
// import { connect } from "react-redux";
// import { addTodo } from "./redux/actions";

class Checkout extends Component {
  constructor(props) {
    super(props);
    this.state = this.getInitialState();
  }

  getInitialState = () => {
    return {
      phonenumber: "",
      address: "",
      complement: "",
      notes: "",
      change_to: "",
      product_display_description: "",
      products: [],
      total_amount: 0,
      credit_card_payment: false,
      change_difference: null,
      modal_opened: false,
    };
  };

  buttonClickPlaceOrder = () => {
    this.placeOrder();
  };

  clearAllFieds = () =>
    this.setState(this.getInitialState(), () => {
      this.triggerCartClear();
      this.setFocusOnPhonenumber();
    });

  buttonClickCashPayment = () => {
    this.setState({ credit_card_payment: false }, () => {
      this.calculateTotalAmount(this.state.products);
      this.setFocusOnChargeTo();
    });
  };

  buttonClickCreditCardPayment = () => {
    this.setState(
      { credit_card_payment: true, change_difference: null, change_to: "" },
      () => {
        this.calculateTotalAmount(this.state.products);
        this.setFocusOnNotes();
      }
    );
  };

  triggerCartClear = () => {
    if (!this.cartComponent) return;
    this.cartComponent.onCartClear();
  };

  triggerCartLoad = ({ products }) => {
    if (!this.cartComponent) return;

    this.triggerCartClear();
    this.cartComponent.onCartLoad(products);
    this.setFocusNextField();
  };

  placeOrder = () => {
    if (!this.isValid()) return;
    if (!this.summaryOrderModal) return;

    this.summaryOrderModal.showModal();
  };

  saveValidOrder = () => {
    if (!this.isValid()) return;
    const { address, complement, change_difference, products } = this.state;

    this.saveOrder();
    this.clearAllFieds();

    if (!this.summaryOrderModal) return;
    this.summaryOrderModal.hideModal();

    //TODO: add translation
    const product = products.reduce(
      (full_list, prod) => `${full_list} (${prod.quantity})${prod.description}`,
      ""
    );
    const change_text =
      change_difference == null
        ? ""
        : ` [Levar R$ ${change_difference} de Troco]`;
    const fifteen_seconds = 15 * 1000;

    NotificationManager.success(
      `${address} ${complement}${change_text} ${product}`.toUpperCase(),
      "Pedido criado",
      fifteen_seconds
    );
  };

  saveOrder = () => {
    const {
      phonenumber,
      address,
      complement,
      notes,
      change_to,
      products,
      total_amount,
      credit_card_payment,
      change_difference,
    } = this.state;
    const order = {
      phonenumber,
      address: address.toUpperCase(),
      complement: complement.toUpperCase(),
      notes: notes.toUpperCase(),
      change_to,
      products,
      total_amount,
      credit_card_payment,
      change_difference,
    };

    OrderRepository.save(order);
    // this.props.addTodo(order);
  };

  isValid = () => {
    const { address, products, total_amount, change_to } = this.state;
    const validChange = !change_to || change_to > total_amount;

    return address.length !== 0 && products.length !== 0 && validChange;
  };

  onProductsChange = (products) => {
    this.setState({ products }, () => {
      this.calculateTotalAmount(products);
      this.setFocusNextField();
    });
  };

  onChangePhonenumber = (evt, value) => {
    this.setState({
      phonenumber: value,
    });
  };

  onKeyPressOnlyNumber = (event) => {
    const keyCode = event.keyCode || event.which;
    const keyValue = String.fromCharCode(keyCode);
    const onlyNumbers = /^\d+$/;
    if (!onlyNumbers.test(keyValue)) {
      event.preventDefault();
    }
  };

  calculateTotalAmount = (products) => {
    let total_amount = 0;

    if (this.state.credit_card_payment) {
      total_amount = products.reduce(
        (total, prod) => total + prod.card * prod.quantity,
        0
      );
    } else {
      total_amount = products.reduce(
        (total, prod) => total + prod.cash * prod.quantity,
        0
      );
    }
    this.setState({ total_amount }, () => this.updateChangeDifference());
  };

  updateChangeDifference = () => {
    const { total_amount, change_to } = this.state;
    const change_difference = change_to - total_amount;

    this.setState({
      change_difference: change_difference > 0 ? change_difference : null,
    });
  };

  lazyAddressSearch = (address) => {
    return OrderRepository.searchByAddress(address);
  };

  lazyPhoneSearch = (phonenumber) => {
    if (!phonenumber) {
      return [];
    }

    const phone_only_digits = phonenumber
      .replace(/^\D+/g, "")
      .replace(/\s/g, "");
    return OrderRepository.searchByPhone(phone_only_digits);
  };

  handleOnAutocompleteLastOrderSearch = (order) => {
    this.setState(order, () => this.triggerCartLoad(order));
  };

  handleKeyDownPhonenumber = (event) => {
    if (event.key === "Enter") {
      this.setFocusOnAddress();
    }
  };

  handleKeyDownAddress = (event) => {
    if (event.key === "Enter") {
      this.setFocusOnComplement();
    }
  };

  handleKeyDownComplement = (event) => {
    if (event.key === "Enter") {
      this.setFocusOnProduct();
    }
  };

  handleKeyDownChange = (event) => {
    if (event.key === "Enter") {
      this.setFocusOnNotes();
    }
  };

  handleKeyDownNotes = (event) => {
    if (event.key === "Enter") {
      if (this.state.modal_opened) {
        this.saveValidOrder();
      } else {
        this.placeOrder();
      }
    }
  };

  setFocusNextField = () => {
    if (this.state.credit_card_payment) {
      this.setFocusOnNotes();
    } else {
      this.setFocusOnChargeTo();
    }
  };

  setFocusOnChargeTo = () => {
    if (!this.inputChargeTo) {
      return;
    }
    this.inputChargeTo.input.focus();
  };

  setFocusOnComplement = () => {
    if (!this.inputComplement) {
      return;
    }
    this.inputComplement.input.focus();
  };

  setFocusOnPhonenumber = () => {
    if (!this.inputPhonenumber) return;
    this.inputPhonenumber.setFocus();
  };

  setFocusOnAddress = () => {
    if (!this.inputAddress) return;
    this.inputAddress.setFocus();
  };

  setFocusOnNotes = () => {
    if (!this.inputNotes) return;
    this.inputNotes.input.focus();
  };

  setFocusOnProduct = () => {
    if (!this.cartComponent) return;
    this.cartComponent.focus();
  };

  render() {
    return (
      <div className="section" ref={(el) => (this.checkoutSection = el)}>
        <Row>
          <AutocompleteCustom
            id="phonenumber"
            title={<Trans id="checkout.phonenumber">Phone number</Trans>}
            placeholder="..."
            autoFocus
            className="phonenumber"
            lazyData={this.lazyPhoneSearch}
            onAutocomplete={this.handleOnAutocompleteLastOrderSearch}
            value={this.state.phonenumber}
            onChange={this.onChangePhonenumber}
            propertyField="phonenumber"
            s={12}
            icon="phone"
            ref={(el) => (this.inputPhonenumber = el)}
            onKeyDown={this.handleKeyDownPhonenumber}
            iconClassName="prefix"
            onKeyPressCustom={this.onKeyPressOnlyNumber}
            inputType="number"
          />

          <AutocompleteCustom
            id="address"
            title={<Trans id="checkout.address">Address</Trans>}
            placeholder="..."
            className="address"
            propertyField="address"
            required
            validate
            lazyData={this.lazyAddressSearch}
            onAutocomplete={this.handleOnAutocompleteLastOrderSearch}
            onKeyDown={this.handleKeyDownAddress}
            value={this.state.address}
            onChange={(event, value) => this.setState({ address: value })}
            s={12}
            m={7}
            icon="home"
            ref={(el) => (this.inputAddress = el)}
            iconClassName="prefix"
          />

          <Input
            id="complement"
            name="complement"
            placeholder="..."
            autocomplete="off"
            s={12}
            m={5}
            label={<Trans id="checkout.complement">Complement</Trans>}
            value={this.state.complement}
            ref={(el) => (this.inputComplement = el)}
            onKeyDown={this.handleKeyDownComplement}
            style={{ textTransform: "uppercase" }}
            onChange={handleInputChangeBind(this.setState.bind(this))}
          >
            <Icon>rate_review</Icon>
          </Input>
        </Row>

        <Cart
          onProductsChange={this.onProductsChange}
          ref={(el) => (this.cartComponent = el)}
        >
          <Card
            id="total_amount"
            actions={[
              <Row>
                <Button
                  id="cash-payment-button"
                  onClick={this.buttonClickCashPayment}
                  className={`col s12 m6 blue ${
                    this.state.credit_card_payment ? "lighten-4" : ""
                  }`}
                >
                  <Icon>attach_money</Icon>
                </Button>
                <Button
                  id="card-payment-button"
                  onClick={this.buttonClickCreditCardPayment}
                  className={`col s12 m6 blue ${
                    !this.state.credit_card_payment ? "lighten-4" : ""
                  }`}
                >
                  <Icon>credit_card</Icon>
                </Button>
              </Row>,
            ]}
            title={getValueFormatted(this.state.total_amount)}
          >
            {
              <Trans
                id={
                  this.state.credit_card_payment
                    ? "checkout.card"
                    : "checkout.cash"
                }
              >
                Total
              </Trans>
            }
          </Card>

          {this.state.credit_card_payment ? null : (
            <Input
              id="change_to"
              name="change_to"
              label={<Trans id="checkout.change_to">Change to</Trans>}
              placeholder="..."
              s={12}
              type="number"
              value={this.state.change_to}
              min={this.state.total_amount + 0.01}
              step="0.01"
              validate
              disabled={this.state.credit_card_payment}
              ref={(el) => (this.inputChargeTo = el)}
              onKeyDown={this.handleKeyDownChange}
              onChange={handleInputChangeBind(
                this.setState.bind(this),
                this.updateChangeDifference
              )}
            >
              <Icon>attach_money</Icon>
            </Input>
          )}
        </Cart>

        <Input
          id="notes"
          s={12}
          name="notes"
          label={<Trans id="checkout.notes">Notes</Trans>}
          placeholder="..."
          value={this.state.notes}
          ref={(el) => (this.inputNotes = el)}
          onKeyDown={this.handleKeyDownNotes}
          style={{ textTransform: "uppercase" }}
          onChange={handleInputChangeBind(this.setState.bind(this))}
        >
          <Icon>speaker_notes</Icon>
        </Input>

        <Row>
          <Button
            id="clear-button"
            onClick={this.clearAllFieds}
            className="col s12 m2 grey clear-button"
          >
            {<Trans id="checkout.clean">Clean</Trans>}
            <Icon left>clear_all</Icon>
          </Button>

          <Modal
            actions={[
              <Button flat modal="close" node="button" waves="green">
                {<Trans id="checkout.back">Voltar</Trans>}
              </Button>,
              <Button
                id="place-order-button"
                onClick={this.saveValidOrder}
                disabled={!this.isValid()}
                ref={(el) => (this.buttonPlaceOrderFinal = el)}
                className="col s12 m3 offset-m7"
              >
                {<Trans id="checkout.place_order">Place Order</Trans>}
                <Icon left>motorcycle</Icon>
              </Button>,
            ]}
            fixedFooter
            header={<Trans id="checkout.order_summary">Order Summary</Trans>}
            id="modal-order-summary"
            ref={(el) => (this.summaryOrderModal = el)}
            modalOptions={{
              ready: () => this.setState({ modal_opened: true }),
              complete: () => this.setState({ modal_opened: false }),
            }}
            root={[this.checkoutSection]}
            trigger={
              <Button
                id="modal-open-modal"
                node="button"
                className="col s12 m3 offset-m7"
                disabled={!this.isValid()}
              >
                {<Trans id="checkout.place_order">Place Order</Trans>}
                <Icon left>motorcycle</Icon>
              </Button>
            }
          >
            <Row>
              <Row></Row>
              <Col s={12} m={6}>
                <Row>
                  <Col s={12} m={12}>
                    <Icon small left>
                      phone
                    </Icon>
                    {this.state.phonenumber}
                  </Col>
                </Row>
                <Row>
                  <Col s={12} m={12}>
                    <Icon small left>
                      home
                    </Icon>
                    {this.state.address.toUpperCase()}{" "}
                    {this.state.complement.toUpperCase()}
                  </Col>
                </Row>
                <Row>
                  {this.state.notes.trim() === "" ? null : (
                    <Col s={12} m={12}>
                      <Icon small left>
                        speaker_notes
                      </Icon>
                      {this.state.notes.toUpperCase()}
                    </Col>
                  )}
                </Row>

                {this.state.products.map((product) => (
                  <Row>
                    <Col s={1} m={1}>
                      <Icon tinny left>
                        local_grocery_store
                      </Icon>
                    </Col>
                    <Col s={11} m={11}>
                      {product.quantity} x{" "}
                      {product.description
                        ? product.description.toUpperCase()
                        : ""}
                    </Col>
                  </Row>
                ))}

                <Row>
                  <Col s={1}>
                    <Icon>attach_money</Icon>
                  </Col>
                  <Col s={11}>
                    {
                      <Trans
                        id={
                          this.state.credit_card_payment
                            ? "checkout.payment_with_card"
                            : "checkout.payment_with_cash"
                        }
                      >
                        Total
                      </Trans>
                    }
                    {` ${getValueFormatted(this.state.total_amount)}`}
                  </Col>
                </Row>

                {this.state.change_to === "" ? null : (
                  <Row>
                    <Col s={1} m={1}>
                      <Icon>attach_money</Icon>
                    </Col>
                    <Col s={11} m={11}>
                      {<Trans id={"checkout.change_to"}>Change to</Trans>}
                      {` ${getValueFormatted(this.state.change_to)}`}
                    </Col>
                  </Row>
                )}

                {this.state.change_difference == null ? null : (
                  <Row>
                    <Col s={1} m={1}>
                      <Icon>attach_money</Icon>
                    </Col>
                    <Col s={11}>
                      {
                        <Trans id={"checkout.change_difference"}>
                          Cash change
                        </Trans>
                      }
                      {` ${getValueFormatted(this.state.change_difference)}`}
                    </Col>
                  </Row>
                )}
              </Col>
            </Row>
          </Modal>
        </Row>
      </div>
    );
  }
}

// export default connect(
//   null,
//   { addTodo }
// )(Checkout);

export default Checkout;
