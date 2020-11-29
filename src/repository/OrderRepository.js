import DbFactory from "./DbFactory";
import { ORDERS, CLIENT_LAST_ORDERS } from "../components/Firebase/firebase";

class OrderRepository {
  constructor(db = DbFactory.dbAdapter(), firebase, authUser) {
    this.db = db;
    this.firebase = firebase;
    this.authUser = authUser;
    this.order_collection = db.defaults({ orders: [] }).get(ORDERS);
    this.client_last_order_collection = db
      .defaults({ client_last_orders: [] })
      .get(CLIENT_LAST_ORDERS);
  }

  setOrderRepositoryFirebase(firebase, authUser) {
    this.firebase = firebase;
    this.authUser = authUser;
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

  _saveEntityOnFireBase(ref, entity, date_last_sync, successCallBack) {
    if (!this.authUser) {
      return entity;
    }

    entity.uid = this.authUser.uid;
    entity.last_sync = date_last_sync;

    this.firebase
      .generic(ref, entity.id)
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

    return entity;
  }

  _updateLastOrder(lastOrder) {
    this.client_last_order_collection
      .getById(lastOrder.id)
      .assign(lastOrder)
      .write();
  }

  _updateOrder(order) {
    this.order_collection.getById(order.id).assign(order).write();
  }

  save(order) {
    if (!order) return;

    order.id = DbFactory.getNewId();
    order.created = new Date().toJSON();
    this.order_collection.push(order).write();

    this._saveEntityOnFireBase(ORDERS, order, order.created, (newEntity) =>
      this._updateOrder(newEntity)
    );

    const client_last_orders = this._saveClientLastOrder(order);
    client_last_orders.forEach((last_order_index) => {
      this._saveEntityOnFireBase(
        CLIENT_LAST_ORDERS,
        last_order_index,
        order.created,
        (newEntity) => this._updateLastOrder(newEntity)
      );
    });

    return order.id;
  }

  _markStatusAs(orderId, field, status) {
    const current_date = new Date().toJSON();

    let orderByIdBuilder = this.order_collection.getById(orderId);
    let buildUpdateStatus = orderByIdBuilder
      .set(field, current_date)
      .set("updated", current_date)
      .set("status", status);

    buildUpdateStatus.write();

    if (this.authUser) {
      const orderLocal = orderByIdBuilder.value();
      orderLocal.status = status;
      orderLocal[field] = current_date;
      orderLocal.updated = current_date;

      if (orderLocal.uid) {
        this.firebase
          .order(orderId)
          .update({
            [field]: current_date,
            last_sync: current_date,
            updated: current_date,
            status: status,
            uid: this.authUser.uid,
          })
          .then(() => {
            buildUpdateStatus = buildUpdateStatus
              .set("last_sync", current_date)
              .set("uid", this.authUser.uid);
            buildUpdateStatus.write();
          });
      } else {
        const orderSync = this._saveNewOrderOnFireBase(
          orderLocal,
          current_date
        );
        orderByIdBuilder.assign(orderSync).write();
      }
    }
  }

  markAsShipped(orderId) {
    this._markStatusAs(orderId, "shipped_date", "SHIPPED");
  }

  markAsCanceled(orderId) {
    this._markStatusAs(orderId, "canceled_date", "CANCELED");
  }

  markAsDeliverid(orderId) {
    this._markStatusAs(orderId, "delivered_date", "DELIVERED");
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

    return last_orders_by_address_and_phonenumber || [];
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

    return last_orders_by_address_and_empty_phonenumber || [];
  }

  _saveClientLastOrder(order) {
    const lastOrderAllFieldsRegisters = this._saveExistentLastOrderWithAllFields(
      order
    );
    if (lastOrderAllFieldsRegisters.length) {
      return lastOrderAllFieldsRegisters;
    }

    const lastOrderWithEmptyPhoneNumberRegisters = this._saveExistentLastOrderWithEmptyPhoneNumberPrevious(
      order
    );
    if (lastOrderWithEmptyPhoneNumberRegisters.length) {
      return lastOrderWithEmptyPhoneNumberRegisters;
    }

    const newLastOrder = {
      id: DbFactory.getNewId(),
      last_order_id: order.id,
      address: order.address,
      phonenumber: order.phonenumber,
      complement: order.complement,
      created: order.created,
    };
    this.client_last_order_collection.push(newLastOrder).write();
    return [newLastOrder];
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
