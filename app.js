// run in development mode 
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

// require('dotenv').config();

// console.log(process.env.SECRET) 
// console.log(process.env.API_KEY)

const express = require("express");
const app = express();
const path = require('path');
const mongoose = require('mongoose');
// ejs-mate for layout content
const ejsMate = require('ejs-mate');
const flash = require("connect-flash");
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const User = require('./models/user');
const helmet = require("helmet");
const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

const session = require('express-session');
const MongoStore = require('connect-mongo');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
// const dbUrl = 'mongodb://localhost:27017/yelp-camp';

// 'mongodb://localhost:27017/yelp-camp'
// connect to database and declare some option
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

// check whether successfully connect to database
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

// use ejs-mate
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// parse form submit
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
// set route serve for static files
app.use(express.static(path.join(__dirname, 'public')));

app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta3/dist/css/bootstrap.min.css",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];

const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta3/dist/css/bootstrap.min.css",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];

const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];

const fontSrcUrls = [];
// restrict location we can fetch resource from
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
                "https://res.cloudinary.com/dqxhqjbne/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// prevent mongo operator in query string which leads to Mongo Operator Injection
app.use(mongoSanitize(
    { 
        replaceWith: '_',
    }
    ));
    
const secret = process.env.SECRET || "thisshouldbeabettersecret!"; 
// use mongo store session
const store = new MongoStore({
    mongoUrl: dbUrl,
    secret: secret,
    // update session once in 24 hrs
    touchAfter: 24 * 60 * 60
})

store.on("error", function(e) {
    console.log("SESSION STORE ERROR", e);
})

// config session
const sessionConfig = {
    store,
    // set name for session
    name: "session",
    secret: secret,
    resave: false,
    saveUninitialized: true,
    // cookie expires after one week 
    cookie: {
        httpOnly: true,
        // cookie can just be configed over HTTPS
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

// use session() before passport.session()
app.use(session(sessionConfig));
app.use(flash());
// intialize passport
app.use(passport.initialize());
// passport.session() must be used if app uses persistent login
app.use(passport.session());
// authentication method locate on User model
// passport-local-mongoose add static methods to User model like authenticate()
passport.use(new LocalStrategy(User.authenticate()));
// how to store user in the session
passport.serializeUser(User.serializeUser());
// how to get user out the session
passport.deserializeUser(User.deserializeUser());

// set locals variable key for accessing
app.use((req, res, next) => {
    // req.user contain logged in user info
    // connsole.log(req.session)
    // console.log(req.query);
    res.locals.currentUser = req.user;
    res.locals.success= req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/fakeUser', async (req, res) => {
    const user = new User({email: 'asdbc@gmail.com', username: 'colt'});
    const newUser = await User.register(user, 'chicken');
    res.send(newUser);
})

app.use('/', userRoutes);
// breakout campgrounds routes
app.use('/campgrounds', campgroundRoutes);
// on routes/reviews.js, set mergeParmas = true to use the /:id params
app.use('/campgrounds/:id/reviews', reviewRoutes)

app.get('/', (req, res) => {
    res.render('home');
})

// res for every method
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

// default error handling middleware/
app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if (!err.message) err.message = 'Oh no, Something went wrong!'

    res.status(statusCode).render('error', {err});
    // res.send('oh boy, sth went wrong!');    
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`SERVING ON PORT ${port}`);
})


