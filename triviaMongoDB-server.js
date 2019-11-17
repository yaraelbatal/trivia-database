const express = require('express');
const app = express();
const mc = require("mongodb").MongoClient;
const path = require('path');
const ObjectId = require('mongodb').ObjectId;
const bodyParser = require('body-parser');

// app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// let questions = require("./questions-router");
// app.use('/questions', questions);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

let catArr = [];  //category array
let difArr = [];  //difficulty array
let queArr = [];  //question array
let quizArr = []; //quiz array

app.get('/', function(req, res){
  res.render('pages/index');

});

app.get('/triviaMongoDB-server.js', function(req, res){
  console.log("hello");


})
app.get('/getQ', function(req, res){
  // getDropDownArr function
  db.collection("questions").find({}).toArray(function(err, docs){
    if (err){
      throw err;
    }

    for(i in docs){
      //console.log(docs[i].category);
      if(!catArr.includes(docs[i].category)){
        catArr.push(docs[i].category);
      }
      if(!difArr.includes(docs[i].difficulty)){
        difArr.push(docs[i].difficulty);
      }
    }

    catArr.sort();
    difArr.sort();
  });
  res.render('pages/getQ', {
    category : catArr,
    difficulty: difArr
  });
});

app.get('/questions', function(req, res){
  //loadQuestions function
  let cat = req.query.category;  // pulls from query
  let dif = req.query.difficulty;  // pull from query

  mc.connect("mongodb://localhost:27017", function(err, client) {
  	if (err) {
  		console.log("Error in connecting to database");
  		console.log(err);
  		return;
  	}
    // selecting the databse
    db = client.db("a4");

    // if no query is provided, find all documents
    if(typeof cat == 'undefined' && typeof dif == 'undefined'){
      db.collection("questions").find({}).toArray(function(err, docs){
        if (err){
          throw err;
        }
        queArr = docs.slice();
        if(queArr.length > 25){
          queArr = queArr.slice(0, 25);
        }

        //console.log(queArr);
        res.format({
          "text/html": () => {res.status(200).render('pages/questions', {questions:queArr})},
          "application/json": () => {res.status(200).json(queArr)}
        });

        //console.log(req.body);
        // TODO: delete after
        // next();
      });
      // client.close();
    }

    // if only category is provided
    else if(typeof cat != 'undefined' && typeof dif == 'undefined'){
      db.collection("questions").find({'category' : cat}).toArray(function(err, docs){
        if (err){
          throw err;
        }
        // console.log("found the questions!");
        // console.log(docs);
        queArr = docs.slice();
        if(queArr.length > 25){
          queArr = queArr.slice(0, 25);
        }
        res.format({
          "text/html": () => {res.status(200).render('pages/questions', {questions:queArr})},
          "application/json": () => {res.status(200).json(queArr)}
        });
      });
      // client.close();
    }

    // if only difficulty provided
    else if(typeof cat == 'undefined' && typeof dif != 'undefined'){
      db.collection("questions").find({'difficulty' : dif}).toArray(function(err, docs){
        if (err){
          throw err;
        }
        // console.log("found the questions!");
        // console.log(docs);
        queArr = docs.slice();
        if(queArr.length > 25){
          queArr = queArr.slice(0, 25);
        }
        //console.log(queArr.length);
        res.format({
          "text/html": () => {res.status(200).render('pages/questions', {questions:queArr})},
          "application/json": () => {res.status(200).json(queArr)}
        });
      });
      // client.close();
    }

    // if both query provided, use query filter
    else if(cat != '' && dif != ''){
      db.collection("questions").find({'category' : cat, 'difficulty' : dif}).toArray(function(err, docs){
        if (err){
          throw err;
        }
        //console.log("found the questions!");
        //console.log(docs);
        queArr = docs.slice();
        if(queArr.length > 25){
          queArr = queArr.slice(0, 25);
        }
        res.format({
          "application/json": () => {res.status(200).json(queArr)},
          "text/html": () => {res.status(200).render('pages/questions', {questions:queArr})}

        });
      });
      // client.close();
    }
  });
  console.log('submitted1');
  console.log(req.body);

});

