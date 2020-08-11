import firebase from 'firebase/app';
import ReduxSagaFirebase from 'redux-saga-firebase';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import 'firebase/database';

// Uncomment this for production
import firebaseConfig from './config';

// const firebaseConfig = {
//     apiKey: process.env.FIREBASE_API_KEY,
//     authDomain: process.env.FIREBASE_AUTH_DOMAIN,
//     databaseURL: process.env.FIREBASE_DB_URL,
//     projectId: process.env.FIREBASE_PROJECT_ID,
//     storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
//     messagingSenderId: process.env.FIREBASE_MSG_SENDER_ID,
//     appId: process.env.FIREBASE_APP_ID
// };

class Firebase {
    constructor() {
        this.app = firebase.initializeApp(firebaseConfig);

        this.rsf = new ReduxSagaFirebase(this.app);
        this.auth = this.rsf.auth;
        // this.auth = firebase.auth();
        this.storage = firebase.storage();
        this.dbFirestore = firebase.firestore();
        this.db = firebase.database();
    }

    // AUTH ACTIONS 
    // --------

    createAccount = (email, password) => this.auth.createUserWithEmailAndPassword(email, password);

    signIn = (email, password) => this.auth.signInWithEmailAndPassword(email, password);

    signInWithGoogle = () => this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());

    signInWithFacebook = () => this.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider());

    signInWithGithub = () => this.auth.signInWithPopup(new firebase.auth.GithubAuthProvider());

    signOut = () => this.auth.signOut();

    passwordReset = email => this.auth.sendPasswordResetEmail(email);

    addUser = (id, user) => this.dbFirestore.collection('users').doc(id).set(user);

    getUser = id => this.dbFirestore.collection('users').doc(id).get();

    passwordUpdate = password => this.auth.currentUser.updatePassword(password);

    changePassword = (currentPassword, newPassword) => {
        return new Promise((resolve, reject) => {
            this.reauthenticate(currentPassword).then(() => {
                const user = this.auth.currentUser;
                user.updatePassword(newPassword).then(() => {
                    resolve('Password updated successfully!');
                }).catch(error => reject(error));
            }).catch(error => reject(error));
        });
    }

    reauthenticate = (currentPassword) => {
        const user = this.auth.currentUser;
        const cred = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);

        return user.reauthenticateWithCredential(cred);
    }

    updateEmail = (currentPassword, newEmail) => {
        return new Promise((resolve, reject) => {
            this.reauthenticate(currentPassword).then(() => {
                const user = this.auth.currentUser;
                user.updateEmail(newEmail).then((data) => {
                    resolve('Email Successfully updated');
                }).catch(error => reject(error));
            }).catch(error => reject(error));
        });
    }

    updateProfile = (id, updates) => this.dbFirestore.collection('users').doc(id).update(updates);

    onAuthStateChanged = () => {
        return new Promise((resolve, reject) => {
            this.auth.onAuthStateChanged((user) => {
                if (user) {
                    return resolve(user);
                } else {
                    return reject(new Error('Auth State Changed failed'));
                }
            });
        });
    }

    setAuthPersistence = () => this.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

    // // PRODUCT ACTIONS
    // // ---------

    getProducts = (lastRefKey) => {
        let didTimeout = false;

        return new Promise(async (resolve, reject) => {
            if (lastRefKey) {
                try {
                    const query = this.dbFirestore.collectionGroup('productsInfo').orderBy(firebase.firestore.FieldPath.documentId()).startAfter(lastRefKey).limit(100);
                    const snapshot = await query.get();
                    const products = [];
                    snapshot.forEach(doc => products.push({ id: doc.id, ...doc.data() }));
                    const lastKey = snapshot.docs[snapshot.docs.length - 1];

                    resolve({ products, lastKey });
                } catch (e) {
                    reject(':( Failed to fetch products.');
                }
            } else {
                const timeout = setTimeout(() => {
                    didTimeout = true;
                    reject('Request timeout, please try again');
                }, 15000);

                try {
                    // getting the total count of data

                    // adding shallow parameter for smaller response size
                    // better than making a query from firebase
                    // NOT AVAILEBLE IN FIRESTORE const request = await fetch(`${process.env.FIREBASE_DB_URL}/products.json?shallow=true`);

                    const totalQuery = await this.dbFirestore.collectionGroup('productsInfo').get();
                    const total = totalQuery.docs.length;
                    const query = this.dbFirestore.collectionGroup('productsInfo').orderBy(firebase.firestore.FieldPath.documentId()).limit(100);
                    const snapshot = await query.get();

                    // console.log('snapshot: ', total);

                    clearTimeout(timeout);
                    if (!didTimeout) {
                        const products = [];
                        snapshot.forEach(doc => products.push({ id: doc.id, ...doc.data() }));
                        const lastKey = snapshot.docs[snapshot.docs.length - 1];

                        resolve({ products, lastKey, total });
                    }
                } catch (e) {
                    if (didTimeout) return;
                    console.log('Failed to fetch products: An error occured while trying to fetch products or there may be no product ', e);
                    reject(':( Failed to fetch products.');
                }
            }
        });
    }

    getUserProducts = (userId, lastRefKey) => {
        let didTimeout = false;

        return new Promise(async (resolve, reject) => {
            if (lastRefKey) {
                try {
                    const query = this.dbFirestore.collection('allProducts').doc(userId).collection('productsInfo').orderBy(firebase.firestore.FieldPath.documentId()).startAfter(lastRefKey).limit(100);
                    const snapshot = await query.get();
                    const products = [];
                    snapshot.forEach(doc => products.push({ id: doc.id, ...doc.data() }));
                    const lastKey = snapshot.docs[snapshot.docs.length - 1];

                    resolve({ products, lastKey });
                } catch (e) {
                    reject(':( Failed to fetch products.');
                }
            } else {
                const timeout = setTimeout(() => {
                    didTimeout = true;
                    reject('Request timeout, please try again');
                }, 15000);

                try {
                    // getting the total count of data

                    // adding shallow parameter for smaller response size
                    // better than making a query from firebase
                    // NOT AVAILEBLE IN FIRESTORE const request = await fetch(`${process.env.FIREBASE_DB_URL}/products.json?shallow=true`);

                    const totalQuery = await this.dbFirestore.collection('allProducts').doc(userId).collection('productsInfo').get();
                    const total = totalQuery.docs.length;
                    const query = this.dbFirestore.collection('allProducts').doc(userId).collection('productsInfo').orderBy(firebase.firestore.FieldPath.documentId()).limit(100);
                    const snapshot = await query.get();

                    // console.log('snapshot: ', snapshot);

                    clearTimeout(timeout);
                    if (!didTimeout) {
                        const products = [];
                        snapshot.forEach(doc => products.push({ id: doc.id, ...doc.data() }));
                        const lastKey = snapshot.docs[snapshot.docs.length - 1];

                        resolve({ products, lastKey, total });
                    }
                } catch (e) {
                    if (didTimeout) return;
                    console.log('Failed to fetch products: An error occured while trying to fetch products or there may be no product ', e);
                    reject(':( Failed to fetch products.');
                }
            }
        });
    }


    addNewProduct = async (userid, item) => {
        const res = await this.dbFirestore.collection('allProducts').doc(userid).collection('productsInfo').add(item);
        return res.id;
    }

    editProduct = (userid, productid, item) => (
        this.dbFirestore.collection('allProducts').doc(userid).collection('productsInfo').doc(productid).update(item)
    )

    generateKey = () => this.dbFirestore.collection('products').doc().id;

    storeImage = async (userid, folder, imageFile) => {
        const snapshot = await this.storage.ref(folder).child(userid).put(imageFile);
        const downloadURL = await snapshot.ref.getDownloadURL();

        return downloadURL;
    }

    storeImages = async (folder, imageFiles) => {
        let urls = [];

        const asyncRes = await Promise.all(imageFiles.map(async (media, index) => {
            const snapshot = await this.storage.ref(folder).child(index.toString()).put(media.file);
            const downloadURL = await snapshot.ref.getDownloadURL();
            urls = [...urls, downloadURL];
        }));

        return urls;
    }

    deleteImage = id => this.storage.ref('products').child(id).delete();

    removeProduct = id => this.dbFirestore.collection('products').doc(id).delete();
}

export default Firebase;
