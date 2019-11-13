const express = require('express');
const router = express.Router();
const mc = require("mongodb").MongoClient;

// load 25 questions based on the parameters given
router.get('/', loadQuestions);

// load a specific question with the qid
router.get("/:qid", loadSpecQuestion);



function loadQuestions(req, res, next){
  // create an question array
  let queArr = [];

  let cat = req.query.category;
  let dif = req.query.difficulty;

  // search the database to find fitting questions
  //  Connect to database
  mc.connect("mongodb://localhost:27017", function(err, client) {
  	if (err) {
  		console.log("Error in connecting to database");
  		console.log(err);
  		return;
  	}
    // selecting the databse
    db = client.db("a4")
    // if no query is provided, find all documents
    if(cat == '' && dif == ''){
      db.collection("questions").find({}).toArray(function(err, docs)){
        if (err){
          throw err;
        }
        console.log("found the questions!");
        console.log(docs);
        queArr = docs;
      }
      client.close();
    }

    // if only category is provided
    else if(cat != '' && dif == ''){
      db.collection("questions").find({'category' : cat}).toArray(function(err, docs)){
        if (err){
          throw err;
        }
        console.log("found the questions!");
        console.log(docs);
        queArr = docs;
      }
      client.close();
    }

    // if only difficulty is provided
    else if(cat != '' && dif != ''){
      db.collection("questions").find({'category' : cat, 'difficulty' : dif}).toArray(function(err, docs)){
        if (err){
          throw err;
        }
        console.log("found the questions!");
        console.log(docs);
        queArr = docs;
      }
      client.close();
    }

    // if both query provided, use query filter
    else if(cat == '' && dif != ''){
      db.collection("questions").find({'difficulty' : dif}).toArray(function(err, docs)){
        if (err){
          throw err;
        }
        console.log("found the questions!");
        console.log(docs);
        queArr = docs;
      }
      client.close();
    }

  //need to change the response object, but the format is here.
  res.format({
    "text/html": () => {res.status(200).send(createHTML(res.users, req))},
    "application/json": () => {res.status(200).json(res.users)}
  });
  next();
}

function loadSpecQuestion(req, res, next){


  //need to change the response object, but the format is here.
  res.format({
		"text/html": () => {res.status(200).send(createHTML(res.users, req))},
		"application/json": () => {res.status(200).json(res.users)}
	});
	next();
}
