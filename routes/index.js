var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	console.log('home');
  res.send('Hello REST API Server');
});

module.exports = router;
