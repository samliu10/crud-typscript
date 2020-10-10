import admin from 'firebase-admin';
import express from 'express';
import bodyParser from 'body-parser';

const serviceAccount = require('../service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://typscript-crud.firebaseio.com"
});

const db = admin.firestore();
const app = express();
const PORT = 8080;
app.use(bodyParser.json());

app.listen(PORT, () => console.log(`App listening on port ${PORT}!`));