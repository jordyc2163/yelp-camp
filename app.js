if (process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}

const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const ExpressError = require('./utils/expressError')
const methodOverride = require('method-override')
const session = require('express-session')
const MongoDBStore = require('connect-mongo')
const flash = require('connect-flash')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')
const helmet = require('helmet')

const mongoSanitize = require('express-mongo-sanitize')

const authRoutes = require('./routes/auth')
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'
const secret = process.env.SECRET_KEY || 'thisisnotthesecretyoushouldlookfor'

// DB CONNNECTION
// mongodb://localhost:27017/yelp-camp
mongoose.connect(dbUrl)

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})


// APP CONFIGURATION
const app = express();

app.engine('ejs', ejsMate)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')


// MIDDLEWARE
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize()) // removes SQL Injection

const store = MongoDBStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: secret,
    }
})

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    name: 'session',
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash())

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/dxqjxwzfa/"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/dxqjxwzfa/"
];
const connectSrcUrls = [
    "https://*.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://events.mapbox.com",
    "https://res.cloudinary.com/dxqjxwzfa/"
];
const fontSrcUrls = [ "https://res.cloudinary.com/dxqjxwzfa/" ];
 

// Helmet restricts where the application fetches scripts or other sources from
app.use(
    helmet.contentSecurityPolicy({
        directives : {
            defaultSrc : [],
            connectSrc : [ "'self'", ...connectSrcUrls ],
            scriptSrc  : [ "'unsafe-inline'", "'self'", ...scriptSrcUrls ],
            styleSrc   : [ "'self'", "'unsafe-inline'", ...styleSrcUrls ],
            workerSrc  : [ "'self'", "blob:" ],
            objectSrc  : [],
            imgSrc     : [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dxqjxwzfa/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                "https://images.unsplash.com/"
            ],
            fontSrc    : [ "'self'", ...fontSrcUrls ],
            mediaSrc   : [ "https://res.cloudinary.com/dxqjxwzfa/" ],
            childSrc   : [ "blob:" ]
        }
    })
);

app.use(
    helmet.crossOriginEmbedderPolicy({ 
        policy: "credentialless" 
    }));

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// global variable setter
app.use((req, res, next) => {
    res.locals.currentUser = req.user // the session user by 'passport' when logged in
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

app.use('/', authRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)





app.get('/', (req, res) => {
    res.render('home')
})


// ANYTHING ELSE
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})
// ERROR HANDLER
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err
    if (!err.message) { err.message = "Something went wrong" }
    res.render('error', { err })
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`serving on port ${3000}`)
})

