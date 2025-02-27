const express = require("express");
const path = require("path");

const app = express();

app.set("view engine", "ejs");
app.use(express.static('public'));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*"); //Allowing cross-origin Requests to all domains
    res.setHeader(
        "Access-Control-Allow-Methods",
        "OPTIONS, GET, POST, PUT, PATCH, DELETE"
    );
    res.setHeader("Access-Control-Allow-Headers", "Content-Type"); // Enabling the client to make requests with non default data attached.
    next();
});

app.get("/", (req, res) => {
    res.render("test-session-creation");
});

app.get("/inclusion", (req, res) => {
    res.render("session-inclusion");
});

app.listen(8888, (err) => {
    if (err) {
        console.log(err);
    }
    console.log("Test Server Started on PORT 8888");
});

