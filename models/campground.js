const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

//We define a schema specifically for images cause we want to add w_200 to the url using virtual.
const ImageSchema = new Schema({
    url: String,
    filename: String
})

//We use virtual so we don't store this in our database, our database contains only the url unmodified.
//The regular expression "replace" will modify our url so we can use the cloudinary api for transformation  
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
})

//By default, mongoose won't include the virtuals automatically when you convert an object to JSON, so we need to include this:
const opts = { toJSON: {virtuals: true}}

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    //Store the longitute, lagitude from mapbox, mongo demands we use this format to deal with GeoJSON.
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    //Embed the ids of reviews cause potentially we could have thousands of reviews
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

//Set this virtual on campground to use on the cluster map, as the docs specify we need this "properties" object
CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0,20)}...</p>`;
})

//Query Middleware triggered after we delete a campground
//Be aware of the query we passed here, findOneAndDelete. We should check the docs for specification.
//We have access of what was deleted(doc), cause it will be passed in so it doesn't matter that it's a post middleware.
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    //If a doc was found
    if (doc) {
        //Remove all reviews that were referenced in the campground we just deleted(aka in doc.reviews)
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);