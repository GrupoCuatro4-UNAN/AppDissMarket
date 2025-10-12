import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyBADBV9SpKZiruHwHisBzoJS3_jNYQ6SnQ",
  authDomain: "dissmar-app.firebaseapp.com",
  projectId: "dissmar-app", 
  storageBucket: "dissmar-app.firebasestorage.app",
  messagingSenderId: "281962133643",
  appId: "1:281962133643:web:fa9ea3e512bda49bcd7c8e"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;