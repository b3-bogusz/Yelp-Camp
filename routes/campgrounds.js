const express = require('express');
const router = express.Router();

// async Error wrapper function //
const catchAsync = require('../utilities/catchAsync');
// Custom Error Class //
const ExpressError = require('../utilities/ExpressError')

// Campground model //
const Campground = require('../models/campground');
// JOI validation schema //
const { campgroundSchema } = require('../schemas.js');

// JOI middleware function for new/edit //
const validateCampground = (req, res, next) => {
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




// index route //
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}))

// new form route //
router.get('/new',  (req, res) => {
    res.render('campgrounds/new');
})

// new campground route/ creating new //
router.post('/', validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'Successfully made a new campground');
    res.redirect(`/campgrounds/${campground._id}`)
}))

// show route //
router.get('/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    if (!campground) {
        req.flash('error', 'Cannot find that campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}))

// edit form route //
router.get('/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    if (!campground) {
        req.flash('error', 'Cannot find that campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}))

// edit campground route/ updating //
router.put('/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    req.flash('success', 'Successfully updated campground');
    res.redirect(`/campgrounds/${campground._id}`)
}))

// delete route //
router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground');
    res.redirect('/campgrounds');
}))

module.exports = router;








