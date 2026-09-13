const mongoose = require("mongoose");

const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

const coordinates = {
    "Malibu": [-118.2437, 34.0259],
    "New York City": [-74.0060, 40.7128],
    "Aspen": [-106.8175, 39.1911],
    "Florence": [11.2558, 43.7696],
    "Portland": [-122.6784, 45.5152],
    "Cancun": [-86.8515, 21.1619],
    "Lake Tahoe": [-120.0324, 39.0968],
    "Los Angeles": [-118.2437, 34.0522],
    "Verbier": [7.2289, 46.0960],
    "Serengeti National Park": [34.8333, -2.3333],
    "Amsterdam": [4.9041, 52.3676],
    "Fiji": [178.0650, -17.7134],
    "Cotswolds": [-1.8433, 51.8330],
    "Boston": [-71.0589, 42.3601],
    "Bali": [115.1889, -8.4095],
    "Banff": [-115.5708, 51.1784],
    "Miami": [-80.1918, 25.7617],
    "Phuket": [98.3923, 7.8804],
    "Scottish Highlands": [-4.2026, 57.3437],
    "Dubai": [55.2708, 25.2048],
    "Montana": [-110.3626, 46.8797],
    "Mykonos": [25.3289, 37.4467],
    "Costa Rica": [-84.0907, 9.7489],
    "Charleston": [-79.9311, 32.7765],
    "Tokyo": [139.6917, 35.6895],
    "New Hampshire": [-71.5724, 43.1939],
    "Maldives": [73.2207, 3.2028],

    // Rooms
    "Mumbai": [72.8777, 19.0760],
    "Bengaluru": [77.5946, 12.9716],
    "Pune": [73.8567, 18.5204],
    "Goa": [74.1240, 15.2993],
    "Delhi": [77.1025, 28.7041],

    // Arctic
    "Tromso": [18.9553, 69.6492],
    "Rovaniemi": [25.7247, 66.5039],
    "Kiruna": [20.2253, 67.8558],
    "Svalbard": [15.6469, 78.2232],
    "Reykjavik": [-21.9426, 64.1466]
};

const main = async () => {
    await mongoose.connect(MONGO_URL);
    console.log("connected to db");
};

const initDB = async () => {

    const user = await User.findOne({ username: "demo2" });

    if (!user) {
        console.log("User not found");
        return;
    }

    // Delete old listings
    await Listing.deleteMany({});

    // Add owner + geometry
    const listings = initData.data.map((obj) => {

        const locationCoordinates = coordinates[obj.location];

        if (!locationCoordinates) {
            throw new Error(`Coordinates not found for ${obj.location}`);
        }

        return {
            ...obj,
            owner: user._id,

            geometry: {
                type: "Point",
                coordinates: locationCoordinates
            }
        };
    });

    await Listing.insertMany(listings);

    console.log(`${listings.length} listings were initialized`);
};

const start = async () => {
    try {
        await main();
        await initDB();

        await mongoose.connection.close();

        console.log("Database connection closed");
    } catch (err) {
        console.log(err);
    }
};

start();