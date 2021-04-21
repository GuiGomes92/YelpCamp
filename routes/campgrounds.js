const express = require('express')
const router = express.Router();
//Controller for campgrounds index
const campgrounds = require('../controllers/campgrounds')
//Require the wrapper function to deal with errors in asynchronous funcions
const catchAsync = require('../utils/catchAsync')
//Require campground model
const Campground = require('../models/campground')
//Require middleware to check is user is logged in
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware')
//Multer will help us parse 'multipart/form-data' we set the enctype to be on our new campground form to be able to deal with file uploading 
const multer = require('multer')
//Require our cloudinary storage
const { storage } = require('../cloudinary');
//Specify where our files should go. In this case, the cloudinary storage we created on the other file
const upload = multer({ storage })

//The 'route' instance of the router object allows us to deal with different verbs to to the same path.
router.route('/')
    //List all campgrounds
    .get(catchAsync(campgrounds.index))
    //Create new campgrouns and redirect to that camp show page
    //To use a middleware, we passed it as the second argument.
    //We use the catchAsync function we wrote in utils to catch any errors and then call next, which will be the error middleware at the end of this file.
    //upload.array('image') is the middleware to store the images files in cloudinary 
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))

//Form for new campground
router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    //Show camp page
    .get(catchAsync(campgrounds.showCampground))
    //Edit the camp
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    //Delete camp
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

// Form for editing a camp
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))


module.exports = router;