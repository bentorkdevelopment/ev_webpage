import { initializeApp } from "firebase/app";
import { getRemoteConfig } from "firebase/remote-config";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDjFwU1RA8APo0g10D87keaobn46tLxku0",
  authDomain: "bentork-applications.firebaseapp.com",
  projectId: "bentork-applications",
  storageBucket: "bentork-applications.firebasestorage.app",
  messagingSenderId: "299158352008",
  appId: "1:299158352008:web:14029018f77d111c4f2f3d",
  measurementId: "G-Z9RDB1EGH2"
};

let app;
let remoteConfig = null;

const isConfigValid = firebaseConfig.apiKey !== "dummy_api_key" && !!firebaseConfig.apiKey;

if (isConfigValid) {
  try {
    app = initializeApp(firebaseConfig);
    if (typeof window !== "undefined") {
        remoteConfig = getRemoteConfig(app);
        remoteConfig.settings.minimumFetchIntervalMillis = 0; // For dev purposes
    }
  } catch (error) {
    console.warn("Firebase initialization skipped or failed:", error);
  }
} else {
  console.log("Firebase config not found or invalid. Skipping Remote Config initialization.");
}

export { app, remoteConfig };
