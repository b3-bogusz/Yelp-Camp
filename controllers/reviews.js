// Campground model //
const Campground = require('../models/campground');
// Review model //
const Review = require('../models/review');


module.exports.createReview = async (req, res) => {
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
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    // finding campground and removing a reference reviewId from reviews array //
    await Campground.findByIdAndUpdate(id, { $pull: {reviews: reviewId}})
    // deleting entire review //
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review');
    res.redirect(`/campgrounds/${id}`);
}