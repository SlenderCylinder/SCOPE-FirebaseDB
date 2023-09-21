const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const cors = require('cors');
require('dotenv').config();

const { initializeApp } = require("firebase-admin");

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

// Get firebase config from here: https://firebase.google.com/docs/web/learn-more#config-object
// Not required for API endpoints at the moment (DB connection will work without it), but in the future it will needed
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};
  
  
//Download Service Account admin SDK file from Firebase Project Settings --> Service Accounts
const serviceAccount = require("./scope-dashboard-firebase-adminsdk.json")

const adminApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "gs://scope-dashboard.appspot.com",
});

// Initialize Firestore
const firestore = admin.firestore();

// Initialize Firestore collection reference
const beneficiariesCollection = firestore.collection('beneficiaries');

// Create a new beneficiary
app.post('/beneficiaries', async (req, res) => {
  try {
    const beneficiaryData = req.body;
    const beneficiaryDocRef = await beneficiariesCollection.add(beneficiaryData);
    const beneficiaryDocSnapshot = await beneficiaryDocRef.get();
    const beneficiary = beneficiaryDocSnapshot.data();
    
    res.status(201).json(beneficiary);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Retrieve all beneficiaries
app.get('/beneficiaries', async (req, res) => {
    try {
      const beneficiariesQuerySnapshot = await beneficiariesCollection.get();
      const beneficiaries = [];
  
      beneficiariesQuerySnapshot.forEach((doc) => {
        const beneficiaryData = doc.data();
        const beneficiaryId = doc.id; 
        beneficiaries.push({ id: beneficiaryId, ...beneficiaryData });
      });
  
      res.json(beneficiaries);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

//Delete a beneficiary document
app.delete('/beneficiaries/:id', async (req, res) => {
    try {
      const beneficiaryId = req.params.id;
      await beneficiariesCollection.doc(beneficiaryId).delete();
      res.status(204).end(); // 204 No Content status for successful deletion
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

//For webbrowser
app.get('/', (req, res) => {
    res.send('Firebase API is up and running');
  });

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
