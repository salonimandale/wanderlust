const Listing=require("../models/listing");
const ExpressError = require("../utils/ExpressError.js");
const geocode = require("../utils/geocode.js");

//render all listings
module.exports.index = async (req, res) => {

    const { category } = req.query;

    let allListings;

    if (category) {
        allListings = await Listing.find({
            category: category
        });
    } else {
        allListings = await Listing.find({});
    }

    console.log("Category:", category);
    console.log("Total:", allListings.length);
    console.log(allListings.map(l => l.title));

    res.render("listings/index", { allListings });
};

//new route
module.exports.renderNewForm=(req,res)=>{
    console.log(req.user);
    
   
    res.render("listings/new.ejs");
};

//show route
module.exports.showListing = async (req, res) => {

    console.log("Show route called");

    let { id } = req.params;

    const listing = await Listing.findById(id)
        .populate("owner")
        .populate({
            path: "reviews",
            populate: {
                path: "author"
            }
        });

    // Listing doesn't exist
    if (!listing) {
        req.flash(
            "error",
            "Listing you requested for does not exist"
        );

        return res.redirect("/listings");
    }

    // Check if old listing has coordinates
    if (
        !listing.geometry ||
        !listing.geometry.coordinates ||
        listing.geometry.coordinates.length < 2
    ) {

        console.log("Old listing - generating coordinates...");

        const coordinates = await geocode(
            listing.location,
            listing.country
        );

        listing.geometry = {
            type: "Point",
            coordinates: [
                coordinates.longitude,
                coordinates.latitude
            ]
        };

        await listing.save();

        console.log(
            "Coordinates added:",
            listing.geometry
        );
    }

    res.render("listings/show", {
        listing
    });
};


//edit route
module.exports.renderEditForm=async (req, res) => {
    console.log("Edit route called");

    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }
   let originalImageUrl=listing.image.url;
   originalImageUrl= originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs", { listing , originalImageUrl});
};

//create route
module.exports.createListing = async (req, res) => {

    // 1. Get uploaded image from Cloudinary
    let url = req.file.path;
    let filename = req.file.filename;

    console.log(url, "..", filename);

    // 2. Get latitude and longitude from location
    const coordinates = await geocode(
        req.body.listing.location,
        req.body.listing.country
    );

    console.log("Coordinates:", coordinates);

    // 3. Create new listing
    const newListing = new Listing(req.body.listing);

    // 4. Add owner
    newListing.owner = req.user._id;

    // 5. Add image
    newListing.image = {
        url,
        filename
    };

    // 6. Add location coordinates
    newListing.geometry = {
        type: "Point",
        coordinates: [
            coordinates.longitude,
            coordinates.latitude
        ]
    };

    // 7. Save listing
    await newListing.save();

    console.log("SAVED LISTING:", newListing);

    req.flash("success", "New Listing Created");

    res.redirect("/listings");
};

//update route
module.exports.updateListing = async (req, res) => {

    // Check whether valid listing data was sent
    if (!req.body || !req.body.listing) {
        throw new ExpressError(404, "Send valid data for listing");
    }

    let { id } = req.params;

    // Find the existing listing
    let listing = await Listing.findById(id);

    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    // Update normal listing fields
    Object.assign(listing, req.body.listing);


    // ==============================
    // UPDATE LOCATION COORDINATES
    // ==============================

    const coordinates = await geocode(
        listing.location,
        listing.country
    );

    listing.geometry = {
        type: "Point",
        coordinates: [
            coordinates.longitude,
            coordinates.latitude
        ]
    };


    // ==============================
    // UPDATE IMAGE IF NEW IMAGE
    // ==============================

    if (typeof req.file !== "undefined") {

        let url = req.file.path;
        let filename = req.file.filename;

        listing.image = {
            url,
            filename
        };
    }


    // Save everything
    await listing.save();


    console.log("UPDATED LISTING:", listing);

    req.flash("success", "Listing updated");

    res.redirect(`/listings/${id}`);
};

//delete route
module.exports.destoryListing=async (req,res)=>{
    let {id} = req.params;
    let deletedListing =await Listing.findByIdAndDelete(id)
    console.log(deletedListing);
    req.flash("success","Listing deleted");
    res.redirect("/listings");
};

//search route
module.exports.searchListings = async (req, res) => {
    const q = req.query.q?.trim();

    if (!q) {
        return res.redirect("/listings");
    }

    const allListings = await Listing.find({
        $or: [
            { title: { $regex: q, $options: "i" } },
            { location: { $regex: q, $options: "i" } },
            { country: { $regex: q, $options: "i" } }
        ]
    });

    res.render("listings/index", { allListings });
};