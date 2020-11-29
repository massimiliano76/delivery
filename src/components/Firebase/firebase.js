import app from "firebase/app";
import "firebase/auth";
import "firebase/database";
import { ORDERS, CLIENT_LAST_ORDERS, USERS } from "../../constants/entities";

const config = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
};

class Firebase {
  constructor() {
    app.initializeApp(config);
    this.auth = app.auth();
    this.db = app.database();
  }

  doCreateUserWithEmailAndPassword = (email, password) =>
    this.auth.createUserWithEmailAndPassword(email, password);

  doSignInWithEmailAndPassword = (email, password) =>
    this.auth.signInWithEmailAndPassword(email, password);

  doSignOut = () => this.auth.signOut();

  doPasswordReset = (email) => this.auth.sendPasswordResetEmail(email);

  doPasswordUpdate = (password) =>
    this.auth.currentUser.updatePassword(password);

  // *** User API ***
  user = (uid) => this.db.ref(`${USERS}/${uid}`);
  users = () => this.db.ref(USERS);

  // *** Order
  order = (uid) => this.db.ref(`${ORDERS}/${uid}`);
  orders = () => this.db.ref(ORDERS);

  // *** Order
  lastOrder = (uid) => this.db.ref(`${CLIENT_LAST_ORDERS}/${uid}`);
  lastOrders = () => this.db.ref(CLIENT_LAST_ORDERS);

  // generic ref usage
  generic = (refs, uid) => this.db.ref(`${refs}/${uid}`);
}

export default Firebase;