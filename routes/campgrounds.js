const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');

// async Error wrapper function //
const catchAsync = require('../utilities/catchAsync');

// middleware //
const { isLoggedIn, isAuthor, validateCampground, isReviewAuthor } = require('../middleware');
// Campground model //
const Campground = require('../models/campground');
// JOI validation schema //

router.route('/')
// index  //
    .get(catchAsync(campgrounds.index))
// new campground route/ creating new //
    .post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));

// new form  //
router.get('/new',  isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
// show  //
    .get(catchAsync(campgrounds.showCampground))
// edit campground / updating //
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))
// delete  //
    .delete(isLoggedIn, isReviewAuthor, isAuthor, catchAsync(campgrounds.deleteCampground));



// edit form  //
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;








