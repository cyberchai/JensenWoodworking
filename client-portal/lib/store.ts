// Store abstraction layer - switch between mockStore and firebaseStore
// Set USE_FIREBASE to true to use Firebase, false to use mock store

const USE_FIREBASE = true; // Change this to switch between stores

let store: any;

if (USE_FIREBASE) {
  // Use Firebase store
  store = require('./firebaseStore').firebaseStore;
} else {
  // Use mock store
  store = require('./mockStore').store;
}

export { store };

