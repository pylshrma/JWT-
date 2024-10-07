const mongoose = require("mongoose");

function connectToDb(){
    mongoose.connect("mongodb://0.0.0.0/testDb").then(()=>{
        console.log("connected to database")
    })
    .catch(err =>{
        console.log("error connecting to database", err);
        
    })
}

module.exports = connectToDb;