const express  = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds')
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const { isLoggedIn, isAuthor, isCampground, validateCampground } = require('../middleware')


// CRUD ROUTES //

router.route('/')
    .get(catchAsync(campgrounds.index)) // Index
    .post(
        isLoggedIn, 
        validateCampground, 
        catchAsync(campgrounds.createCampground)) // Create

// New
router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .get(isCampground, catchAsync(campgrounds.showCampground)) // Show
    .put(
        isLoggedIn, 
        isAuthor, 
        isCampground, 
        validateCampground, 
        catchAsync(campgrounds.updateCampground)) // Update
    .delete(
        isLoggedIn, 
        isCampground, 
        isAuthor, 
        catchAsync(campgrounds.deleteCampground)) // Destroy

// Edit
router.get('/:id/edit', 
    isLoggedIn, 
    isCampground, 
    isAuthor, 
    catchAsync(campgrounds.renderEditForm))

module.exports = router