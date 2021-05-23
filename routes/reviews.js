const express = require("express");
// seperate routes use the same params  
const router = express.Router({mergeParams: true});
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const Review = require('../models/review');
const review = require('../controller/review');
// const ExpressError = require('../utils/ExpressError');
// const { reviewSchema }  = require('../validateSchema');
const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware');


// post new review
router.post('/', isLoggedIn, validateReview, catchAsync(review.createReview));

// delete review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(review.deleteReview));


module.exports = router;