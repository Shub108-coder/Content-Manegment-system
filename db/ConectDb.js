const mongoose = require("mongoose");

function ConnectDb(){
    try{
    mongoose.connect('mongodb://localhost:27017/CMSDB')
.then(() => {
    console.log("Database is Connected")
})
}catch(err){
    console.log("There was an Error While Connecting to the data base")
}
}

module.export = ConnectDb();