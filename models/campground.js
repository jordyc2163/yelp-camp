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

const CampgroundSchema = new Schema({
    title: {
        type: String
    },
    price: {
        type: Number
    },
    image: {
        type: String
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