import React from 'react';
import Checkout from './Checkout';
import { shallow, mount } from 'enzyme';


describe('Checkout component load', () => {
  it('should focus in the address field', () => {
    const output = mount(<Checkout />);

    expect(output.find('input#address').getElement().props.id)
      .to.be.equal(document.activeElement.id);
  });
})

describe('Checkout place order', () => {
  let spyPlaceOrder, wrapper, sandbox, componentRender;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    wrapper = shallow(<Checkout />);
    componentRender = wrapper.instance();

    spyPlaceOrder = sandbox.stub(componentRender, 'placeOrder');
    componentRender.forceUpdate()
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should fill the address field', () => {
    wrapper.find('#address').simulate('change', { target: { name: 'address', value: '101 Street' } } );

    wrapper.find('#place-order-button').simulate('click');

    expect(wrapper.state('address')).to.equal('101 Street');
  });

  it('should not continue if address is empty', () => {
    wrapper.find('#place-order-button').simulate('click');

    expect(spyPlaceOrder).to.not.have.been.called;
  });

  it('should fill the address complement field', () => {
    wrapper.find('#complement').simulate('change', { target: { name: 'complement', value: 'ap. 202' } } );

    expect(wrapper.state('complement')).to.equal('ap. 202');
  });

  it('should fill the note field', () => {
    wrapper.find('#notes').simulate('change', { target: { name: 'notes', value: 'good customer' } } );

    expect(wrapper.state('notes')).to.equal('good customer');
  });

  describe('calculate total order amount', () => {
    it('should calculate', () => {
      componentRender.onProductsChange([
        { product_id: 1, description: 'Water', value: 3.50, quantity: 2 },
        { product_id: 2, description: 'Product', value: 4.00, quantity: 3 }
      ]);

      expect(wrapper.state('total_amount')).to.equal(19);
    });

    it('should format', () => {
      componentRender.onProductsChange([
        { product_id: 1, description: 'Water', value: 3.5, quantity: 2 },
      ]);

      expect(wrapper.find('#total_amount').props().title).to.equal('$7.00');
    });
  });

  describe('calculate change to value', () => {
    it('should calculate', () => {
      componentRender.onProductsChange([
        { product_id: 1, description: 'Water', value: 3.5, quantity: 2 },
      ]);
      wrapper.find('#change_to').simulate('change', { target: { name: 'change_to', value: 20 } } );

      expect(wrapper.state('change_difference')).to.equal(13.00);
    });

    it('should be empty if less then total amount', () => {
      componentRender.onProductsChange([
        { product_id: 1, description: 'Water', value: 3.5, quantity: 2 },
      ]);
      wrapper.find('#change_to').simulate('change', { target: { name: 'change_to', value: 6.0 } } );

      expect(wrapper.state('change_difference')).to.equal(null);
    });

    it('should be empty if equal to the total amount', () => {
      componentRender.onProductsChange([
        { product_id: 1, description: 'Water', value: 3.5, quantity: 2 },
      ]);
      wrapper.find('#change_to').simulate('change', { target: { name: 'change_to', value: 7.0 } } );

      expect(wrapper.state('change_difference')).to.equal(null);
    });

    it('should be empty if non numeric', () => {
      componentRender.onProductsChange([
        { product_id: 1, description: 'Water', value: 3.5, quantity: 2 },
      ]);
      wrapper.find('#change_to').simulate('change', { target: { name: 'change_to', value: "non numeric" } } );

      expect(wrapper.state('change_difference')).to.equal(null);
    });
  });
})