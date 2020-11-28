import DbFactory from "./DbFactory";

class OrderRepository {
  static OrderRepositoryFirebase(firebase, authUser) {
    return new OrderRepository(DbFactory.dbAdapter(), firebase, authUser);
  }

  constructor(db = DbFactory.dbAdapter(), firebase, authUser) {
    this.db = db;
    this.firebase = firebase;
    this.authUser = authUser;
    this.order_collection = db.defaults({ orders: [] }).get("orders");
    this.client_last_order_collection = db
      .defaults({ client_last_orders: [] })
      .get("client_last_orders");
  }

  searchByAddress(address, takeCount = 5) {
    if (!address) return {};

    return this._searchByFilternig((last_order) => {
      const index = last_order.address
        .toUpperCase()
        .indexOf(address.toUpperCase());
      return index !== -1;
    }, takeCount);
  }

  searchByPhone(phonenumber, takeCount = 5) {
    if (!phonenumber) return {};

    return this._searchByFilternig((last_order) => {
      const index = last_order.phonenumber
        .toUpperCase()
        .indexOf(phonenumber.toUpperCase());
      return index !== -1;
    }, takeCount);
  }

  _searchByFilternig(filterFunction, takeCount) {
    const order_collection = this.order_collection;
    const orders = this.client_last_order_collection
      .filter(filterFunction)
      .sortBy("created")
      .sortBy("phonenumber")
      .take(takeCount)
      .value()
      .reduce(function (map, last_order) {
        const phone_field =
          last_order.phonenumber !== "" ? `${last_order.phonenumber} / ` : "";
        const complement_field =
          last_order.complement !== "" ? ` ${last_order.complement}` : "";

        map[
          `${phone_field}${last_order.address}${complement_field}`
        ] = order_collection.getById(last_order.last_order_id).value();
        return map;
      }, {});

    return orders;
  }

  save(order) {
    if (!order) return;

    order.id = DbFactory.getNewId();
    order.created = new Date().toJSON();

    if (this.authUser) {
      order.uid = this.authUser.uid;
      order.last_sync = order.created;

      var newOrderRef = this.firebase.orders().push();
      order.id = newOrderRef.key;

      newOrderRef.set(order);
    }

    this.order_collection.push(order).write();
    this._saveClientLastOrder(order);

    return order.id;
  }

  markAsShipped(orderId) {
    const current_date = new Date().toJSON();
    const shipped = "SHIPPED";

    this.order_collection
      .getById(orderId)
      .set("shipped_date", current_date)
      .set("status", shipped)
      .write();

    if (this.authUser) {
      this.firebase.order(orderId).update({
        shipped_date: current_date,
        status: shipped,
      });
      // this.firebase
      //   .order(orderId)
      //   .update(this.order_collection.getById(orderId).value());
    }
  }

  markAsCanceled(orderId) {
    this.order_collection
      .getById(orderId)
      .set("canceled_date", new Date().toJSON())
      .set("status", "CANCELED")
      .write();
  }

  markAsDeliverid(orderId) {
    this.order_collection
      .getById(orderId)
      .set("delivered_date", new Date().toJSON())
      .set("status", "DELIVERED")
      .write();
  }

  _saveExistentLastOrderWithAllFields(order) {
    const last_orders_by_address_and_phonenumber = this.client_last_order_collection
      .updateWhere(
        {
          address: order.address,
          complement: order.complement,
          phonenumber: order.phonenumber,
        },
        { last_order_id: order.id, updated: new Date().toJSON() }
      )
      .write();

    return (
      last_orders_by_address_and_phonenumber &&
      last_orders_by_address_and_phonenumber.length > 0
    );
  }

  _saveExistentLastOrderWithEmptyPhoneNumberPrevious(order) {
    const last_orders_by_address_and_empty_phonenumber = this.client_last_order_collection
      .updateWhere(
        {
          address: order.address,
          complement: order.complement,
          phonenumber: "",
        },
        {
          last_order_id: order.id,
          updated: new Date().toJSON(),
          phonenumber: order.phonenumber,
        }
      )
      .write();

    return (
      last_orders_by_address_and_empty_phonenumber &&
      last_orders_by_address_and_empty_phonenumber.length > 0
    );
  }

  _saveClientLastOrder(order) {
    if (
      !this._saveExistentLastOrderWithAllFields(order) &&
      !this._saveExistentLastOrderWithEmptyPhoneNumberPrevious(order)
    ) {
      this.client_last_order_collection
        .push({
          id: DbFactory.getNewId(),
          last_order_id: order.id,
          address: order.address,
          phonenumber: order.phonenumber,
          complement: order.complement,
          created: new Date().toJSON(),
        })
        .write();
    }
  }

  allInTheQueue(page = 1, pageSize = 25) {
    const orders = this.order_collection
      .filter((order) => {
        return order.status == null || order.status === "QUEUE";
      })
      .sortBy("created")
      .value();

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return orders.slice(startIndex, endIndex);
  }

  allInTheQueueSize() {
    return this.order_collection
      .filter((order) => {
        return order.status == null || order.status === "QUEUE";
      })
      .value().length;
  }

  allShipped(page = 1, pageSize = 25) {
    const orders = this.order_collection
      .filter((order) => {
        return order.status === "SHIPPED";
      })
      .sortBy("shipped_date")
      .value();

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return orders.slice(startIndex, endIndex);
  }

  allShippedSize() {
    return this.order_collection
      .filter((order) => {
        return order.status === "SHIPPED";
      })
      .value().length;
  }
}

export default new OrderRepository();
