import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyDvkn7dbuD_DH-fCZFz_sl_n-yHAmVHigE",
    authDomain: "au-fond-du-trou.firebaseapp.com",
    databaseURL: "https://au-fond-du-trou-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "au-fond-du-trou",
    storageBucket: "au-fond-du-trou.firebasestorage.app",
    messagingSenderId: "499061483352",
    appId: "1:499061483352:web:a6ed4783d0bb9e4281272d"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export default app;