app.get('/questions/:qID', function(req, res){
  let qID = req.params.qID;

  mc.connect("mongodb://localhost:27017", function(err, client){
    if (err) {
      console.log("Error in connecting to database");
      console.log(err);
      return;
    }
    // selecting the databse
    db = client.db("a4");
    db.collection("questions").find({"_id" : ObjectId(qID)}).toArray(function(err, docs){
      if (err){
        throw err;
      }
      res.format({
        "text/html": () => {res.status(200).render('pages/singleQ', {questions:docs})},
        "application/json": () => {res.status(200).json(docs)}
      });
    });
  });
});

app.get('/createquiz', function(req, res){
  // load the dropdown options
  db.collection("questions").find({}).toArray(function(err, docs){
    if (err){
      throw err;
    }

    for(i in docs){
      //console.log(docs[i].category);
      if(!catArr.includes(docs[i].category)){
        catArr.push(docs[i].category);
      }
      if(!difArr.includes(docs[i].difficulty)){
        difArr.push(docs[i].difficulty);
      }
    }

    catArr.sort();
    difArr.sort();
  });
  res.status(200).render('pages/createquiz', {category:catArr, difficulty:difArr, quizArray:quizArr, queArray:queArr});
});

// router for getting Get Question in the createquiz page
app.get('/loadQs', function(req, res){
  //loadQuestions function
  let cat = req.query.category;  // pulls from query
  let dif = req.query.difficulty;  // pull from query

  mc.connect("mongodb://localhost:27017", function(err, client) {
  	if (err) {
  		console.log("Error in connecting to database");
  		console.log(err);
  		return;
  	}
    // selecting the databse
    db = client.db("a4");

    // if no query is provided, find all documents
    if(typeof cat == 'undefined' && typeof dif == 'undefined'){
      db.collection("questions").find({}).toArray(function(err, docs){
        if (err){
          throw err;
        }
        queArr = docs.slice();
        if(queArr.length > 25){
          queArr = queArr.slice(0, 25);
        }

        res.status(200).render('pages/createquiz', {category:catArr, difficulty:difArr, quizArray:quizArr, queArray:queArr});
      });
      // client.close();
    }

    // if only category is provided
    else if(typeof cat != 'undefined' && typeof dif == 'undefined'){
      db.collection("questions").find({'category' : cat}).toArray(function(err, docs){
        if (err){
          throw err;
        }
        // console.log("found the questions!");
        // console.log(docs);
        queArr = docs.slice();
        if(queArr.length > 25){
          queArr = queArr.slice(0, 25);
        }
        res.status(200).render('pages/createquiz', {category:catArr, difficulty:difArr, quizArray:quizArr, queArray:queArr});
      });
      // client.close();
    }

    // if only difficulty provided
    else if(typeof cat == 'undefined' && typeof dif != 'undefined'){
      db.collection("questions").find({'difficulty' : dif}).toArray(function(err, docs){
        if (err){
          throw err;
        }
        // console.log("found the questions!");
        // console.log(docs);
        queArr = docs.slice();
        if(queArr.length > 25){
          queArr = queArr.slice(0, 25);
        }
        res.status(200).render('pages/createquiz', {category:catArr, difficulty:difArr, quizArray:quizArr, queArray:queArr});
      });
      // client.close();
    }

    // if both query provided, use query filter
    else if(cat != '' && dif != ''){
      db.collection("questions").find({'category' : cat, 'difficulty' : dif}).toArray(function(err, docs){
        if (err){
          throw err;
        }
        //console.log("found the questions!");
        //console.log(docs);
        queArr = docs.slice();
        if(queArr.length > 25){
          queArr = queArr.slice(0, 25);
        }
        res.status(200).render('pages/createquiz', {category:catArr, difficulty:difArr, quizArray:quizArr, queArray:queArr});
      });
      // client.close();
    }
  });
})










// console.log(app.locals);
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
