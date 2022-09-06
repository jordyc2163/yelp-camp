const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const reviews = require('../controllers/reviews')
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')


// Create
router.post('/', 
    isLoggedIn, 
    validateReview, 
    reviews.createReview )

// Destroy
router.delete('/:reviewId', 
    isLoggedIn, 
    isReviewAuthor, 
    catchAsync(reviews.deleteReview))

module.exports = router