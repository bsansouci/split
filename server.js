/* jslint node: true */
"use strict";

var fs = require('fs');
var http = require('http');
var https = require('https');

var express = require('express');
var bodyParser = require('body-parser');
var path = require("path");
var app = express();

app.use(express.static(__dirname + '/client/'));
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParse.urlencoded({extended: true}));

http.createServer(app).listen(80, function() {
  console.log("HTTP server running on port", 80);
});

//var secure = express();
//secure.use(express.static(__dirname + '/client/'));
//secure.use(bodyParser.json());       // to support JSON-encoded bodies
//secure.use(bodyParser.urlencoded({extended: true}));

//secure.post("/", function(req, res, next){
//  res.sendFile("index.html", { root: path.join(__dirname, 'client') });
//});

//var privateKey  = fs.readFileSync(__dirname + '/ssl/server.key', 'utf8');
//var certificate = fs.readFileSync(__dirname + '/ssl/server.crt', 'utf8');

//var credentials = {
//  key: privateKey,
// cert: certificate
//};

//https.createServer(credentials, secure).listen(443, function() {
//  console.log("HTTPS server running on port", 443);
//});
