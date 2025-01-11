const express = require("express");
const path = require('path');
const bodyParser = require("body-parser");

const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
    pingTimeout: 1000,
    maxHttpBufferSize: 5e6,
    cors: {
        origin: "*", // Replace "*" with client URL for better security
        methods: ["GET", "POST"]
    }
});

const Constants = require("./Constants");
const CreateRoutes = require('./routes/SessionCreation');
const AccessRoutes = require('./routes/SessionAccess');
const SignallingService = require("./Services/SignallingService");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*"); //Allowing cross-origin Requests to all domains
    res.setHeader(
        "Access-Control-Allow-Methods",
        "OPTIONS, GET, POST, PUT, PATCH, DELETE"
    );
    res.setHeader("Access-Control-Allow-Headers", "Content-Type"); // Enabling the client to make requests with non default data attached.
    next();
});

app.set("io", io);
app.set(Constants.SIGNALLING_SERVICE_INSTANCE, new SignallingService(io));

app.get("/", (req, res) => {
    res.render("sample");
});

app.use("/session/create", CreateRoutes);
app.use('/session/access', AccessRoutes);

server.listen(8080, (err) => {
    if (err) {
        console.log(err);
    }
    console.log("Signalling Server Started on PORT 8080");
});