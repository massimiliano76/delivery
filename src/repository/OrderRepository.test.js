import OrderRepository from './OrderRepository';
import DbFactory from './DbFactory';

describe('OrderRepository', () => {
  let orderRepository, dbTest, entity;
    beforeEach(() => {
      dbTest = DbFactory.dbAdapter();
      entity = 'orders';

      orderRepository = new OrderRepository(dbTest);
    });
  
    describe('search by address', () => {
      it('should return empty object if empty address', () => {
        expect(orderRepository.searchByAddress('')).to.be.empty;
      });

      it('should return empty object if null address', () => {
        expect(orderRepository.searchByAddress(null)).to.be.empty;
      });

      it('should return object started by the street name', () => {
        dbTest.get(entity)
            .push({ id: 1, address: 'St Abc Cde Agh' })
            .write();

        expect(orderRepository.searchByAddress('St Abc Cde')).to.be.eql({
          'St Abc Cde Agh': { id: 1, address: 'St Abc Cde Agh'}
        });
      });

      it('should return object ended by the street name', () => {
        dbTest.get(entity)
            .push({ id: 1, address: 'St Abc Cde Agh' })
            .write();

        expect(orderRepository.searchByAddress('Agh')).to.be.eql({
          'St Abc Cde Agh': { id: 1, address: 'St Abc Cde Agh'}
        });
      });

      it('should return object with the middle name', () => {
        dbTest.get(entity)
            .push({ id: 1, address: 'St Abc Cde Agh' })
            .write();

        expect(orderRepository.searchByAddress('Cde')).to.be.eql({
          'St Abc Cde Agh': { id: 1, address: 'St Abc Cde Agh'}
        });
      });

      it('should return object ignoring the case', () => {
        dbTest.get(entity)
            .push({ id: 1, address: 'St Abc Cde Agh' })
            .write();

        expect(orderRepository.searchByAddress('cde')).to.be.eql({
          'St Abc Cde Agh': { id: 1, address: 'St Abc Cde Agh'}
        });
      });

      it('should return the first 2 address', () => {
        dbTest.get(entity)
            .push({ id: 1, address: 'St Abc AAAA' })
            .push({ id: 2, address: 'St abc BBBB' })
            .push({ id: 3, address: 'St abc CCCC' })
            .write();

        expect(orderRepository.searchByAddress('abc', 2)).to.be.eql({
          'St Abc AAAA': { id: 1, address: 'St Abc AAAA'},
          'St abc BBBB': { id: 2, address: 'St abc BBBB'}
        });
      });

      it('should return sortBy address', () => {
        dbTest.get(entity)
            .push({ id: 1, address: 'St abc yyyyyyy' })
            .push({ id: 2, address: 'Av. Abcxxxxxx' })
            .push({ id: 3, address: 'Bv. Abcxxxxxx' })
            .write();

        expect(orderRepository.searchByAddress('abc')).to.be.eql({
          'Av. Abcxxxxxx': { id: 2, address: 'Av. Abcxxxxxx'},
          'Bv. Abcxxxxxx': { id: 3, address: 'Bv. Abcxxxxxx'},
          'St abc yyyyyyy': { id: 1, address: 'St abc yyyyyyy'},
        });
      });

      it('should group By created date desc', () => {
        dbTest.get(entity)
            .push({ id: 1, address: 'Abc St.', created: '2019-02-23T23:59:26.919Z' })
            .push({ id: 2, address: 'Abc St.', created: '2019-02-23T23:50:26.919Z' })
            .write();

        expect(orderRepository.searchByAddress('abc')).to.be.eql({
          'Abc St.': { id: 1, address: 'Abc St.', created: '2019-02-23T23:59:26.919Z'},
        });
      });
    });

    describe('save order', () => {
      it('should save order', () => {
        orderRepository.save({ address: '101 St.'});

        expect(dbTest.get(entity).size().value()).to.be.equal(1);
      });

      it('should not save null order', () => {
        orderRepository.save(null);

        expect(dbTest.get(entity).size().value()).to.be.equal(0);
      });

      it('should set id when save order', () => {
        orderRepository.save({ address: '1022 St.'});

        const order = dbTest.get(entity).find({ address: '1022 St.' }).value();

        expect(order.id).to.not.be.empty;
      });

      it('should set created date when save order', () => {
        orderRepository.save({ address: '1022 St.'});

        const order = dbTest.get(entity).find({ address: '1022 St.' }).value();

        expect(order.created).to.not.be.empty;
      });
    });
});