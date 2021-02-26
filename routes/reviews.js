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





// review route //
router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res) => {
    // finding corresponding campground //
    const campground = await Campground.findById(req.params.id);
    // new review model //
    const review = new Review(req.body.review);
    // is author id equal to logged in user //
    review.author = req.user._id;
    // pushing newly created review into array in campground model "
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Successfully created review');
    res.redirect(`/campgrounds/${campground._id}`);
}))

// delete review route //
router.delete('/:reviewId', isLoggedIn, catchAsync( async (req, res) => {
    const { id, reviewId } = req.params;
    // finding campground and removing a reference reviewId from reviews array //
    await Campground.findByIdAndUpdate(id, { $pull: {reviews: reviewId}})
    // deleting entire review //
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review');
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;