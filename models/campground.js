// create campground model
const mongoose = require('mongoose');
const Review = require('./review');
// use Schema in code instead of mongoose.Schema.sth 
const Schema = mongoose.Schema;


// https://res.cloudinary.com/<cloud_name>/image/upload/<public_id>.<extension>
const ImageSchema = new Schema({
    url: String,
    fileName: String
});

ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('upload', 'upload/w_200');
})

// includes virtual in res.json() 
const opts = { toJSON: { virtuals: true } };

// new Schema instead of mongoose.Schema
const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    // define mongoose Point Schema to make use of mongodb operations
    geometry: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    // one campground can have many reviews
    reviews: [
        {
            type: Schema.Types.ObjectId,
            // reference Review model
            ref: 'Review'
        }
    ]
}, opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function() {
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0, 20)}...</p>`;
})



// use mongo middleware to delete reviews associated with being deleted campground
CampgroundSchema.post('findOneAndDelete', async function(doc) {
    if(doc) {
        // remove all reviews
        await Review.deleteMany({
            // where it _id in the document.reviews
            _id: {
                $in: doc.reviews
            }
        })
    }
})


module.exports = mongoose.model('Campground', CampgroundSchema);