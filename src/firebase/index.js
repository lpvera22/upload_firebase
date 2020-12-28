import firebase from "firebase/app";
import "firebase/storage"

const firebaseConfig = {
    apiKey: "AIzaSyACt8FmovgmMFYCUk6a5tkOfqJx0dahxmU",
    authDomain: "fir-react-upload-c784e.firebaseapp.com",
    databaseURL: "https://fir-react-upload-c784e.firebaseio.com",
    projectId: "fir-react-upload-c784e",
    storageBucket: "fir-react-upload-c784e.appspot.com",
    messagingSenderId: "91436360842",
    appId: "1:91436360842:web:62cc7fb154e22e77ed3973"
  };

  firebase.initializeApp(firebaseConfig)

  const storage=firebase.storage();

  export {storage,firebase as default};