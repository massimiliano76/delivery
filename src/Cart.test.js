import React from 'react';
import Cart from './Cart';
import { shallow } from 'enzyme';


describe('Cart', () => {
  let spyAddProduct, wrapper, sandbox, stubProductRepository, componentRender, spyOnProductChange;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    stubProductRepository = createStubProductRepository(sandbox);
    spyOnProductChange = sandbox.spy();

    wrapper = shallow(<Cart productRepository={stubProductRepository} onProductsChange={spyOnProductChange} />);
    componentRender = wrapper.instance();

    spyAddProduct = sandbox.spy(componentRender, 'addProduct');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('add product', () => {
    it('should load products from repository', () => {
      expect(stubProductRepository.all).to.have.been.called;
    });

    it('should not add if no product selected', () => {
      wrapper.find('#add-product-button').simulate('click');

      expect(wrapper.state('products')).to.eql([]);
    });

    it('should go with product and quantity selected', () => {
      componentRender.handleOnAutocompleteProduct({ id: 1, description: 'Product 1', value: 3.5 });
      wrapper.find('#quantity').simulate('change', { target: { name: 'add_product_quantity', value: 2 } } );

      wrapper.find('#add-product-button').simulate('click');

      expect(spyAddProduct).to.have.been.calledOnce;
      expect(wrapper.state('products'))
        .to.eql([ { product_id: 1, description: 'Product 1', value: 3.5, quantity: 2 } ]);
    });

    it('should reset product selected after added', () => {
      componentRender.handleOnAutocompleteProduct({ id: 1, description: 'Product 1', value: 3.5 });

      wrapper.find('#add-product-button').simulate('click');

      expect(wrapper.state('add_product')).to.be.null;
    });

    it('should return quantity product after added to be 1', () => {
      componentRender.handleOnAutocompleteProduct({ id: 1, description: 'Product 1', value: 3.5 });
      wrapper.find('#quantity').simulate('change', { target: { name: 'add_product_quantity', value: 2 } } );

      wrapper.find('#add-product-button').simulate('click');

      expect(wrapper.state('add_product_quantity')).to.be.equal(1);
    });

    it('should focus the quantity field after choose the product', () => {
      const focusQuantity = sandbox.stub(componentRender, 'focusQuantity');

      componentRender.handleOnAutocompleteProduct({ id: 1, description: 'Product 1', value: 3.5 });

      expect(focusQuantity).to.have.have.calledOnce;
    });

    it('should clear product field after added the product', () => {
      componentRender.handleOnAutocompleteProduct({ id: 1, description: 'Product 1', value: 3.5 });

      wrapper.find('#add-product-button').simulate('click');

      expect(wrapper.find('AutocompleteCustom.product').shallow().find('input').props().value)
        .to.be.equal('');
    });

    it('should have add the product message when empty', () => {
      expect(wrapper.find('Table').find('tbody').props().children.props.children.props.children)
        .to.be.equal('Add a product...');
    });

    it('should add the product on the table', () => {
      componentRender.handleOnAutocompleteProduct({ id: 1, description: 'Product 1', value: 3.5 });
      wrapper.find('#add-product-button').simulate('click');

      componentRender.handleOnAutocompleteProduct({ id: 2, description: 'Product 2', value: 4.0 });
      wrapper.find('#add-product-button').simulate('click');

      expect(wrapper.find('Table').find('tbody').props().children.length)
        .to.be.equal(2);
    });

    it('should add the description of product on the table', () => {
      componentRender.handleOnAutocompleteProduct({ id: 1, description: 'Product 1', value: 3.5 });

      wrapper.find('#add-product-button').simulate('click');

      expect(wrapper.find('Table').find('tbody').props().children[0].props.children[0].props.children)
        .to.be.equal('Product 1');
    });

    it('should add the item price of product on the table', () => {
      componentRender.handleOnAutocompleteProduct({ id: 1, description: 'Product 1', value: 3.5 });

      wrapper.find('#add-product-button').simulate('click');

      expect(wrapper.find('Table').find('tbody').props().children[0].props.children[1].props.children)
        .to.be.equal('$3.50');
    });

    it('should add the quantity of product on the table', () => {
      componentRender.handleOnAutocompleteProduct({ id: 1, description: 'Product 1', value: 3.5 });

      wrapper.find('#add-product-button').simulate('click');

      expect(wrapper.find('Table').find('tbody').props().children[0].props.children[2].props.children)
        .to.be.equal(1);
    });

    it('should calculate the total amount of the product on the table', () => {
      componentRender.handleOnAutocompleteProduct({ id: 1, description: 'Product 1', value: 3.5 });
      wrapper.find('#quantity').simulate('change', { target: { name: 'add_product_quantity', value: 2 } } );

      wrapper.find('#add-product-button').simulate('click');

      expect(wrapper.find('Table').find('tbody').props().children[0].props.children[3].props.children)
        .to.be.equal('$7.00');
    });

    it('should fire on change product when add a product', () => {
      componentRender.handleOnAutocompleteProduct({ id: 1, description: 'Product 1', value: 3.5 });
      wrapper.find('#quantity').simulate('change', { target: { name: 'add_product_quantity', value: 2 } } );

      wrapper.find('#add-product-button').simulate('click');

      expect(spyOnProductChange).to.have.been.calledOnce;
    });
  });

  describe('remove product', () => {
    it('should be empty after performed', () => {
      componentRender.handleOnAutocompleteProduct({ id: 1, description: 'Product 1', value: 3.5 });
      wrapper.find('#quantity').simulate('change', { target: { name: 'add_product_quantity', value: 2 } } );

      wrapper.find('#add-product-button').simulate('click');
      wrapper.find('#remove-product-1').simulate('click');

      expect(wrapper.state('products')).to.eql([]);
    });

    it('should fire on change product when remove a product', () => {
      const products = [{ description: "Product 1", product_id: 1, quantity: 2, value: 3.5 }];
      wrapper.setState({ products });

      wrapper.find('#remove-product-1').simulate('click');

      expect(spyOnProductChange).to.have.been.calledOnce;
    });
  });
})

function createStubProductRepository(sandbox) {
  const all = sandbox.stub().returns([
    { id: 1, description: 'Product 1', value: 3.50 },
    { id: 2, description: 'Product 2', value: 2.50 }
  ]);
  return {
    all: all
  };
}