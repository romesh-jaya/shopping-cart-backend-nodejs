const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const constants = require("./constants");

//Routes
const productsRoutes = require("./routes/products");
const userRoutes = require("./routes/users");

const app = express();

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

mongoose
    .connect(
        process.env.MONGOENDPOINT
    )
    .then(() => {
        console.log("Connected to database!");
    })
    .catch(() => {
        console.log("Connection failed, exiting!");
        process.exit(-1);
    });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PATCH, DELETE, OPTIONS"
    );
    next();
});

app.use("/products", productsRoutes);
app.use("/users", userRoutes);

module.exports = app;
