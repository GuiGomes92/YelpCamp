//Require campground model
const Campground = require('../models/campground')
//Require cloudinary
const { cloudinary } = require('../cloudinary');
//Require mapbox do get the langitute, longitude of our camps.
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
}

module.exports.createCampground = async (req, res, next) => {
    //Get the coordinates taken from the location the user passed in using Mapbox. For specifics, check the docs.
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    //if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    //Save to campground the results from the MapBox function
    campground.geometry = geoData.body.features[0].geometry
    //Loop over the images uploaded and store the url and filenames returned
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    //Set the author of the campground to be the user who is currently logged in:
    campground.author = req.user._id
    await campground.save();
    console.log(campground);
    //Flah message that everything was ok.
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        //Here we're populate the review author
        populate: {
            path: 'author'
        }
        //And Here we're populate the campground author
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find that campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    //Loop over the images uploaded and save the new array to 'imgs'
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    //Push the spreaded content to the existing array of images in the db
    campground.images.push(...imgs)
    await campground.save();
    //Delete Images if there are images to be deleted
    if (req.body.deleteImages) {
        //Delete from cloudinary
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        //Pull from the images array where filename is in req.body.deleteImages array
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
        console.log(campground)
    }
    req.flash('success', 'Successfully updated the campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');
}