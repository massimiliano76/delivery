import React, { Component } from "react";
import { Table, Input, Row, Icon, Col, Button } from "react-materialize";
import AutocompleteCustom from "./components/AutocompleteCustom";
import PropTypes from "prop-types";
import ProductRepository from "./repository/ProductRepository";
import { map } from "lodash";
import {
  handleInputChangeBind,
  getValueFormatted,
} from "./utilities/ComponentUtils";
import { Trans } from "@lingui/react";

class Cart extends Component {
  static propTypes = {
    onProductsChange: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = this.getInitialState();
  }

  getInitialState = () => {
    return {
      add_product_quantity: 1,
      product_display_description: "",
      products: [],
    };
  };

  onCartClear = () => this.setState(this.getInitialState());

  onCartLoad = (products) => {
    const { onProductsChange } = this.props;
    const freshProduct = products
      .map((product) => {
        const freshProduct = ProductRepository.getById(product.product_id);
        if (!freshProduct) {
          return null;
        }

        return {
          product_id: freshProduct.id,
          description: freshProduct.description,
          cash: freshProduct.cash,
          card: freshProduct.card,
          quantity: product.quantity,
        };
      })
      .filter((product) => product != null);

    this.setState({ products: freshProduct }, () =>
      onProductsChange(freshProduct)
    );
  };

  handleOnAutocompleteProduct = (value) => {
    this.setState(
      {
        add_product: value,
      },
      () => this.focusQuantity()
    );
  };

  focusQuantity = () => {
    if (!this.quantityInputField || !this.quantityInputField.input) return;
    this.quantityInputField.input.focus();
  };

  focusProduct = () => {
    if (!this.productInputField) return;
    this.productInputField.setFocus();
  };

  focus = () => {
    this.focusProduct();
  };

  onChangeProductDisplay = (evt, value) => {
    this.setState({
      product_display_description: value,
    });
  };

  handleKeyDownQuantity = (event) => {
    if (event.key === "Enter") {
      this.addProduct();
    }
  };

  addProduct = () => {
    if (!this.state.add_product) {
      this.focusProduct();
      return;
    }

    const { onProductsChange } = this.props;

    const product = {
      product_id: this.state.add_product.id,
      description: this.state.add_product.description,
      cash: this.state.add_product.cash,
      card: this.state.add_product.card,
      quantity:
        this.state.add_product_quantity > 0
          ? this.state.add_product_quantity
          : 1,
    };

    this.setState(
      {
        products: [...this.state.products, product],
        add_product_quantity: 1,
        product_display_description: "",
        add_product: null,
      },
      () => {
        onProductsChange(this.state.products);
      }
    );
  };

  onRemoveProduct = (product_to_remove) => {
    const { onProductsChange } = this.props;
    const { products } = this.state;

    this.setState(
      {
        products: products.filter(function (product) {
          return product !== product_to_remove;
        }),
      },
      () => {
        onProductsChange(this.state.products);
      }
    );
  };

  convertProductsToAutocompleteMap = (arr) => {
    return arr.reduce(function (map, obj) {
      const productDisplay = `${obj.description.toUpperCase()} (R$ ${
        obj.cash
      })`;
      map[productDisplay] = obj;
      return map;
    }, {});
  };

  fillProductTable = () => {
    const { products } = this.state;

    if (products.length === 0)
      return (
        <tr>
          <th colSpan="5" onClick={this.focusProduct}>
            {<Trans id="cart.add_a_product">Add a product...</Trans>}
          </th>
        </tr>
      );

    return map(products, (product, i) => (
      <tr key={i}>
        <td>
          {product && product.description != null
            ? product.description.toUpperCase()
            : ""}
        </td>
        <td className="center-align">{getValueFormatted(product.cash)}</td>
        <td className="center-align">{product.quantity}</td>
        <td className="center-align">
          {getValueFormatted(product.quantity * product.cash)}
        </td>
        <td>
          <a
            id={`remove-product-${i}`}
            href="#!"
            className="waves-effect waves-light btn-small"
            onClick={this.onRemoveProduct.bind(this, product)}
          >
            <i className="small material-icons red-text text-darken-4">
              delete
            </i>
          </a>
        </td>
      </tr>
    ));
  };

  render() {
    const products = this.convertProductsToAutocompleteMap(
      ProductRepository.all()
    );

    return (
      <Row>
        <AutocompleteCustom
          id="product_display_description"
          title={<Trans id="cart.product">Product</Trans>}
          className="product"
          placeholder="..."
          data={products}
          expandOnFocus={true}
          onAutocomplete={this.handleOnAutocompleteProduct}
          value={this.state.product_display_description}
          ref={(el) => (this.productInputField = el)}
          onChange={this.onChangeProductDisplay}
          s={12}
          m={6}
          icon="local_grocery_store"
          iconClassName="prefix"
        />

        <Input
          id="add_product_quantity"
          name="add_product_quantity"
          label={<Trans id="cart.quantity">Quantity</Trans>}
          value={this.state.add_product_quantity}
          ref={(el) => (this.quantityInputField = el)}
          s={12}
          m={3}
          type="number"
          required
          validate
          min="1"
          step="1"
          onKeyDown={this.handleKeyDownQuantity}
          onChange={handleInputChangeBind(this.setState.bind(this))}
        >
          <Icon>list_alt</Icon>
        </Input>

        <Button
          id="add-product-button"
          onClick={this.addProduct}
          className="col s12 m3"
        >
          {<Trans id="cart.add">Add</Trans>}
          <Icon left>add_shopping_cart</Icon>
        </Button>

        <Col s={12} m={9}>
          <Table className="striped">
            <thead>
              <tr>
                <th data-field="description">
                  {<Trans id="cart.description">Description</Trans>}
                </th>
                <th data-field="price" className="center-align">
                  {<Trans id="cart.item_price">Item Price</Trans>}
                </th>
                <th data-field="quantity" className="center-align">
                  {<Trans id="cart.quantity">Quantity</Trans>}
                </th>
                <th data-field="total" className="center-align">
                  {<Trans id="cart.item_total">Item Total</Trans>}
                </th>
                <th></th>
              </tr>
            </thead>

            <tbody>{this.fillProductTable()}</tbody>
          </Table>
        </Col>

        <Col s={12} m={3}>
          {this.props.children}
        </Col>
      </Row>
    );
  }
}

export default Cart;
