const { campgroundSchema, reviewSchema } = require('./schemas.js');
// Custom Error Class //
const ExpressError = require('./utilities/ExpressError')
// Campground model //
const Campground = require('./models/campground');
const Review= require('./models/review');

// check if the user is logged in //
// isAuthenticated method from pa
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in');
        return res.redirect('/login');
    }
    next();
}


// JOI middleware function for new/edit //
module.exports.validateCampground = (req, res, next) => {
    // call method .validate on req.body //
    const { error } = campgroundSchema.validate(req.body);
    // if there is error in JOI validator //
    if (error){
        // taking error message from error.details which is array of objects//
        // if we have more errors we map over them and join them //
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

// is author middleware //
module.exports.isAuthor = async (req, res, next) => {
    //take id from url //
    const { id } = req.params;
    // find campground with that id//
    const campground = await Campground.findById(id);
    // is author id equal to logged in user //
    if (!campground.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}


// is Review author middleware //
module.exports.isReviewAuthor = async (req, res, next) => {
    //take id and reviewId from url //
    const { id, reviewId } = req.params;
    // find review with that id//
    const review = await Review.findById(reviewId);
    // is review author id equal to logged in user //
    if (!review.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

// JOI middleware  function for review //
module.exports.validateReview = (req, res, next) => {
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