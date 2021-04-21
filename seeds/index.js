//This index file will delete everything on our database and seed it with new data.

//Require mongoose
const mongoose = require('mongoose');
//Require array in cities file
const cities = require('./cities')
//Require destructered data in seedHelpers file, in otheer words, two arrays with the following names:
const { places, descriptors } = require('./seedHelpers')
//Require model
const Campground = require('../models/campground')


//Connect to mongoose database
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    //Fix all deprecation warnings
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})

//Connect to mongoose
const db = mongoose.connection;
//Check if connection established.
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
});

//Function to get random item in the array
const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    //Delete everything on the database
    await Campground.deleteMany({});
    //Loop to get 50 items
    for (let i = 0; i < 300; i++) {
        //Get a random number bewtween 1000, cause that's the number of cities we have in cities.js
        const random1000 = Math.floor(Math.random() * 1000)
        //Random price number
        const price = Math.floor(Math.random() * 20) + 10;
        //Create new object for each 50.
        const camp = new Campground({
            //Your user id
            author: '607c76b4be9a4010a22c4cfd',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit.Nisi soluta animi nihil, ipsam omnis error at quas esse eaque nesciunt enim quia possimus alias dignissimos odit.Et sit nesciunt perferendis.',
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dflqdpa2r/image/upload/v1618848865/YelpCamp/tg5kztzwwq4ycdoqpjc1.jpg',
                    filename: 'YelpCamp/tg5kztzwwq4ycdoqpjc1'
                },
                {
                    url: 'https://res.cloudinary.com/dflqdpa2r/image/upload/v1618848867/YelpCamp/gohf7woxkv9e0f5dbp8k.jpg',
                    filename: 'YelpCamp/gohf7woxkv9e0f5dbp8k'
                },
                {
                    url: 'https://res.cloudinary.com/dflqdpa2r/image/upload/v1618848868/YelpCamp/qitzogmijkgd4xsf6p8b.jpg',
                    filename: 'YelpCamp/qitzogmijkgd4xsf6p8b'
                }
            ]
        })
        await camp.save();
    }
}

//Run function to do the work
seedDB().then(() => {
    //close connection
    mongoose.connection.close();
});