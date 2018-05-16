const express = require('express');
const router = express.Router();

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const assert = require('assert');

const url = 'mongodb://localhost:27017';
const dbName = 'votes';
const collection = 'nominations';


class Nomination {
    // TODO: add fingerprint
    constructor(name) {
        this.nominee = name;
        this.createdAt = new Date().toISOString().split('T')[0];
        this.votes = 0;
    }
}


async function nominate(person) {
    try {
        const client = await MongoClient.connect(url);
        console.log("Connected correctly to server");
        const db = client.db(dbName);

        let r = await db.collection(collection).insertOne(person);
        assert.equal(1, r.insertedCount);

        client.close();
    } catch(err) {
        return err.stack;
    }
    return 'Thank you for your nomination.';
}

async function vote(uid) {
    try {
        const client = await MongoClient.connect(url);
        console.log("Connected correctly to server");
        const db = client.db(dbName);

        let r = await db.collection(collection).findOneAndUpdate({ _id : ObjectID(uid)}, {$inc:{"votes":1}});

        client.close();
        return 'Thank you for your vote.';
    } catch(err) {
        return err.stack;
    }
}

async function results(date) {
    try {
        const client = await MongoClient.connect(url);
        console.log("Connected correctly to server");
        const db = client.db(dbName);

        let r = await db.collection(collection).find({'createdAt' : date }).toArray();

        client.close();

        return r;
    } catch(err) {
        return err.stack;
    }
}

router.get('/', function(req, res, next) {

    results(new Date().toISOString().split('T')[0]).then(values => {
        console.log(values);
        res.render('index', { today : values , message: '' });
    });


});

router.get('/results', function(req, res, next) {
    res.render('index', { });
});

router.post('/nominate', function(req, res, next) {

    // TODO: check existing nomination
    if (req.body.name.length === 0) {
        console.log('body empty');
    } else {
        let person = new Nomination(req.body.name);

        nominate(person).then(value => {
            //res.render('index', {message: value});
            res.redirect('/');
        });
    }
});

router.post('/vote', function(req, res, next) {

    // TODO: check fingerprint
    if (req.body.uid.length === 0) {
        console.log('body empty');
    } else {
        let uid = req.body.uid;

        vote(uid).then(value => {
            res.redirect('/');
        });
    }
});

module.exports = router;
