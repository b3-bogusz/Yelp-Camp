const express = require('express');
const router = express.Router({mergeParams: true});
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');


// async Error wrapper function //
const catchAsync = require('../utilities/catchAsync');
// Custom Error Class //
const ExpressError = require('../utilities/ExpressError')

// Campground model //
const Campground = require('../models/campground');
// Review model //
const Review = require('../models/review');
// controller //
const reviews = require('../controllers/reviews');




// review route //
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

// delete review route //
router.delete('/:reviewId', isLoggedIn, catchAsync(reviews.deleteReview));


module.exports = router;