var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Ecommerce Team Player Awards' });
});

router.get('/results', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.post('/nominate', function(req, res, next) {

    res.render('index', { title: 'Express' });
});

router.post('/vote', function(req, res, next) {

    res.render('index', { title: 'Express' });
});

module.exports = router;
