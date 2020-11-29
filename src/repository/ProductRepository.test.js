import DbFactory from "./DbFactory";
import ProductRepository from "./ProductRepository";

describe("ProductRepository", () => {
  describe("list all", () => {
    let dbTest;
    beforeEach(() => {
      dbTest = DbFactory.dbAdapter();
      dbTest
        .set("products", [
          { id: 1, description: "product 1" },
          { id: 2, description: "product 2" },
        ])
        .write();
    });

    it("should return order by description", () => {
      expect(ProductRepository.all()).to.be.eql([
        { id: 1, description: "product 1" },
        { id: 2, description: "product 2" },
      ]);
    });
  });
});
