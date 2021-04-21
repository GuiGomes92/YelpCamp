//If not in production mode, we'll have access to the variables stored in the .env file via process.env.variableName
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}


//Require express
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
//Require mate to use layout in our templates 
const ejsMate = require('ejs-mate')
//Require session
const session = require('express-session')
//Require flash
const flash = require('connect-flash')
//Require the error class we wrote on utils
const ExpressError = require('./utils/ExpressError');
//Method override allows us to use patch, put and delete as methods
const methodOverride = require('method-override')
//Require Passport
const passport = require('passport');
const LocalStrategy = require('passport-local')
//Require user model
const User = require('./models/user')
//Mongo Sanitize helps us to not include mongo special characters to query strings to prevent mongo injections
const mongoSanitize = require('express-mongo-sanitize')
//Require helmet
const helmet = require('helmet')

//Import the routes for users
const userRoutes = require('./routes/users')
//Import the routes for campgrounds
const campgroundRoutes = require('./routes/campgrounds')
//Import the routes for reviews
const reviewRoutes = require('./routes/reviews');

//Require connect mongo and execute it so we store our session in mongo
const MongoDBStore = require('connect-mongo')(session);

//Mongo atlas DB
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

//Connect to mongoose database
mongoose.connect(dbUrl, {
    //Fix all deprecation warnings
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})

const db = mongoose.connection;
//Check if connection established.
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
});

//Set express to run
const app = express();

//Set application to use ejs-mate
app.engine('ejs', ejsMate)
//Set the application to use the views directory
app.set('view engine', 'ejs');
//Join paths with views
app.set('views', path.join(__dirname, 'views'))

//Parse form bodies
app.use(express.urlencoded({ extended: true }))
//Set method override
app.use(methodOverride('_method'))
//Serve static files
app.use(express.static(path.join(__dirname, 'public')))
//Use mongo sanitizer and replace $ or other mongo characters with and underscore
app.use(mongoSanitize({
    replaceWith: '_'
}))

const secret = process.env.SECRET || 'thisshouldbeabettersecret!'

//Configure mongo connect
const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
})

//If there's any errors...
store.on('error', function(e) {
    console.log("Session Store Error", e)
})

//Configure the session
//The way this is writen, it's using the local memory. Which we'll eventually move to a mongo db
const sessionConfig = {
    //Configure session to be stored in our store object
    store,
    //Set the name of the cookie that stores the session
    name: 'session',
    secret,
    //Fix deprecation warnings
    resave: false,
    saveUninitialized: true,
    //Config the cookie we're using for the session
    cookie: {
        //If http only set to true, the cookie cannot be accessed through client-side scripts.
        httpOnly: true,
        
        //Set the cookies to work only over https but we should just leave commented while using localhost, cause then it will break as localhost is not https.
        //Uncomment it in production mode
        //secure: true,
        //The date object is constructed with miliseconds, therefore we do this math to figure out how many miliseconds there are in a week.
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        //Max-age sets the time in seconds for when a cookie will be deleted
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

//Start using session
app.use(session(sessionConfig))

//Start using flash
app.use(flash());

//Start using all middlewares in helmet
app.use(helmet())

//Configure links we want to fetch resources from
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];

//Configure Security police for helmet
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dflqdpa2r/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

//Use passport
app.use(passport.initialize())
app.use(passport.session())

//Use authenticate that was added authomatically from passport to out user model
passport.use(new LocalStrategy(User.authenticate()));
//How to serialize(store user in the session) a user
passport.serializeUser(User.serializeUser())
//How to deserialize(get user outside session) a user
passport.deserializeUser(User.deserializeUser())

//Middleware to pass flash message automatically to our templates
app.use((req, res, next) => {
    console.log(req.query)
    //As we have access to these infos in every request, we're passing the curent user passport gives access to.
    res.locals.currentUser = req.user
    //If there's a message, it will be available to the template through locals
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

//Set campgrounds routes and prefix it with "campgrounds" so we don't need to keep writing it again
app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

//Homepage
app.get('/', (req, res) => {
    res.render('home')
})

//Order Matters. This will only run if no path is matched before, generating a "NOT FOUND" error.
//The error will the passed to the error middleware
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

//Basic error middleware
app.use((err, req, res, next) => {
    //Destructure the error. If there's no statusCode, set it to 500.
    const { statusCode = 500 } = err;
    //If there's no message, set it to the string indicated.
    if (!err.message) err.message = 'Oh no, Something Went Wrong!'
    //Set our response dinamically with the parameters that were passed previously.
    //Also render our error template and pass the error to it.
    res.status(statusCode).render('error', { err })
})

//Present automatically on heroku. If not present, default to 3000.
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})