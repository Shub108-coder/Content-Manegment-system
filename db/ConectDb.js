const mongoose = require("mongoose");

function ConnectDb(){
    try{
    mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("Database is Connected")
})
}catch(err){
    console.log("There was an Error While Connecting to the data base")
}
}

module.export = ConnectDb();
