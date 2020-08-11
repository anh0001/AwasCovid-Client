import Firebase from './firebase';

const firebase = new Firebase();
const rsf = firebase.rsf;
const firebaseAuth = firebase.auth;
const firebaseDb = firebase.db;
const dbFirestore = firebase.dbFirestore;

export {
  rsf,
  firebaseAuth,
  firebaseDb,
  dbFirestore,
  firebase
}
