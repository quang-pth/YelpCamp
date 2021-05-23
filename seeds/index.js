const mongoose = require('mongoose');
// use campround model in "models" folder
const Campground = require("../models/campground");
// import cities, places and descriptors
const cities = require('./cities');
const {places, descriptors} = require('./seedsHelper');
const imagesSrc = require("./imagesPath");

// connect to database and declare some option
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

// check whether successfully connect to database
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
}); 

// take a random element in array
const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async() => {
    await Campground.deleteMany({});
    // take 50 city random from cities dataset
    for (let i = 0; i < 358; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;

        // console.log(imagesSrc[i].path);
        // console.log(imagesSrc[i].filename);

        const camp = new Campground({
            author: '60975144c200631a585ad4de',
            // get name and state of city
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            // generate randome title for camp
            title: `${sample(descriptors)} ${sample(places)}`,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude, 
                    cities[random1000].latitude
                ]
            },
            images: [
                {
                    url: sample(imagesSrc).path,
                    fileName: sample(imagesSrc).filename
                },
                {
                    url: sample(imagesSrc).path,
                    fileName: sample(imagesSrc).filename
                }
            ],
                
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Error voluptate omnis ea provident minus laudantium consequatur non architecto aperiam! Vero fuga minus facilis vitae architecto aliquam eaque expedita voluptas repellendus?',
            price: price
        })
        await camp.save();
    }
}

// seedBD is async funtion => then
seedDB()
.then(() => {
    mongoose.connection.close();
    console.log("CONNECTION CLOSED");
})
.catch(err => {
    console.log(err);
    console.log("CANT CLOSED CONNECTED");
})



