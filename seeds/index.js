const mongoose = require('mongoose');
const cities = require('./cities');
const {places,descriptors} = require('./seedHelpers');
const Campground = require('../models/campground');

const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp';
mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",() => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random()*array.length)];

const seedDB = async() => {
    await Campground.deleteMany({});
    for(let i = 0; i < 50; i++)
    {
        const random1000 = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random()*20) + 10;
        const camp = new Campground({
            author: '6aa40cb8cd4444e2b57552ad',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Impedit dolore ipsa autem nobis quidem id vitae! Iusto, tempore quod sequi quo quibusdam praesentium consectetur non similique doloribus maiores atque sed!',
            price,

            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },

            images: [
                {
                url: 'https://res.cloudinary.com/dyplv7xe5/image/upload/v1788954217/YelpCamp/uyxabcb64cfjrwxigbm1.jpg',
                filename: 'YelpCamp/uyxabcb64cfjrwxigbm1'
                },
                {
                url: 'https://res.cloudinary.com/dyplv7xe5/image/upload/v1788954222/YelpCamp/t8qjhlusgodoohijimul.jpg',
                filename: 'YelpCamp/t8qjhlusgodoohijimul'
                }
            ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});