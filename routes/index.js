const express = require('express');
const router = express.Router();

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = 'mongodb://localhost:27017';
const dbName = 'votes';
const collection = 'nominations';


class Nomination {
    constructor(name) {
        this.nominee = name;
        this.votes = 0;
    }
}


async function insert(nomination) {
    try {
        const client = await MongoClient.connect(url);
        console.log("Connected correctly to server");
        const db = client.db(dbName);

        let r = await db.collection(collection).insertOne(nomination);
        assert.equal(1, r.insertedCount);

        client.close();
    } catch(err) {
        return err.stack;
    }
    return 'success';
}


router.get('/', function(req, res, next) {
  res.render('index', { title: 'Ecommerce Team Player Awards', message: '' });
});

router.get('/results', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.post('/nominate', function(req, res, next) {

    // TODO: check existing nomination
    if (req.body.name.length === 0) {
        console.log('body empty');
    } else {
        let nominee = new Nomination(req.body.name);

        insert(nominee).then(value => {
            res.render('index', {title : '', message: value});
        });
    }
});

router.post('/vote', function(req, res, next) {

    res.render('index', { title: 'Express' });
});

module.exports = router;
