const express = require('express');
// file and directory path //
const path = require('path');
const mongoose = require('mongoose');

const ejsMate = require('ejs-mate');

// Custom Error Class //
const ExpressError = require('./utilities/ExpressError')
// faking put/delete requests //
const methodOverride = require('method-override');
// session //
const session = require('express-session');
const flash = require('connect-flash');
// routers //
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');


// connecting mongoose //
// mongo db location locally and which database to use //
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
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
app.use(express.static(path.join(__dirname, 'public')))

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash())

// flash middleware //
app.use((req, res, next) => {
    // req.flash will be available in template through locals under key 'success' //
    // on every single request//
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// router prefix //
app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews)

// home page //
app.get('/', (req, res) => {
    res.render('home')
})


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