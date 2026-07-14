const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        console.log("MONGO_URI:");
        console.log(process.env.MONGO_URI);

        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB Connected Successfully");
    } catch (error) {
        console.log("MongoDB Connection Error:");
        console.log(error);
        process.exit(1);
    }
};

module.exports = connectDB;