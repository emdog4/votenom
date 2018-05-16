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
        this.fingerprints = [];
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
        console.log(err.stack);
    }
}

async function vote(uid) {
    try {
        const client = await MongoClient.connect(url);
        console.log("Connected correctly to server");
        const db = client.db(dbName);

        await db.collection(collection).findOneAndUpdate({ _id : ObjectID(uid)}, {$inc:{"votes":1}});

        client.close();
    } catch(err) {
        console.log(err.stack);
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

router.get('/message', function(req, res, next) {

    if (req.query.m) {
       res.locals.message = req.query.m;
    }
    res.redirect('/');
});

router.get('/', function(req, res) {

    let msg = req.session.message || '';
    req.session.message = null;

    results(new Date().toISOString().split('T')[0]).then(values => {
        res.render('index', { today : values , message: msg });
    });
});

router.get('/results', function(req, res) {
    res.render('index', { });
});

router.post('/nominate', function(req, res) {

    // TODO: check existing nomination
    if (req.body.name.length === 0) {
        console.log('body empty');
    } else {
        let person = new Nomination(req.body.name);

        nominate(person).then(value => {
            req.session.message = 'Thank you for your nomination today. Please be sure to vote.';
            res.redirect('/');
        });
    }
});

router.post('/vote', function(req, res) {

    if(!req.cookies['fingerprint']) {

        if (req.body.uid.length === 0) {
            console.log('body empty');
        } else {
            let uid = req.body.uid;

            vote(uid).then(value => {

                var tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(0,0,0,0);

                res.cookie('fingerprint', '1', { expires : tomorrow});

                req.session.message = 'Thank you for voting today.';
                res.redirect('/');
            });
        }
    } else {
        req.session.message = 'Oops, it looks like you have already voted today.';
        res.redirect('/');
    }

});

module.exports = router;
