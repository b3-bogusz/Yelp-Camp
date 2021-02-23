const express = require('express');
const router = express.Router({mergeParams: true});

// async Error wrapper function //
const catchAsync = require('../utilities/catchAsync');
// Custom Error Class //
const ExpressError = require('../utilities/ExpressError')

// Campground model //
const Campground = require('../models/campground');
// Review model //
const Review = require('../models/review');
// JOI validation schema //
const { reviewSchema } = require('../schemas.js');

// JOI middleware  function for review //
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error){
        // taking error message from error.details which is array of objects//
        // if we have more errors we map over them and join them //
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}


// review route //
router.post('/', validateReview, catchAsync(async (req, res) => {
    // finding corresponding campground //
    const campground = await Campground.findById(req.params.id);
    // new review model //
    const review = new Review(req.body.review);
    // pushing newly created review into array in campground model "
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

// delete review route //
router.delete('/:reviewId', catchAsync( async (req, res) => {
    const { id, reviewId } = req.params;
    // finding campground and removing a reference reviewId from reviews array //
    await Campground.findByIdAndUpdate(id, { $pull: {reviews: reviewId}})
    // deleting entire review //
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;