import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Input, Row, Icon, Button, Card } from 'react-materialize';
import Cart from './Cart'
import { handleInputChangeBind, getValueFormatted } from './utilities/ComponentUtils'
import AutocompleteCustom from './components/AutocompleteCustom'
import OrderRepository from './repository/OrderRepository'
import { Trans } from "@lingui/react"


const minPhoneNumberSize = 4

class Checkout extends Component {
  static propTypes = {
    orderRepository: PropTypes.any.isRequired
  };

  static defaultProps = {
    orderRepository: new OrderRepository()
  }

  constructor(props) {
    super(props);
    this.state = this.getInitialState();
  }

  getInitialState = () => {
    return {
      phonenumber: '',
      address: '',
      complement: '',
      notes: '',
      change_to: '',
      product_display_description: '',
      products: [],
      total_amount: 0,
    }
  }

  buttonClickPlaceOrder = () => {
    if (!this.isValid()) return;
    this.placeOrder();
    this.clearAllFieds();
  }

  clearAllFieds = () => this.setState(this.getInitialState(), () => {
    this.triggerCartClear();
    this.setFocusOnPhonenumber();
  });

  triggerCartClear = () => {
    if (!this.cartComponent) return;
    this.cartComponent.onCartClear();
  }

  triggerCartLoad = ({ products }) => {
    if (!this.cartComponent) return;

    this.triggerCartClear();
    this.cartComponent.onCartLoad(products);
  }

  placeOrder = () => {
    const { phonenumber, address, complement, notes, change_to, products, total_amount } = this.state;
    const order = {
      phonenumber, address, complement, notes, change_to, products, total_amount
    }

    this.props.orderRepository.save(order);
  }

  isValid = () => {
    const { address, products } = this.state;
    return address.length !== 0 && products.length !== 0
  }

  onProductsChange = (products) => {
    this.setState({ products });

    this.calculateTotalAmount(products);
  }

  onChangeAddress = (evt, value) => {
    this.setState({
      address: value
    });
  }

  onChangePhonenumber = (evt, value) => {
    this.setState({
      phonenumber: value
    });
  }

  calculateTotalAmount = (products) => {
    const total_amount = products.reduce((total, prod) => total +  (prod.value * prod.quantity), 0);

    this.setState({ total_amount });
  }

  updateChangeDifference = () => {
    const { total_amount, change_to } = this.state;
    const change_difference = change_to - total_amount;

    this.setState( { change_difference: change_difference > 0 ? change_difference : null });
  }

  lazyAddressSearch = (address) => {
    return this.props.orderRepository.searchByAddress(address);
  }

  lazyPhoneSearch = (phonenumber) => {
    if (!phonenumber) {
        return [];
    }
    
    let phone_only_digits = phonenumber.replace(/^\D+/g, '').replace(/\s/g, '');
    if (phone_only_digits.length >= minPhoneNumberSize) {
      return this.props.orderRepository.searchByPhone(phone_only_digits);
    }
    return [];
  }

  handleOnAutocompleteAddress = (order) => {
    this.setState(order, this.triggerCartLoad(order));
  }

  setFocusOnChargeTo = () => {
    this.inputChargeTo.input.focus();
  }

  setFocusOnPhonenumber = () => {
    if (!this.inputPhonenumber) return;
    this.inputPhonenumber.setFocus();
  }

  render() {
    return (
      <div className='section'>
        <AutocompleteCustom
          id='phonenumber'
          title={<Trans id='checkout.phonenumber'>Phone number</Trans>}
          placeholder='...'
          autoFocus
          className='phonenumber'
          lazyData={this.lazyPhoneSearch}
          onAutocomplete={this.handleOnAutocompleteAddress}
          value={this.state.phonenumber}
          onChange={this.onChangePhonenumber}
          s={12}
          icon='phone'
          ref={(el) => this.inputPhonenumber = el}
          iconClassName='prefix' />

        <AutocompleteCustom
          id='address'
          title={<Trans id='checkout.address'>Address</Trans>}
          placeholder='...'
          className='address'
          required
          validate
          lazyData={this.lazyAddressSearch}
          onAutocomplete={this.handleOnAutocompleteAddress}
          value={this.state.address}
          onChange={this.onChangeAddress}
          s={12}
          icon='home'
          ref={(el) => this.inputAddress = el}
          iconClassName='prefix' />

        <Input
          id='complement'
          name='complement'
          placeholder='...'
          s={12}
          label={<Trans id='checkout.complement'>Complement</Trans>}
          value={this.state.complement}
          onChange={handleInputChangeBind(this.setState.bind(this))}><Icon>rate_review</Icon>
        </Input>

        <Cart onProductsChange={this.onProductsChange} ref={(el) => this.cartComponent = el}>
          <Card
            id='total_amount'
            title={getValueFormatted(this.state.total_amount)}>
            {<Trans id='checkout.total'>Total</Trans>}
          </Card>
          <Input
            id='change_to'
            name='change_to'
            label={<Trans id='checkout.change_to'>Change to</Trans>}
            placeholder='...'
            s={12}
            type='number'
            value={this.state.change_to}
            min={this.state.total_amount + 0.01}
            step='0.01'
            validate
            ref={(el) => this.inputChargeTo = el}
            onChange={handleInputChangeBind(this.setState.bind(this), this.updateChangeDifference)}><Icon>attach_money</Icon></Input>
        </Cart>

        <Input
          id='notes'
          s={12}
          name='notes'
          label={<Trans id='checkout.notes'>Notes</Trans>}
          placeholder='...'
          value={this.state.notes}
          onChange={handleInputChangeBind(this.setState.bind(this))}><Icon>speaker_notes</Icon></Input>

        <Row>
          <Button
            id='clear-button'
            onClick={this.clearAllFieds}
            className='col s12 m2 grey clear-button'>{<Trans id='checkout.clean'>Clean</Trans>}<Icon left>clear_all</Icon>
          </Button>
          <Button
            id='place-order-button'
            onClick={this.buttonClickPlaceOrder}
            disabled={!this.isValid()}
            className='col s12 m3 offset-m7'>{<Trans id='checkout.place_order'>Place Order</Trans>}<Icon left>motorcycle</Icon>
          </Button>
        </Row>
      </div>
    );
  }
}

export default Checkout;
