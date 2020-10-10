"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const serviceAccount = require('../service-account.json');
firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert(serviceAccount),
    databaseURL: "https://typscript-crud.firebaseio.com"
});
const db = firebase_admin_1.default.firestore();
const app = express_1.default();
const PORT = 8080;
app.use(body_parser_1.default.json());
app.listen(PORT, () => console.log(`App listening on port ${PORT}!`));
