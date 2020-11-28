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

export default class DbFactory {
  static dbAdapter() {
    const db = low(ProdOrDevDatabase);

    db._.mixin(lodashId);

    db.defaults({ products: DbFactory.initialProductsBeta() }).write();

    return db;
  }

  static getNewId() {
    return shortid.generate();
  }

  static initialProductsBeta() {
    //TODO: initial load sync from server
    return [
      { id: 1, description: "Naturágua".toUpperCase(), cash: 11.0, card: 11.5 },
      { id: 2, description: "Indaiá".toUpperCase(), cash: 11.0, card: 11.5 },
      { id: 3, description: "Neblina".toUpperCase(), cash: 10.0, card: 10.5 },
      { id: 4, description: "Pacoty".toUpperCase(), cash: 9.0, card: 9.5 },
      { id: 5, description: "Clareza".toUpperCase(), cash: 5.0, card: 5.5 },
      { id: 6, description: "Fortágua".toUpperCase(), cash: 5.0, card: 5.5 },
      {
        id: 7,
        description: "Serra Grande".toUpperCase(),
        cash: 10.0,
        card: 10.5,
      },
      { id: 8, description: "Acácia".toUpperCase(), cash: 10.0, card: 10.5 },
    ];
  }
}
