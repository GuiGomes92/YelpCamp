//Require campground model
const Campground = require('../models/campground')
//Require review model
const Review = require('../models/review')

module.exports.createReview = async (req, res) => {
    //Find campground we're trying to add reviews
    const campground = await Campground.findById(req.params.id)
    //Create new review
    const review = new Review(req.body.review);
    //Sign logged in user to the new review
    review.author = req.user._id
    //Push review to campground db
    campground.reviews.push(review);
    //Save review
    await review.save();
    //Save campground
    await campground.save();
    req.flash('success', 'Created new review!');
    //Redirect back to campground show page
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteReview = async (req, res) => {
    //Destructure id and review id from the url we passed
    const { id, reviewId } = req.params;
    //Find the campground and remove the reference to that review
    //The $pull operator removes from an existing array all instances of a value or values that match a specified condition.
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    //Delete review
    await Review.findByIdAndDelete(reviewId);
    //Redirect to campground page
    req.flash('success', 'Successfully deleted review!');
    res.redirect(`/campgrounds/${id}`)
}