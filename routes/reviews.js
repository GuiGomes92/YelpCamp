const express = require('express')
//We merge the params so we have access to it our the routes will treat it separately
const router = express.Router({ mergeParams: true });
//Require middleware functions:
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')
//Require campground model
const Campground = require('../models/campground')
//Require review model
const Review = require('../models/review')
//Require review controller
const reviews = require('../controllers/reviews')
//Require the error class we wrote on utils
const ExpressError = require('../utils/ExpressError');
//Require the wrapper function to deal with errors in asynchronous funcions
const catchAsync = require('../utils/catchAsync')

//Create new review associated with a campground, therefore we need the id.
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))


//Delete review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;