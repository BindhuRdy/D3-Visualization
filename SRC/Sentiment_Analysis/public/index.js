
var express = require('express');
var request = require('request');

var app = express();

app.use(express.static('public'));

app.use('/sentiment', function(req, res) {
	var url = "http://text-processing.com/api/sentiment" + req.url;
	req.pipe(request(url)).pipe(res);
});

app.listen(3000, function () {
	console.log('Example app listening on port 3000!');
});