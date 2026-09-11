const Campground = require('../models/campground');
const {cloudinary} = require('../cloudinary');

const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index = async (req,res) => {
    const campgrounds = await Campground.find({});
    res.json(campgrounds);
}

module.exports.renderNewForm = (req,res) => {
    res.json({ message: "New Form" });
}

module.exports.createCampground = async (req,res) => {

    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    if (!geoData.features?.length) {
        return res.status(400).json({ error: 'Could not geocode that location. Please try again and enter a valid location.' });
    }

    const campground = new Campground(req.body.campground);

    campground.geometry = geoData.features[0].geometry;
    campground.location = geoData.features[0].place_name;

    campground.images = req.files.map(f =>({url: f.path, filename: f.filename}));
    campground.author = req.user._id;
    await campground.save();
    res.status(201).json(campground);
}

module.exports.showCampground = async (req,res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path:'reviews',
        populate:{
            path:'author'
        }
    }).populate('author');
    if(!campground){
        return res.status(404).json({ error: 'Cannot find that Campground' });
    }
    res.json(campground);
}

module.exports.renderEditForm = async (req,res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground){
        return res.status(404).json({ error: 'Cannot find that Campground' });
    }
    res.json(campground);
}

module.exports.updateCampground = async (req,res) => {
    const {id} = req.params;
    // console.log(req.body);

    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    if (!geoData.features?.length) {
        return res.status(400).json({ error: 'Could not geocode that location. Please try again and enter a valid location.' });
    }

    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground});

    campground.geometry = geoData.features[0].geometry;
    campground.location = geoData.features[0].place_name;

    const imgs = req.files.map(f =>({url: f.path, filename: f.filename}));
    campground.images.push(...imgs);
    await campground.save();
    if(req.body.deleteImages)
    {
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}});
        // console.log(campground);
    }
    res.json(campground);
}

module.exports.deleteCampground = async (req,res) =>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.json({ message: 'Successfully deleted a Campground!!' });
}