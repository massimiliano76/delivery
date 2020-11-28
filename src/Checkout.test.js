import React from "react";
import Checkout from "./Checkout";
import { shallow, mount } from "enzyme";
import Cart from "./Cart";
import TestUtils from "react-dom/test-utils";
import OrderRepository from "./repository/OrderRepository";

describe("Checkout component load", () => {
  it("should focus in the phonenumber field", () => {
    const output = mount(<Checkout />);

    expect(output.find("input#phonenumber").getElement().props.id).to.be.equal(
      document.activeElement.id
    );
  });
});

describe("Checkout place order", () => {
  let spyPlaceOrder,
    spySaveValidOrder,
    wrapper,
    sandbox,
    componentRender,
    stubOrderRespositorySearchByAddress,
    stubSearchByPhone,
    stubOrderRespositorySave;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    stubOrderRespositorySearchByAddress = sandbox
      .stub(OrderRepository, "searchByAddress")
      .returns({});
    stubSearchByPhone = sandbox.stub(OrderRepository, "searchByPhone").returns({
      phonenumber: "9988",
      complement: "101 room",
      notes: "Fast delivery",
    });

    stubOrderRespositorySave = sandbox.stub(OrderRepository, "save");

    wrapper = shallow(<Checkout />);
    componentRender = wrapper.instance();

    spyPlaceOrder = sandbox.spy(componentRender, "placeOrder");
    spySaveValidOrder = sandbox.spy(componentRender, "saveValidOrder");
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should fill the address field", () => {
    wrapper
      .find("#address")
      .shallow()
      .find("input")
      .simulate("change", { target: { name: "address", value: "101 Street" } });

    expect(wrapper.state("address")).to.equal("101 Street");
  });

  it("should not continue if address is empty", () => {
    wrapper
      .find("#modal-order-summary")
      .shallow()
      .find("#place-order-button")
      .simulate("click");

    expect(stubOrderRespositorySave).to.not.have.been.called;
  });

  it("should not continue if products is empty", () => {
    wrapper
      .find("#address")
      .shallow()
      .find("input")
      .simulate("change", { target: { name: "address", value: "101 Street" } });

    wrapper
      .find("#modal-order-summary")
      .shallow()
      .find("#place-order-button")
      .simulate("click");

    expect(stubOrderRespositorySave).to.not.have.been.called;
  });

  it("should continue if address and products filled", () => {
    wrapper
      .find("#address")
      .shallow()
      .find("input")
      .simulate("change", { target: { name: "address", value: "101 Street" } });

    componentRender.onProductsChange([
      { product_id: 1, description: "Water", cash: 3.5, quantity: 2 },
    ]);

    wrapper
      .find("#modal-order-summary")
      .shallow()
      .find("#place-order-button")
      .simulate("click");

    expect(spySaveValidOrder).to.have.been.called;
  });

  it("should disable placeOrder button if not valid", () => {
    expect(
      wrapper
        .find("#modal-order-summary")
        .shallow()
        .find("#place-order-button")
        .props().disabled
    ).to.be.true;
  });

  it("should enable placeOrder button if has address and product", () => {
    wrapper
      .find("#address")
      .shallow()
      .find("input")
      .simulate("change", { target: { name: "address", value: "101 Street" } });

    componentRender.onProductsChange([
      { product_id: 1, description: "Water", cash: 3.5, quantity: 2 },
    ]);

    expect(
      wrapper
        .find("#modal-order-summary")
        .shallow()
        .find("#place-order-button")
        .props().disabled
    ).to.be.false;
  });

  it("should fill the address complement field", () => {
    wrapper
      .find("#complement")
      .simulate("change", { target: { name: "complement", value: "ap. 202" } });

    expect(wrapper.state("complement")).to.equal("ap. 202");
  });

  it("should fill the note field", () => {
    wrapper.find("#notes").simulate("change", {
      target: { name: "notes", value: "good customer" },
    });

    expect(wrapper.state("notes")).to.equal("good customer");
  });

  it("should fill the phonenumber field", () => {
    wrapper
      .find("#phonenumber")
      .shallow()
      .find("input")
      .simulate("change", {
        target: { name: "phonenumber", value: "988776655" },
      });

    expect(wrapper.state("phonenumber")).to.equal("988776655");
  });

  it("should focus change field when choose product", () => {
    const checkout = TestUtils.renderIntoDocument(<Checkout />);

    checkout.onProductsChange([
      { product_id: 1, description: "Water", cash: 3.5, quantity: 1 },
    ]);

    expect(document.activeElement.id).to.be.equal("change_to");
  });

  it("should focus address field when press enter in phonenumber field", () => {
    const checkout = TestUtils.renderIntoDocument(<Checkout />);

    checkout.setFocusOnChargeTo();

    checkout.handleKeyDownPhonenumber({ key: "Enter" });

    expect(document.activeElement.id).to.be.equal("address");
  });

  it("should focus complement field when press enter in address field", () => {
    const checkout = TestUtils.renderIntoDocument(<Checkout />);

    checkout.setFocusOnChargeTo();

    checkout.handleKeyDownAddress({ key: "Enter" });

    expect(document.activeElement.id).to.be.equal("complement");
  });

  it("should focus product field when press enter in complement field", () => {
    const checkout = TestUtils.renderIntoDocument(<Checkout />);

    checkout.setFocusOnChargeTo();

    checkout.handleKeyDownComplement({ key: "Enter" });

    expect(document.activeElement.id).to.be.equal(
      "product_display_description"
    );
  });

  it("should focus note field when enter in change field", () => {
    const checkout = TestUtils.renderIntoDocument(<Checkout />);

    checkout.setFocusOnChargeTo();

    checkout.handleKeyDownChange({ key: "Enter" });

    expect(document.activeElement.id).to.be.equal("notes");
  });

  it("should place order when enter on notes field", () => {
    wrapper
      .find("#address")
      .shallow()
      .find("input")
      .simulate("change", { target: { name: "address", value: "101 Street" } });

    componentRender.onProductsChange([
      { product_id: 1, description: "Water", cash: 3.5, quantity: 2 },
    ]);

    componentRender.handleKeyDownNotes({ key: "Enter" });

    expect(spyPlaceOrder).to.have.been.called;
  });

  describe("calculate total order amount", () => {
    it("should calculate", () => {
      componentRender.onProductsChange([
        { product_id: 1, description: "Water", cash: 3.5, quantity: 2 },
        { product_id: 2, description: "Product", cash: 4.0, quantity: 3 },
      ]);

      expect(wrapper.state("total_amount")).to.equal(19);
    });

    it("should format", () => {
      componentRender.onProductsChange([
        { product_id: 1, description: "Water", cash: 3.5, quantity: 2 },
      ]);

      expect(wrapper.find("#total_amount").props().title).to.equal("R$ 7.00");
    });

    it("should calculate total by card", () => {
      wrapper.setState({ credit_card_payment: true });

      componentRender.onProductsChange([
        {
          product_id: 1,
          description: "Water",
          cash: 3.5,
          card: 4.0,
          quantity: 2,
        },
        {
          product_id: 2,
          description: "Product",
          cash: 4.0,
          card: 4.5,
          quantity: 3,
        },
      ]);

      expect(wrapper.state("total_amount")).to.equal(21.5);
      expect(wrapper.state("change_difference")).to.equal(null);
    });
  });

  describe("calculate change to value", () => {
    it("should calculate", () => {
      componentRender.onProductsChange([
        { product_id: 1, description: "Water", cash: 3.5, quantity: 2 },
      ]);
      wrapper
        .find("#change_to")
        .simulate("change", { target: { name: "change_to", value: 20 } });

      expect(wrapper.state("change_difference")).to.equal(13.0);
    });

    it("should calculate change if field filled before add the product", () => {
      wrapper
        .find("#change_to")
        .simulate("change", { target: { name: "change_to", value: 20 } });

      componentRender.onProductsChange([
        { product_id: 1, description: "Water", cash: 3.5, quantity: 2 },
      ]);

      expect(wrapper.state("change_difference")).to.equal(13.0);
    });

    it("should be empty if less then total amount", () => {
      componentRender.onProductsChange([
        { product_id: 1, description: "Water", cash: 3.5, quantity: 2 },
      ]);
      wrapper
        .find("#change_to")
        .simulate("change", { target: { name: "change_to", value: 6.0 } });

      expect(wrapper.state("change_difference")).to.equal(null);
    });

    it("should be empty if equal to the total amount", () => {
      componentRender.onProductsChange([
        { product_id: 1, description: "Water", cash: 3.5, quantity: 2 },
      ]);
      wrapper
        .find("#change_to")
        .simulate("change", { target: { name: "change_to", value: 7.0 } });

      expect(wrapper.state("change_difference")).to.equal(null);
    });

    it("should be empty if non numeric", () => {
      componentRender.onProductsChange([
        { product_id: 1, description: "Water", cash: 3.5, quantity: 2 },
      ]);
      wrapper.find("#change_to").simulate("change", {
        target: { name: "change_to", value: "non numeric" },
      });

      expect(wrapper.state("change_difference")).to.equal(null);
    });

    it("should not enable placeOrder button if less than total", () => {
      wrapper
        .find("#address")
        .shallow()
        .find("input")
        .simulate("change", {
          target: { name: "address", value: "101 Street" },
        });

      componentRender.onProductsChange([
        { product_id: 1, description: "Water", cash: 3.5, quantity: 1 },
      ]);

      wrapper
        .find("#change_to")
        .simulate("change", { target: { name: "change_to", value: 3.0 } });

      expect(
        wrapper
          .find("#modal-order-summary")
          .shallow()
          .find("#place-order-button")
          .props().disabled
      ).to.be.true;
    });
  });

  describe("clear button", () => {
    it("should address field be empty", () => {
      wrapper
        .find("#address")
        .simulate(
          "change",
          { target: { name: "address", value: "101 Street" } },
          "101 Street"
        );

      wrapper.find("#clear-button").simulate("click");

      expect(wrapper.find("#address").shallow().find("input").props().value).to
        .be.empty;
      expect(wrapper.state("address")).to.be.empty;
    });

    it("should complement field be empty", () => {
      wrapper.find("#complement").simulate("change", {
        target: { name: "complement", value: "ap. 202" },
      });

      wrapper.find("#clear-button").simulate("click");

      expect(wrapper.state("complement")).to.be.empty;
      expect(wrapper.find("#complement").shallow().find("input").props().value)
        .to.be.empty;
    });

    it("should notes field be empty", () => {
      wrapper.find("#notes").simulate("change", {
        target: { name: "notes", value: "Missing house number" },
      });

      wrapper.find("#clear-button").simulate("click");

      expect(wrapper.state("notes")).to.be.empty;
      expect(wrapper.find("#notes").shallow().find("input").props().value).to.be
        .empty;
    });

    it("should change_to field be null", () => {
      wrapper
        .find("#change_to")
        .simulate("change", { target: { name: "change_to", value: "100" } });

      wrapper.find("#clear-button").simulate("click");

      expect(wrapper.state("change_to")).to.be.empty;
      expect(wrapper.find("#change_to").shallow().find("input").props().value)
        .to.be.empty;
    });

    it("should trigger clear action on cart component", () => {
      const checkout = TestUtils.renderIntoDocument(<Checkout />);
      const cart = TestUtils.findRenderedComponentWithType(checkout, Cart);

      const spyCartClear = sandbox.spy(cart, "onCartClear");

      let clearButton = TestUtils.findRenderedDOMComponentWithClass(
        checkout,
        "clear-button"
      );
      TestUtils.Simulate.click(clearButton);

      expect(spyCartClear).to.have.been.called;
    });
  });

  describe("address search", () => {
    it("should trigger lazy search", () => {
      const spyLazyAddressSearch = sandbox.spy(
        componentRender,
        "lazyAddressSearch"
      );
      componentRender.forceUpdate();

      wrapper
        .find("#address")
        .shallow()
        .find("input")
        .simulate("change", { target: { name: "address", value: "101" } });

      expect(spyLazyAddressSearch).to.have.been.calledWith("101");
    });

    it("should lazy address search using orderRepository", () => {
      wrapper
        .find("#address")
        .shallow()
        .find("input")
        .simulate("change", { target: { name: "address", value: "101" } });

      expect(stubOrderRespositorySearchByAddress).to.have.been.calledWith(
        "101"
      );
    });

    it("should fill complement fields from the last order", () => {
      wrapper
        .find("#address")
        .simulate("autocomplete", { complement: "101 room" });

      expect(wrapper.state("complement")).to.equal("101 room");
    });

    it("should fill note field from the last order", () => {
      wrapper
        .find("#address")
        .simulate("autocomplete", { notes: "Fast delivery" });

      expect(wrapper.state("notes")).to.equal("Fast delivery");
    });

    it("should trigger refresh products in cart component", () => {
      const checkout = TestUtils.renderIntoDocument(<Checkout />);
      const cart = TestUtils.findRenderedComponentWithType(checkout, Cart);
      const spyCartLoad = sandbox.stub(cart, "onCartLoad");

      const prouductItem = [{ product_id: 1 }];
      checkout.handleOnAutocompleteLastOrderSearch({
        products: [prouductItem],
      });

      expect(spyCartLoad).to.have.been.calledWith([prouductItem]);
    });

    it("should trigger on clean before refresh products in cart component", () => {
      const checkout = TestUtils.renderIntoDocument(<Checkout />);
      const cart = TestUtils.findRenderedComponentWithType(checkout, Cart);
      const spyCartLoad = sandbox.stub(cart, "onCartLoad");
      const spyCartClear = sandbox.spy(cart, "onCartClear");

      checkout.handleOnAutocompleteLastOrderSearch({ products: [] });

      expect(spyCartClear).to.have.been.called;
      expect(spyCartLoad).to.have.been.calledWith([]);
    });

    it("should focus change field when search complete", () => {
      const checkout = TestUtils.renderIntoDocument(<Checkout />);

      checkout.handleOnAutocompleteLastOrderSearch({ products: [] });

      expect(document.activeElement.id).to.be.equal("change_to");
    });

    it("should focus note field when search complete if payment is credit card", () => {
      const checkout = TestUtils.renderIntoDocument(<Checkout />);

      checkout.setState({ credit_card_payment: true });
      checkout.handleOnAutocompleteLastOrderSearch({ products: [] });

      expect(document.activeElement.id).to.be.equal("notes");
    });
  });

  describe("phonenumber search", () => {
    it("should trigger lazy search", () => {
      const spyLazyPhoneSearch = sandbox.spy(
        componentRender,
        "lazyPhoneSearch"
      );
      componentRender.forceUpdate();

      wrapper
        .find("#phonenumber")
        .shallow()
        .find("input")
        .simulate("change", { target: { name: "phonenumber", value: "9988" } });

      expect(spyLazyPhoneSearch).to.have.been.calledWith("9988");
    });

    it("should lazy phonenumber search using orderRepository", () => {
      wrapper
        .find("#phonenumber")
        .shallow()
        .find("input")
        .simulate("change", { target: { name: "phonenumber", value: "9988" } });

      expect(stubSearchByPhone).to.have.been.calledWith("9988");
    });

    it("should fill complement fields from the last order", () => {
      wrapper
        .find("#phonenumber")
        .simulate("autocomplete", { complement: "101 room" });

      expect(wrapper.state("complement")).to.equal("101 room");
    });

    it("should fill note field from the last order", () => {
      wrapper
        .find("#phonenumber")
        .simulate("autocomplete", { notes: "Fast delivery" });

      expect(wrapper.state("notes")).to.equal("Fast delivery");
    });
  });

  describe("save order", () => {
    it("should save by order repository", () => {
      const order = {
        address: "ADDRESS NEW",
        change_difference: null,
        complement: "....",
        credit_card_payment: false,
        notes: "NOTES..",
        phonenumber: "998887766",
        change_to: 100,
        products: [{ product_id: 1, description: "", cash: 10, quantity: 1 }],
        total_amount: 10,
      };
      wrapper.setState(order);

      wrapper
        .find("#modal-order-summary")
        .shallow()
        .find("#place-order-button")
        .simulate("click");

      expect(stubOrderRespositorySave).to.have.been.calledWith(order);
    });

    it("should trigger on clean after place order", () => {
      const order = {
        address: "address new",
        products: [{ product_id: 1, description: "", value: 10, quantity: 1 }],
      };
      wrapper.setState(order);

      const spyClearAllFields = sandbox.spy(componentRender, "clearAllFieds");

      wrapper
        .find("#modal-order-summary")
        .shallow()
        .find("#place-order-button")
        .simulate("click");

      expect(spyClearAllFields).to.have.been.called;
    });

    // TOFIX: added modal
    // it('should focus in the phonenumber field', () => {
    //   const output = mount(<Checkout />);
    //   const order = {
    //     address: 'address new',
    //     products: [ { product_id: 1, description: '', value: 10, quantity: 1 } ],
    //   };
    //   output.setState(order);
    //   output.instance().setFocusOnChargeTo();

    //   output.instance().buttonClickPlaceOrder();

    //   expect(document.activeElement.id).to.be.equal('phonenumber');
    // });
  });
});
