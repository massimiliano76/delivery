import OrderRepository from "./OrderRepository";
import DbFactory from "./DbFactory";

describe("OrderRepository", () => {
  let orderRepository, dbTest, entity, entityClientLastOrder;
  beforeEach(() => {
    entity = "orders";
    entityClientLastOrder = "client_last_orders";

    dbTest = DbFactory.dbAdapter();
    dbTest.defaults({ orders: [], client_last_orders: [] }).write();
    dbTest.set(entity, []).write();
    dbTest.set(entityClientLastOrder, []).write();

    // orderRepository = new OrderRepository(dbTest);
    orderRepository = OrderRepository;
  });

  describe("save order", () => {
    it("should save order", () => {
      OrderRepository.save({ address: "101 St." });

      expect(dbTest.get(entity).size().value()).to.be.equal(1);
    });

    it("should not save null order", () => {
      orderRepository.save(null);

      expect(dbTest.get(entity).size().value()).to.be.equal(0);
    });

    it("should set id when save order", () => {
      orderRepository.save({ address: "1022 St." });

      const order = dbTest.get(entity).find({ address: "1022 St." }).value();

      expect(order.id).to.not.be.empty;
    });

    it("should set created date when save order", () => {
      orderRepository.save({ address: "1022 St." });

      const order = dbTest.get(entity).find({ address: "1022 St." }).value();

      expect(order.created).to.not.be.empty;
    });

    describe("save client index", () => {
      it("should save order", () => {
        orderRepository.save({ address: "101 St." });

        expect(dbTest.get(entityClientLastOrder).size().value()).to.be.equal(1);
      });

      it("should not save null order", () => {
        orderRepository.save(null);

        expect(dbTest.get(entityClientLastOrder).size().value()).to.be.equal(0);
      });

      it("should save last order reference", () => {
        orderRepository.save({ address: "1022 St." });

        const clientLastOrder = dbTest
          .get(entityClientLastOrder)
          .find({ address: "1022 St." })
          .value();
        const order = dbTest
          .get(entity)
          .find({ id: clientLastOrder.last_order_id })
          .value();

        expect(clientLastOrder.address).to.be.equal("1022 St.");
        expect(order.address).to.be.equal("1022 St.");
      });

      it("should update last order if address exist", () => {
        orderRepository.save({ address: "1022 St.", notes: "order 1" });
        orderRepository.save({ address: "1022 St.", notes: "order 2" });

        const clientLastOrder = dbTest
          .get(entityClientLastOrder)
          .find({ address: "1022 St." })
          .value();
        const order = dbTest
          .get(entity)
          .find({ id: clientLastOrder.last_order_id })
          .value();

        expect(dbTest.get(entityClientLastOrder).size().value()).to.be.equal(1);
        expect(order.notes).to.be.equal("order 2");
      });

      it("should create last order even if phonenumber exist", () => {
        orderRepository.save({ address: "1022 St.", phonenumber: "99887766" });
        orderRepository.save({
          address: "1022 St. #300",
          phonenumber: "99887766",
        });

        const clientLastOrder = dbTest
          .get(entityClientLastOrder)
          .filter({ phonenumber: "99887766" })
          .value();

        expect(dbTest.get(entityClientLastOrder).size().value()).to.be.equal(2);
        expect(clientLastOrder[0].address).to.be.equal("1022 St.");
        expect(clientLastOrder[1].address).to.be.equal("1022 St. #300");
      });

      it("should update last order if address exist", () => {
        orderRepository.save({ address: "1022 St.", phonenumber: "9999999" });
        orderRepository.save({ address: "1022 St.", phonenumber: "8888888" });

        const clientLastOrder = dbTest
          .get(entityClientLastOrder)
          .filter({ address: "1022 St." })
          .value();

        expect(dbTest.get(entityClientLastOrder).size().value()).to.be.equal(2);
        expect(clientLastOrder[0].phonenumber).to.be.equal("9999999");
        expect(clientLastOrder[1].phonenumber).to.be.equal("8888888");
      });

      it("should update last order if address exist but different complement", () => {
        orderRepository.save({
          address: "1022 St.",
          phonenumber: "9999999",
          complement: "apt. 101",
        });
        orderRepository.save({
          address: "1022 St.",
          phonenumber: "9999999",
          complement: "apt. 200",
        });

        const clientLastOrder = dbTest
          .get(entityClientLastOrder)
          .filter({ address: "1022 St." })
          .value();

        expect(dbTest.get(entityClientLastOrder).size().value()).to.be.equal(2);
        expect(clientLastOrder[0].complement).to.be.equal("apt. 101");
        expect(clientLastOrder[1].complement).to.be.equal("apt. 200");
      });

      it("should update last order when phonenumber and address match", () => {
        orderRepository.save({
          address: "1022 St.",
          phonenumber: "9999999",
          notes: "Order 1",
        });
        orderRepository.save({
          address: "1022 St.",
          phonenumber: "7777777",
          notes: "Order 2",
        });

        const clientLastOrder = dbTest
          .get(entityClientLastOrder)
          .find({ phonenumber: "7777777" })
          .value();
        const order = dbTest
          .get(entity)
          .find({ id: clientLastOrder.last_order_id })
          .value();

        expect(dbTest.get(entityClientLastOrder).size().value()).to.be.equal(2);
        expect(order.notes).to.be.equal("Order 2");
      });

      it("should update last order if address exist with empty phonenumber", () => {
        orderRepository.save({
          phonenumber: "",
          address: "1022 St.",
          notes: "order 1",
        });
        orderRepository.save({
          phonenumber: "99887766",
          address: "1022 St.",
          notes: "order 2",
        });

        const clientLastOrder = dbTest
          .get(entityClientLastOrder)
          .find({ address: "1022 St." })
          .value();
        const order = dbTest
          .get(entity)
          .find({ id: clientLastOrder.last_order_id })
          .value();

        expect(dbTest.get(entityClientLastOrder).size().value()).to.be.equal(1);
        expect(order.notes).to.be.equal("order 2");
      });
    });
  });

  describe("search by address", () => {
    it("should return empty object if empty address", () => {
      expect(orderRepository.searchByAddress("")).to.be.empty;
    });

    it("should return empty object if null address", () => {
      expect(orderRepository.searchByAddress(null)).to.be.empty;
    });

    it("should return object started by the street name", () => {
      dbTest
        .get(entity)
        .push({
          id: 1,
          address: "St Abc Cde Agh",
          phonenumber: "",
          complement: "",
        })
        .write();
      dbTest
        .get(entityClientLastOrder)
        .push({
          id: 777,
          address: "St Abc Cde Agh",
          last_order_id: 1,
          phonenumber: "",
          complement: "",
        })
        .write();

      expect(orderRepository.searchByAddress("St Abc Cde")).to.be.eql({
        "St Abc Cde Agh": {
          id: 1,
          address: "St Abc Cde Agh",
          phonenumber: "",
          complement: "",
        },
      });
    });

    it("should return object ended by the street name", () => {
      dbTest
        .get(entity)
        .push({
          id: 1,
          address: "St Abc Cde Agh",
          phonenumber: "",
          complement: "",
        })
        .write();
      dbTest
        .get(entityClientLastOrder)
        .push({
          id: 777,
          address: "St Abc Cde Agh",
          last_order_id: 1,
          phonenumber: "",
          complement: "",
        })
        .write();

      expect(orderRepository.searchByAddress("Agh")).to.be.eql({
        "St Abc Cde Agh": {
          id: 1,
          address: "St Abc Cde Agh",
          phonenumber: "",
          complement: "",
        },
      });
    });

    it("should return object with the middle name", () => {
      dbTest
        .get(entity)
        .push({
          id: 1,
          address: "St Abc Cde Agh",
          phonenumber: "",
          complement: "",
        })
        .write();
      dbTest
        .get(entityClientLastOrder)
        .push({
          id: 777,
          address: "St Abc Cde Agh",
          last_order_id: 1,
          phonenumber: "",
          complement: "",
        })
        .write();

      expect(orderRepository.searchByAddress("Cde")).to.be.eql({
        "St Abc Cde Agh": {
          id: 1,
          address: "St Abc Cde Agh",
          phonenumber: "",
          complement: "",
        },
      });
    });

    it("should return object ignoring the case", () => {
      dbTest
        .get(entity)
        .push({
          id: 1,
          address: "St Abc Cde Agh",
          phonenumber: "",
          complement: "",
        })
        .write();
      dbTest
        .get(entityClientLastOrder)
        .push({
          id: 777,
          address: "St Abc Cde Agh",
          last_order_id: 1,
          phonenumber: "",
          complement: "",
        })
        .write();

      expect(orderRepository.searchByAddress("cde")).to.be.eql({
        "St Abc Cde Agh": {
          id: 1,
          address: "St Abc Cde Agh",
          phonenumber: "",
          complement: "",
        },
      });
    });

    it("should return the first 2 address", () => {
      dbTest
        .get(entity)
        .push({
          id: 1,
          address: "St Abc AAAA",
          phonenumber: "",
          complement: "",
        })
        .push({
          id: 2,
          address: "St abc BBBB",
          phonenumber: "",
          complement: "",
        })
        .push({
          id: 3,
          address: "St abc CCCC",
          phonenumber: "",
          complement: "",
        })
        .write();
      dbTest
        .get(entityClientLastOrder)
        .push({
          id: 777,
          address: "St Abc AAAA",
          last_order_id: 1,
          phonenumber: "",
          complement: "",
        })
        .push({
          id: 888,
          address: "St abc BBBB",
          last_order_id: 2,
          phonenumber: "",
          complement: "",
        })
        .push({
          id: 999,
          address: "St abc CCCC",
          last_order_id: 3,
          phonenumber: "",
          complement: "",
        })
        .write();

      expect(orderRepository.searchByAddress("abc", 2)).to.be.eql({
        "St Abc AAAA": {
          id: 1,
          address: "St Abc AAAA",
          phonenumber: "",
          complement: "",
        },
        "St abc BBBB": {
          id: 2,
          address: "St abc BBBB",
          phonenumber: "",
          complement: "",
        },
      });
    });

    it("should return sortBy address", () => {
      dbTest
        .get(entity)
        .push({
          id: 1,
          address: "St abc yyyyyyy",
          phonenumber: "",
          complement: "",
        })
        .push({
          id: 2,
          address: "Av. Abcxxxxxx",
          phonenumber: "",
          complement: "",
        })
        .push({
          id: 3,
          address: "Bv. Abcxxxxxx",
          phonenumber: "",
          complement: "",
        })
        .write();
      dbTest
        .get(entityClientLastOrder)
        .push({
          id: 777,
          address: "St abc yyyyyyy",
          last_order_id: 1,
          phonenumber: "",
          complement: "",
        })
        .push({
          id: 888,
          address: "Av. Abcxxxxxx",
          last_order_id: 2,
          phonenumber: "",
          complement: "",
        })
        .push({
          id: 999,
          address: "Bv. Abcxxxxxx",
          last_order_id: 3,
          phonenumber: "",
          complement: "",
        })
        .write();

      expect(orderRepository.searchByAddress("abc")).to.be.eql({
        "Av. Abcxxxxxx": {
          id: 2,
          address: "Av. Abcxxxxxx",
          phonenumber: "",
          complement: "",
        },
        "Bv. Abcxxxxxx": {
          id: 3,
          address: "Bv. Abcxxxxxx",
          phonenumber: "",
          complement: "",
        },
        "St abc yyyyyyy": {
          id: 1,
          address: "St abc yyyyyyy",
          phonenumber: "",
          complement: "",
        },
      });
    });

    it("should group By created date desc", () => {
      dbTest
        .get(entity)
        .push({
          id: 1,
          address: "Abc St.",
          created: "2019-02-23T23:59:26.919Z",
          complement: "",
          phonenumber: "",
        })
        .push({
          id: 2,
          address: "Abc St.",
          created: "2019-02-23T23:50:26.919Z",
          complement: "",
          phonenumber: "",
        })
        .write();
      dbTest
        .get(entityClientLastOrder)
        .push({
          id: 777,
          address: "Abc St.",
          last_order_id: 1,
          complement: "",
          phonenumber: "",
        })
        .write();

      expect(orderRepository.searchByAddress("abc")).to.be.eql({
        "Abc St.": {
          id: 1,
          address: "Abc St.",
          created: "2019-02-23T23:59:26.919Z",
          complement: "",
          phonenumber: "",
        },
      });
    });
  });

  describe("search by phone number", () => {
    it("should return empty object if empty number", () => {
      expect(orderRepository.searchByPhone("")).to.be.empty;
    });

    it("should return empty object if null address", () => {
      expect(orderRepository.searchByPhone(null)).to.be.empty;
    });

    it("should return object started by the number", () => {
      dbTest
        .get(entity)
        .push({
          id: 1,
          phonenumber: "99887766",
          address: "101 Abc St.",
          complement: "",
        })
        .write();
      dbTest
        .get(entityClientLastOrder)
        .push({
          id: 777,
          phonenumber: "99887766",
          address: "101 Abc St.",
          last_order_id: 1,
          complement: "",
        })
        .write();

      expect(orderRepository.searchByPhone("9988")).to.be.eql({
        "99887766 / 101 Abc St.": {
          id: 1,
          phonenumber: "99887766",
          address: "101 Abc St.",
          complement: "",
        },
      });
    });

    it("should return object ended by the number", () => {
      dbTest
        .get(entity)
        .push({
          id: 1,
          phonenumber: "99887766",
          address: "101 Abc St.",
          complement: "",
        })
        .write();
      dbTest
        .get(entityClientLastOrder)
        .push({
          id: 777,
          phonenumber: "99887766",
          address: "101 Abc St.",
          last_order_id: 1,
          complement: "",
        })
        .write();

      expect(orderRepository.searchByPhone("7766")).to.be.eql({
        "99887766 / 101 Abc St.": {
          id: 1,
          phonenumber: "99887766",
          address: "101 Abc St.",
          complement: "",
        },
      });
    });

    it("should return object with the middle number", () => {
      dbTest
        .get(entity)
        .push({
          id: 1,
          phonenumber: "99887766",
          address: "101 Abc St.",
          complement: "",
        })
        .write();
      dbTest
        .get(entityClientLastOrder)
        .push({
          id: 777,
          phonenumber: "99887766",
          address: "101 Abc St.",
          complement: "",
          last_order_id: 1,
        })
        .write();

      expect(orderRepository.searchByPhone("8877")).to.be.eql({
        "99887766 / 101 Abc St.": {
          id: 1,
          phonenumber: "99887766",
          address: "101 Abc St.",
          complement: "",
        },
      });
    });

    it("should return the first 2 numbers", () => {
      dbTest
        .get(entity)
        .push({
          id: 1,
          phonenumber: "99887766",
          address: "101 Abc St.",
          complement: "",
        })
        .push({
          id: 2,
          phonenumber: "88776699",
          address: "101 Abc St.",
          complement: "",
        })
        .push({
          id: 3,
          phonenumber: "11221122",
          address: "101 Abc St.",
          complement: "",
        })
        .write();
      dbTest
        .get(entityClientLastOrder)
        .push({
          id: 777,
          phonenumber: "99887766",
          address: "101 Abc St.",
          complement: "",
          last_order_id: 1,
        })
        .push({
          id: 888,
          phonenumber: "88776699",
          address: "101 Abc St.",
          complement: "",
          last_order_id: 2,
        })
        .push({
          id: 999,
          phonenumber: "11221122",
          address: "101 Abc St.",
          complement: "",
          last_order_id: 3,
        })
        .write();

      expect(orderRepository.searchByPhone("7766", 2)).to.be.eql({
        "99887766 / 101 Abc St.": {
          id: 1,
          phonenumber: "99887766",
          address: "101 Abc St.",
          complement: "",
        },
        "88776699 / 101 Abc St.": {
          id: 2,
          phonenumber: "88776699",
          address: "101 Abc St.",
          complement: "",
        },
      });
    });

    it("should return sortBy phonenumber", () => {
      dbTest
        .get(entity)
        .push({
          id: 1,
          phonenumber: "99887766",
          address: "101 Abc St.",
          complement: "",
        })
        .push({
          id: 2,
          phonenumber: "88776699",
          address: "101 Abc St.",
          complement: "",
        })
        .push({
          id: 3,
          phonenumber: "11887722",
          address: "101 Abc St.",
          complement: "",
        })
        .write();
      dbTest
        .get(entityClientLastOrder)
        .push({
          id: 777,
          phonenumber: "99887766",
          address: "101 Abc St.",
          last_order_id: 1,
          complement: "",
        })
        .push({
          id: 888,
          phonenumber: "88776699",
          address: "101 Abc St.",
          last_order_id: 2,
          complement: "",
        })
        .push({
          id: 999,
          phonenumber: "11887722",
          address: "101 Abc St.",
          last_order_id: 3,
          complement: "",
        })
        .write();

      expect(orderRepository.searchByPhone("8877")).to.be.eql({
        "11887722 / 101 Abc St.": {
          id: 3,
          phonenumber: "11887722",
          address: "101 Abc St.",
          complement: "",
        },
        "88776699 / 101 Abc St.": {
          id: 2,
          phonenumber: "88776699",
          address: "101 Abc St.",
          complement: "",
        },
        "99887766 / 101 Abc St.": {
          id: 1,
          phonenumber: "99887766",
          address: "101 Abc St.",
          complement: "",
        },
      });
    });

    it("should group By phonenuymber and address", () => {
      dbTest
        .get(entity)
        .push({
          id: 1,
          phonenumber: "99887766",
          address: "101 Abc St.",
          created: "2019-02-23T23:59:26.919Z",
          complement: "",
        })
        .push({
          id: 2,
          phonenumber: "99887766",
          address: "200 Def St.",
          created: "2019-02-23T23:50:26.919Z",
          complement: "",
        })
        .write();
      dbTest
        .get(entityClientLastOrder)
        .push({
          id: 777,
          phonenumber: "99887766",
          address: "101 Abc St.",
          created: "2019-02-23T23:59:26.919Z",
          complement: "",
          last_order_id: 1,
        })
        .push({
          id: 888,
          phonenumber: "99887766",
          address: "200 Def St.",
          created: "2019-02-23T23:50:26.919Z",
          complement: "",
          last_order_id: 2,
        })
        .write();

      expect(orderRepository.searchByPhone("998877")).to.be.eql({
        "99887766 / 101 Abc St.": {
          id: 1,
          phonenumber: "99887766",
          address: "101 Abc St.",
          created: "2019-02-23T23:59:26.919Z",
          complement: "",
        },
        "99887766 / 200 Def St.": {
          id: 2,
          phonenumber: "99887766",
          address: "200 Def St.",
          created: "2019-02-23T23:50:26.919Z",
          complement: "",
        },
      });
    });

    it("should group By phonenumber and address and take the lastest", () => {
      dbTest
        .get(entity)
        .push({
          id: 1,
          phonenumber: "99887766",
          address: "101 Abc St.",
          created: "2019-02-23T23:59:26.919Z",
          complement: "",
        })
        .push({
          id: 2,
          phonenumber: "99887766",
          address: "101 Abc St.",
          created: "2019-02-23T23:50:26.919Z",
          complement: "",
        })
        .write();

      dbTest
        .get(entityClientLastOrder)
        .push({
          id: 888,
          phonenumber: "99887766",
          address: "101 Abc St.",
          created: "2019-02-23T23:50:26.919Z",
          last_order_id: 1,
          complement: "",
        })
        .write();

      expect(orderRepository.searchByPhone("998877")).to.be.eql({
        "99887766 / 101 Abc St.": {
          id: 1,
          phonenumber: "99887766",
          address: "101 Abc St.",
          created: "2019-02-23T23:59:26.919Z",
          complement: "",
        },
      });
    });
  });
});
