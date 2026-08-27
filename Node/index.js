require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);
const mongoose = require("mongoose")
const express = require("express")
const app = express()
const dotenv = require("dotenv")
const cors = require('cors')
const helmet = require('helmet')
dotenv.config()
app.use(helmet())
app.use(cors({
    origin: ['https://moment-pink.vercel.app', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.urlencoded({extended:true})) //to interpret the data sent from the client in the form of urlencoded data, extended:true allows us to send nested objects in the form of urlencoded data
app.use(express.json())
const UserRoutes = require("./routes/user.routes")
const MomentRoutes = require("./routes/moment.routes")
const startNotificationScheduler = require("./jobs/scheduler")
app.use("/api/v1", UserRoutes)
app.use("/api/v1", MomentRoutes)

mongoose.connect(process.env.DB_URI)
.then(() => {
    console.log("Database connected successfully");
    startNotificationScheduler();
})
.catch ((err) => {
    console.log(err);
    console.log("error connecting to database.");


})


// THE CATCH-ALL ROUTE (Must be the very last route in your file!)

app.get('/{*splat}', (req, res) => {
  res.status(404).json({ message: "This route does not exist on the API backend." });
});

// Centralized error handler — catches things thrown into next(err) (e.g. a
// rejected upload from multer's fileFilter) and returns JSON instead of
// Express's default HTML error page, so the API stays consistent for the client.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 400).json({ message: err.message || "Something went wrong." });
});

app.listen(process.env.PORT, (err)=> {
    if(err) {
        console.log("cannot start server");
    }
    else{
        console.log(`server started successfully at ${process.env.PORT}`);

    }

})
