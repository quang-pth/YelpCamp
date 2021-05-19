const express = require("express");
const router = express.Router();
const campground = require('../controller/campground');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');
const {storage} = require('../cloudinary');
const multer  = require('multer');
const upload = multer({ storage });


// show all campgrounds
// save new campground from new.ejs
// use catchAsync to handle err and pass err to next
router.route('/')
    .get(catchAsync(campground.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campground.createCampground))
    // .post(upload.array('image'), (req, res) => {
    //     console.log (req.body, req.files);
    //     res.send("it worked");

    // })

// add new campground page
router.get('/new', isLoggedIn, campground.renderNewForm);


// route for showing campground page by id
// handle error id not found or not valid 
// edit campground from edit.ejs
// user cannot edit if they not log in 
// delte campground by id
// handle error id not found or not valid 
router.route('/:id')
    .get(catchAsync(campground.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campground.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campground.deleteCampground))

    
// edit page 
// handle error id not found or not valid 
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campground.renderEditForm));




module.exports = router;


