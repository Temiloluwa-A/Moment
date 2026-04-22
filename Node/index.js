require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);
const mongoose = require("mongoose")
const express = require("express")
const app = express()
const dotenv = require("dotenv")
dotenv.config()
app.use(express.urlencoded({extended:true})) //to interpret the data sent from the client in the form of urlencoded data, extended:true allows us to send nested objects in the form of urlencoded data
app.use(express.json()) 
const path = require("path")

const UserRoutes = require("./routes/user.routes")
app.use("/api/v1", UserRoutes)

mongoose.connect(process.env.DB_URI)
.then(() => {
    console.log("Database connected successfully");
})
.catch ((err) => {
    console.log(err);
    console.log("error connecting to database.");
    
    
})



app.listen(process.env.PORT, (err)=> {
    if(err) {
        console.log("cannot start server");
    }
    else{
        console.log(`server started successfully at ${process.env.PORT}`);
        
    }

})

