import DbFactory from "./DbFactory";

const entity = "products";

class ProductRepository {
  constructor(db = DbFactory.dbAdapter(), firebase, authUser) {
    this.db = db;
    this.product_collection = db.get(entity);
    this.firebase = firebase;
    this.authUser = authUser;
  }

  setOrderRepositoryFirebase(firebase, authUser) {
    this.firebase = firebase;
    this.authUser = authUser;
  }

  all() {
    return this.product_collection.sortBy("description").value();
  }

  getById(productId) {
    if (!productId) return {};
    return this.product_collection.getById(productId).value();
  }

  save(product) {
    if (!product) return;

    product.updated = new Date().toJSON();

    if (product.id) {
      this.product_collection.getById(product.id).assign(product).write();
    } else {
      product.id = DbFactory.getNewId();
      product.created = new Date().toJSON();

      this.product_collection.push(product).write();
    }

    return product.id;
  }

  delete(productId) {
    this.product_collection.remove({ id: productId }).write();
  }
}

export default new ProductRepository();
