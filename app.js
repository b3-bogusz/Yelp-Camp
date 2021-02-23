const express = require('express');
// file and directory path //
const path = require('path');
const mongoose = require('mongoose');

const ejsMate = require('ejs-mate');
// JOI validation schema //
const { campgroundSchema, reviewSchema } = require('./schemas.js');
// async Error wrapper function //
const catchAsync = require('./utilities/catchAsync');
// Custom Error Class //
const ExpressError = require('./utilities/ExpressError')
// faking put/delete requests //
const methodOverride = require('method-override');
// model //
const Campground = require('./models/campground');
// Review model //
const Review = require('./models/review');

// connecting mongoose //
// mongo db location locally and which database to use //
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})
// mongoose connection //
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database connected");
})

const app = express();


app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
// takes the path from were app.js is executed and adds views //
app.set('views', path.join(__dirname, 'views'))

// parse req.body, be default it's empty //
app.use(express.urlencoded({extended: true}));
// faking put/delete requests //
app.use(methodOverride('_method'));


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

// home page //
app.get('/', (req, res) => {
    res.render('home')
})

// index route //
app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
        res.render('campgrounds/index', { campgrounds })
}))

// new form route //
app.get('/campgrounds/new',  (req, res) => {
    res.render('campgrounds/new');
})

// new campground route/ creating new //
app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
        const campground = new Campground(req.body.campground);
        await campground.save();
        res.redirect(`/campgrounds/${campground._id}`)
}))

// show route //
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show', { campground });
}))

// edit form route //
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground });
}))

// edit campground route/ updating //
app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    res.redirect(`/campgrounds/${campground._id}`)
}))

// delete route //
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

// review route //
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
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
app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync( async (req, res) => {
    const { id, reviewId } = req.params;
    // finding campground and removing a reference reviewId from reviews array //
    await Campground.findByIdAndUpdate(id, { $pull: {reviews: reviewId}})
    // deleting entire review //
    await Review.findByIdAndDelete(reviewId);
   res.redirect(`/campgrounds/${id}`);
}))

// for every path-  Error Class //
app.all('*', (req, res, next) => {
    // next will pass this to custom error handler //
    next(new ExpressError('Page not found', 404))
})

// custom error handler //
app.use((err, req, res, next) => {
    const { statusCode = 500} = err;
    if (!err.message) err.message = 'Oh no something went wrong!'

    res.status(statusCode).render('error', { err });
})



app.listen(3000, () => {
    console.log('Serving port 3000');
})