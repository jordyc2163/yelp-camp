const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;


dateTimeToParts = (date) => {
    let day = new Date(date).getDay()
    let month = new Date(date).getMonth()
    let year = new Date(date).getFullYear()
    let hours = new Date(date).getHours()
    let minutes = new Date(date).getMinutes()
    let seconds = new Date(date).getSeconds()
    return { day, month, year, hours, minutes, seconds };
}

const ImageSchema = new Schema({
    url: String,
    filename: String
})

ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200');
})

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
    title: {
        type: String
    },
    price: {
        type: Number
    },
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    description: {
        type: String
    },
    location: {
        type: String
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    creationDate: {
        type: Date,
        default: Date.now
    }
}, opts)

CampgroundSchema.virtual('properties.popUpMarkup').get(function() {
    return `
    <a href="/campgrounds/${this.id}">${this.title}</a>
    <p>${this.description.substring(0,30)}...</p>
    `;
})

CampgroundSchema.virtual('createdOn').get(function(){
    let { day, month, year, hours, minutes, seconds } = dateTimeToParts(
        this.creationDate
    );
    return {
        date: `${day}/${month}/${year}`,
        time: `${hours}:${minutes}:${seconds}`
    };
})

CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if(doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})
module.exports = mongoose.model('Campground', CampgroundSchema)