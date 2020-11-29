import Migration_v1 from "./migrations/Migration_v1";

const low = require("lowdb");
const Memory = require("lowdb/adapters/Memory");
const LocalStorage = require("lowdb/adapters/LocalStorage");
const shortid = require("shortid");
const lodashId = require("lodash-id");

let ProdOrDevDatabase;
if (process.env.NODE_ENV === "test") {
  ProdOrDevDatabase = new Memory();
} else if (window && window.require) {
  let FileSync = window.require("lowdb/adapters/FileSync");
  let remote = window.require("electron").remote;
  ProdOrDevDatabase = new FileSync(remote.getGlobal("settings").database_path);
} else {
  ProdOrDevDatabase = new LocalStorage("db.json");
}

const db = low(ProdOrDevDatabase);
db._.mixin(lodashId);

db.defaults({
  products: [],
  version: 0,
}).write();

const current_version = db.get("version").value();
const update_if_success = (migration_version) =>
  db.set("version", migration_version).write();
Migration_v1.apply(db, current_version, update_if_success);

export default class DbFactory {
  static dbAdapter() {
    return db;
  }

  static getNewId() {
    return shortid.generate();
  }
}
