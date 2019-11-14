const express = require('express');
const app = express();
const mc = require("mongodb").MongoClient;

let questions = require("./questions-router");
app.use('/questions', questions);

//Connect to database
mc.connect("mongodb://localhost:27017", function(err, client) {
	if (err) {
		console.log("Error in connecting to database");
		console.log(err);
		return;
	}
  // select the questions database
  db = client.db("a4");
  app.listen(3000);
	console.log("Server listening on port 3000");
}
