import { ORDERS, PRODUCTS, CLIENT_LAST_ORDERS } from "../../constants/entities";
const migration_version = 1;

export default class Migration_v1 {
  static apply(db, current_version, success) {
    if (current_version + 1 !== migration_version) {
      return;
    }

    console.log(`Migrating to ${migration_version}`);
    const current_date = new Date().toJSON();
    //add updated to orders if not exist
    db.get(ORDERS)
      .filter((order) => order.updated == null)
      .each((order) => {
        order.updated = current_date;
      })
      .write();
    //add created/updated to products if not exist
    db.get(PRODUCTS)
      .filter((product) => product.created == null)
      .each((product) => {
        product.created = current_date;
        product.updated = current_date;
      })
      .write();
    //add updated to CLIENT_LAST_ORDERS if not exist
    db.get(CLIENT_LAST_ORDERS)
      .filter((client_last_order) => client_last_order.updated == null)
      .each((client_last_order) => {
        client_last_order.updated = current_date;
      })
      .write();
    success(migration_version);
  }
}
