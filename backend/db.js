const mongoose = require('mongoose');

const mongooseURI = "mongodb://127.0.0.1:27017/inotebook"

const connectToMongo = ()=>{
    mongoose.connect(mongooseURI);
        console.log("Connected to Mongo Successfully");
    }

module.exports = connectToMongo;