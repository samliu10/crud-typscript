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
const reviewCollection = db.collection('reviews');

type Review = {
  name: string;
  location: string;
  stars: string;
  comments: string;
  date: Date;
  id: string;
}

/** Returns an array of documents. */
const createArr = (queries: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>) => {
  const reviews: Review[] = [];
  for (let doc of queries.docs) {
    let review: Review = doc.data() as Review;
    review.id = doc.id;
    reviews.push(review);
  }
  return reviews;
}

/** Retrieve all reviews for a location.*/
const getReviewsByLocation = async (location: string) => {
  const locationReviews = await reviewCollection.where('location', '==', location).get();
  const reviews: Review[] = createArr(locationReviews);
  return reviews;
}

/** Get reviews sorted by [field] in [dir] order. */
const getSortedReviews = async (field: string, dir: "desc" | "asc" | undefined) => {
  const sortedReviews = await reviewCollection.orderBy(field, dir).get();
  const reviews: Review[] = createArr(sortedReviews);
  return reviews;
}

/** Write a review. */
app.post('/reviews/newreview/', async (req, res) => {
  const doc = reviewCollection.doc();
  const review: Review = req.body;
  doc.set(review);
  res.status(201).send(doc.id);
})

/** Get all reviews in descending order by date. */
app.get('/reviews', async (req, res) => {
  const reviews: Review[] = await getSortedReviews('date', 'desc');
  res.status(200).send(reviews);
})

/** Get all reviews for a location. */
app.get('/reviews/bylocation/:location/', async (req, res) => {
  const reviews: Review[] = await getReviewsByLocation(req.params.location);
  res.status(200).send(reviews);
})

/** Get review by id. */
app.get('/reviews/id/:id/', async (req, res) => {
  const id = req.params.id;
  const doc = await reviewCollection.doc(id).get();
  const review: Review = doc.data() as Review;
  review.id = doc.id;
  res.status(200).send(review);
})

/** Get the average rating for a location. */
app.get('/reviews/ratings/:location/', async (req, res) => {
  const reviews: Review[] = await getReviewsByLocation(req.params.location);
  let sum: number = 0;
  for (let review of reviews) {
    sum += parseInt(review.stars);
  }
  const avg: string = (sum / reviews.length).toString();
  res.status(200).send(avg);
})

/** Edit a review. */
app.post('/reviews/edit/:id/', async (req, res) => {
  const id: string = req.params.id;
  const newReview = req.body;
  await reviewCollection.doc(id).update(newReview);
  res.status(201).send(id);
})

/** Delete a review. */
app.delete('/reviews/delete/:id/', async (req, res) => {
  const id: string = req.params.id;
  await reviewCollection.doc(id).delete();
  res.status(200).send(id);
})


app.listen(PORT, () => console.log(`App listening on port ${PORT}!`));