require("dotenv").config();

const express = require("express");
const app = express();

const cors = require("cors");
app.use(cors());

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/index.html");
});

app.get("/api/hello", (req, res) => {
    res.json({ greeting: "hello API" });
});

const listener = app.listen(process.env.PORT || 3000, () => {
    console.log(`Listening on port ${listener.address().port}`);
});
