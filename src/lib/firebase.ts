import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Check if we're in a development environment where Firebase should be disabled
const isDevelopmentDomain =
  window.location.hostname.includes("builder.codes") ||
  window.location.hostname.includes("localhost") ||
  window.location.hostname.includes("127.0.0.1");

const isProduction = import.meta.env.PROD;

// Export flag to indicate if we should use mock auth
export const USE_MOCK_AUTH = isDevelopmentDomain || !isProduction;

console.log("Firebase initialization:", {
  useMockAuth: USE_MOCK_AUTH,
  environment: isProduction ? "production" : "development",
  domain: window.location.hostname,
});

// Production Firebase config (original)
const productionConfig = {
  apiKey: "AIzaSyArf8n4A-1ydTwToaF3OZHLTxchQqEvO08",
  authDomain: "firefuncional70.firebaseapp.com",
  projectId: "firefuncional70",
  storageBucket: "firefuncional70.appspot.com",
  messagingSenderId: "313297678842",
  appId: "1:313297678842:web:82ed7312964dce012bb8e0",
};

// Minimal config for development (won't be used but needed for initialization)
const mockConfig = {
  apiKey: "mock-api-key",
  authDomain: "mock-project.firebaseapp.com",
  projectId: "mock-project",
  storageBucket: "mock-project.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:mock",
};

// Use mock config if in development environment, otherwise use production
const firebaseConfig = USE_MOCK_AUTH ? mockConfig : productionConfig;

// Initialize Firebase (but we won't use it if USE_MOCK_AUTH is true)
let app: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;

if (!USE_MOCK_AUTH) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    console.warn("Firebase initialization failed, will use mock auth:", error);
  }
}

export { auth, db, storage };
export default app;
