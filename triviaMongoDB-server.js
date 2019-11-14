const express = require('express');
const app = express();
const mc = require("mongodb").MongoClient;

app.set('view engine', 'pug');

let questions = require("./questions-router");
app.use('/questions', questions);

app.get('/', function(req, res){
  res.render('pages/index');
});

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

});
