const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});


module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', {campgrounds});
};


module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
};


module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({url: f.path, fileName: f.filename}));
    // add author of campground
    campground.author = req.user._id;
    // save to database 
    await campground.save();
    console.log(campground);
    // display message when successfully add new campground
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`campgrounds/${campground._id}`);
};


module.exports.showCampground = async (req, res) => {
    const {id} = req.params;
    // find reviews for each campground
    // take author of review and author of campground 
    const campground = await (await Campground.findById(id)
    .populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    })
    .populate('author'));
    // error find campground not exists
    if (!campground) {
        req.flash('error', 'Cannot find that campground!!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', {campground});
};

module.exports.renderEditForm = async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    // error edit campground not exists
    if (!campground) {
        req.flash('error', 'Cannot find that campground!!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', {campground});
};


module.exports.updateCampground = async (req, res) => {
    const {id} = req.params;
    console.log(req.body);
    // ""..." split req body attribute to update
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    const imgs = req.files.map(f => ({url: f.path, fileName: f.filename}));
    campground.images.push(...imgs);
    await campground.save();
    // delete img
    if (req.body.deleteImages) {
        // delete img in cloudinary
        for (let filename of req.body.deleteImages) {
            cloudinary.uploader.destroy(filename);
        }
        // delete in mongo
        await campground.updateOne({$pull: {images: {fileName: {$in: req.body.deleteImages}}}});
        console.log(campground);
    }
    // display message when updated campground
    req.flash('success', 'Successfully updated campground!!');
    res.redirect(`/campgrounds/${campground._id}`); 
};

module.exports.deleteCampground = async (req, res) => {
    const {id} = req.params;
    // findByIdAndDelete trigger findOneAndDelete middleware in mongoDB
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted a campground!!')
    res.redirect('/campgrounds');
};

