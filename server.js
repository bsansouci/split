/* jslint node: true */
"use strict";

var fs = require('fs');
var http = require('http');
var https = require('https');

var express = require('express');
var bodyParser = require('body-parser');
var path = require("path");

var config = require("./config");

var app = express();

app.use(express.static(__dirname + '/client/'));
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({extended: true}));

http.createServer(app).listen(config.port, function() {
  console.log("HTTP server running on port", config.port);
});

