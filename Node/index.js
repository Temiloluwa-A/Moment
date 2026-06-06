require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);
const mongoose = require("mongoose")
const express = require("express")
const app = express()
const dotenv = require("dotenv")
const cors = require('cors')
dotenv.config()
app.use(cors({
    origin: 'https://moment-pink.vercel.app',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.urlencoded({extended:true})) //to interpret the data sent from the client in the form of urlencoded data, extended:true allows us to send nested objects in the form of urlencoded data
app.use(express.json()) 
const path = require("path")
const UserRoutes = require("./routes/user.routes")
const MomentRoutes = require("./routes/moment.routes")
app.use("/api/v1", UserRoutes)
app.use("/api/v1", MomentRoutes)

mongoose.connect(process.env.DB_URI)
.then(() => {
    console.log("Database connected successfully");
})
.catch ((err) => {
    console.log(err);
    console.log("error connecting to database.");
    
    
})


// THE CATCH-ALL ROUTE (Must be the very last route in your file!)

app.get('/{*splat}', (req, res) => {
  res.status(404).json({ message: "This route does not exist on the API backend." });
});


app.listen(process.env.PORT, (err)=> {
    if(err) {
        console.log("cannot start server");
    }
    else{
        console.log(`server started successfully at ${process.env.PORT}`);
        
    }

})
