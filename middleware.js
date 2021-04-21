//Require and desctructure (cause eventually we'll have more schemas) the schema we want to use from the schema file.
const { campgroundSchema, reviewSchema } = require('./schemas.js')
const ExpressError = require('./utils/ExpressError')
const Campground = require('./models/campground')
const Review = require('./models/review')

//Middleware to check if a user is logged in
module.exports.isLoggedIn = (req, res, next) => {
    //Check if user is authenticated. This method comes from passport
    if (!req.isAuthenticated()) {
        //Store in the session the url user was trying to access and they were not logged in
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in first')
        return res.redirect('/login')
    }
    next();
}

//Middleware to validate data on the server-side using joi.
module.exports.validateCampground = (req, res, next) => {
    //Pass our data through to the schema.
    const { error } = campgroundSchema.validate(req.body)
    //Check if there's an error
    if (error) {
        //We need to map the message inside details as it is an array with an object.
        //The join() method returns the array as a string.
        //The map() method creates a new array populated with the results of calling a provided function on every element in the calling array.
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

//Middleware to see if user logged in is the author of campground
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    //Find the campground
    const campground = await Campground.findById(id)
    //Check if author is not the currently user logged in.
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!')
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

//Middleware to see if user logged in is the author of the review
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    //Find the review
    const review = await Review.findById(reviewId)
    //Check if author is not the currently user logged in.
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!')
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

//Middleware to validate data on the server-side using joi for reviews.
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        //We need to map the message inside details as it is an array with an object.
        //The join() method returns the array as a string.
        //The map() method creates a new array populated with the results of calling a provided function on every element in the calling array.
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}
