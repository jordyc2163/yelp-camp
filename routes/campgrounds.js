const express  = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const { isLoggedIn, isAuthor, isCampground, validateCampground } = require('../middleware')


// CRUD ROUTES //

// Index
router.get('/', async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
})

// New
router.get('/new', isLoggedIn,  (req, res) => {
    res.render('campgrounds/new')
})

// Create
router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res) => {
    const campground = new Campground(req.body.campground)
    campground.author = req.user._id
    await campground.save()
    req.flash('success', 'Successfully made a new campground')
    res.redirect(`/campgrounds/${campground._id}`)
}))

// Show
router.get('/:id', isCampground, catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author')
    console.log(campground)
    if(!campground) {
        req.flash('error', 'Cannot find that campground')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground })
}))


// Edit
router.get('/:id/edit', isLoggedIn, isCampground, isAuthor, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    if(!campground) {
        req.flash('error', 'Cannot find that campground')
        return res.redirect('/campgrounds')
    }
    res.render(`campgrounds/edit`, { campground })
}))

// Update
router.put('/:id', isLoggedIn, isAuthor, isCampground, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    req.flash('success', 'Successfully updated campground')
    res.redirect(`/campgrounds/${id}`)
}))

// Destroy
router.delete('/:id', isLoggedIn, isCampground, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)

    req.flash('success', 'Successfully deleted campground.')
    res.redirect('/campgrounds')
}))

module.exports = router