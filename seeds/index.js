const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database connected");
});

// making random title out of seedHelpers.js //
const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async() => {
    // deleting everything from a database //
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        // making 50 new Campgrounds from cites.js//
        const camp = new Campground({
            // user id //
            author: "603685f67f2fdb0b011bae8b",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            // call sample f for descriptors nad places array //
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusantium alias eos eum facilis quia sunt tempore. Adipisci aliquam at, autem cumque ducimus modi nostrum officiis, quod sed sit, ullam voluptatibus?',
            price
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})