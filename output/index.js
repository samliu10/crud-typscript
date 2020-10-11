"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
const reviewCollection = db.collection('reviews');
/** Returns an array of documents. */
const createArr = (queries) => {
    const reviews = [];
    for (let doc of queries.docs) {
        let review = doc.data();
        review.id = doc.id;
        reviews.push(review);
    }
    return reviews;
};
/** Retrieve all reviews for a location.*/
const getReviewsByLocation = (location) => __awaiter(void 0, void 0, void 0, function* () {
    const locationReviews = yield reviewCollection.where('location', '==', location).get();
    const reviews = createArr(locationReviews);
    return reviews;
});
/** Get reviews sorted by [field] in [dir] order. */
const getSortedReviews = (field, dir) => __awaiter(void 0, void 0, void 0, function* () {
    const sortedReviews = yield reviewCollection.orderBy(field, dir).get();
    const reviews = createArr(sortedReviews);
    return reviews;
});
/** Write a review. */
app.post('/reviews/newreview/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const doc = reviewCollection.doc();
    const review = req.body;
    doc.set(review);
    res.status(201).send(doc.id);
}));
/** Get all reviews in descending order by date. */
app.get('/reviews', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reviews = yield getSortedReviews('date', 'desc');
    res.status(200).send(reviews);
}));
/** Get all reviews for a location. */
app.get('/reviews/bylocation/:location/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reviews = yield getReviewsByLocation(req.params.location);
    res.status(200).send(reviews);
}));
/** Get review by id. */
app.get('/reviews/id/:id/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const doc = yield reviewCollection.doc(id).get();
    const review = doc.data();
    review.id = doc.id;
    res.status(200).send(review);
}));
/** Get the average rating for a location. */
app.get('/reviews/ratings/:location/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reviews = yield getReviewsByLocation(req.params.location);
    let sum = 0;
    for (let review of reviews) {
        sum += parseInt(review.stars);
    }
    const avg = (sum / reviews.length).toString();
    res.status(200).send(avg);
}));
/** Edit a review. */
app.post('/reviews/edit/:id/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const newReview = req.body;
    yield reviewCollection.doc(id).update(newReview);
    res.status(201).send(id);
}));
/** Delete a review. */
app.delete('/reviews/delete/:id/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    yield reviewCollection.doc(id).delete();
    res.status(200).send(id);
}));
app.listen(PORT, () => console.log(`App listening on port ${PORT}!`));
