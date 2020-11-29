import DbFactory from "./DbFactory";
import { PRODUCTS } from "../constants/entities";

class ProductRepository {
  constructor(db = DbFactory.dbAdapter(), firebase, authUser) {
    this.db = db;
    this.product_collection = db.get(PRODUCTS);
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

  _saveProductOnFireBase(entity, date_last_sync, successCallBack) {
    if (!this.authUser) {
      return;
    }

    entity.uid = this.authUser.uid;
    entity.last_sync = date_last_sync;

    this.firebase
      .product(entity.id)
      .set(entity)
      .then(() => {
        if (successCallBack) {
          successCallBack(entity);
        }
      })
      .catch(() => {
        delete entity.uid;
        delete entity.last_sync;
      });
  }

  _updateProduct(product) {
    this.product_collection.getById(product.id).assign(product).write();
  }

  save(product) {
    if (!product) return;
    const current_date = new Date().toJSON();

    if (product.id) {
      product.updated = current_date;
      this._updateProduct(product);
    } else {
      product.id = DbFactory.getNewId();
      product.created = current_date;

      this.product_collection.push(product).write();
    }

    this._saveProductOnFireBase(product, current_date, (newProduct) =>
      this._updateProduct(newProduct)
    );

    return product.id;
  }

  delete(productId) {
    this.product_collection.remove({ id: productId }).write();
  }
}

export default new ProductRepository();
