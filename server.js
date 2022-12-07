const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const http = require('http').Server(app);
var admin = require('firebase-admin');

const MongoClient = require('mongodb').MongoClient
const config = require('./config/Config');

require('./api/routes')(app);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 7000;
const DATABASE_VERSION = 1;

config.getConfig('MONGO_URI', DATABASE_VERSION).then((uri) => {
    MongoClient.connect(uri, 'emails', async(err, db) => {
        if (err) {
            logger.warn(`Failed to connect to the database. ${err.stack}`);
        }

        app.locals.db = db.db('emails');

        var serviceAccount = await config.getConfig('GOOGLE_SA', DATABASE_VERSION);
        var databaseURL = await config.getConfig('FB_DB', DATABASE_VERSION)

        admin.initializeApp({
            credential: admin.credential.cert(JSON.parse(serviceAccount)),
            databaseURL: databaseURL
        });

        http.listen(PORT, () => {
            console.log(`Node.js app is listening at http://localhost:${PORT}`);
        });
    });
})