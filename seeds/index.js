const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers')

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
    await Campground.deleteMany({})
    for (let i = 0; i < 400; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = await new Campground({
            author: '63125d2eb40288421042760e',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                    url: 'https://res.cloudinary.com/dxqjxwzfa/image/upload/v1662578104/YelpCamp/tspkfnq0zf2yfc02raom.jpg',
                    filename: 'YelpCamp/tspkfnq0zf2yfc02raom',
                  },
                  {
                    url: 'https://res.cloudinary.com/dxqjxwzfa/image/upload/v1662578104/YelpCamp/waenhbz0bqjrhtsyhopr.jpg',
                    filename: 'YelpCamp/waenhbz0bqjrhtsyhopr',
                  }
              ],
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Iure totam error, voluptate, inventore earum velit illum modi libero, rem quasi sequi. Vitae eaque accusamus inventore repudiandae minima aspernatur perspiciatis? Exercitationem?",
            price: price,
            geometry: {
                "type": "Point", 
                "coordinates": [
                    cities[random1000].longitude, 
                    cities[random1000].latitude
                ]
            }
        })
        await camp.save()
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})