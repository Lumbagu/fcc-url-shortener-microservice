require("dotenv").config();

const dns = require("dns");

const express = require("express");
const app = express();

const cors = require("cors");
app.use(cors());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/index.html");
});

const inMemoryURLStorage = [null];

const dnsLookup = (url, timeout, callback) => {
    if (url.startsWith("localhost")) {
        return callback();
    }

    let callbackCalled = false;

    const doCallback = (err) => {
        if (callbackCalled) return;
        callbackCalled = true;
        callback(err);
    };

    setTimeout(() => {
        doCallback(true);
    }, timeout);

    dns.lookup(url, doCallback);
};

app.post("/api/shorturl", (req, res) => {
    if (!req.body.url) {
        return res.json({ error: "Invalid URL" });
    }

    const url = req.body.url.includes("://") ? req.body.url : `http://${req.body.url}`;

    dnsLookup(url.split("://")[1], 100, (err) => {
        if (err) {
            return res.json({ error: "Invalid URL" });
        }

        res.json({
            original_url: req.body.url,
            short_url: inMemoryURLStorage.includes(url)
                ? inMemoryURLStorage.indexOf(url)
                : inMemoryURLStorage.push(url) - 1
        });
    });
});

app.get("/api/shorturl/:short_url?", (req, res) => {
    if (!req.params.short_url) {
        return res.json({ error: "Invalid URL" });
    }

    let short = Number(req.params.short_url);
    if (isNaN(short) || short < 1) {
        return res.json({ error: "Wrong format" });
    }

    let url = inMemoryURLStorage[short];
    if (!url) {
        return res.json({ error: "No short URL found for the given input" });
    }

    res.redirect(url);
});

const listener = app.listen(process.env.PORT || 3000, () => {
    console.log(`Listening on port ${listener.address().port}`);
});
