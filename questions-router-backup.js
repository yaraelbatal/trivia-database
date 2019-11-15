const express = require('express');
const router = express.Router();
const app = express();
const mc = require("mongodb").MongoClient;
const ObjectId = require('mongodb').ObjectId;
const bodyParser = require('body-parser');

// load 25 questions based on the parameters given
router.get('/', [getDropDownArr, loadQuestions]);

// load a specific question with the qid
router.get("/:qid", loadSpecQuestion);

let catArr = [];  //category array
let difArr = [];  //difficulty array
let queArr = [];  //question array

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());


function getDropDownArr(req, res, next){
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
  next();
}

function loadQuestions(req, res, next){
  res.render('pages/questions', {
    category : catArr,
    difficulty: difArr
  });
  console.log(req.body);

  let cat = req.query.category;  // pulls from query
  let dif = req.query.difficulty;  // pull from query
  //
  // let cat = document.getElementByID('category');  //pull from html
  // let dif = document.getElementByID('difficulty');  //pull from html
  // let submit = document.getElementByID('getQuestion');
  // //
  // document.addEventListener('click', function(){
  //   alert("HELLO");
  // });

  // console.log(`cat is ${cat}`);
  // console.log(`dif is ${dif}`);

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
    if(typeof cat == 'undefined' && typeof dif == 'undefined'){
      db.collection("questions").find({}).toArray(function(err, docs){
        if (err){
          throw err;
        }
        // console.log("found the questions!");
        // console.log(docs);
        queArr = docs.slice();
        if(queArr.length > 25){
          queArr = queArr.slice(0, 25);
        }
        // console.log(catArr);  //working
        // res.render('pages/questions', {
        //   category : catArr,
        //   difficulty: difArr
        //
        // });

        // res.format({
        //   //"text/html": () => {res.status(200).send(createHTML(res.users, req))},
        //   "application/json": () => {res.status(200).json(queArr)}
        // });

        console.log(req.body);
        // TODO: delete after
        next();
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
          //"text/html": () => {res.status(200).send(createHTML(res.users, req))},
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
          //"text/html": () => {res.status(200).send(createHTML(res.users, req))},
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
          //"text/html": () => {res.status(200).send(createHTML(res.users, req))},
          "application/json": () => {res.status(200).json(queArr)}
        });
      });
      // client.close();
    }
  });
  console.log('submitted1');
  console.log(req.body);
}

function loadSpecQuestion(req, res, next){
  let qid = req.params.qid;
  //console.log(typeof qid);


  mc.connect("mongodb://localhost:27017", function(err, client) {
  	if (err) {
  		console.log("Error in connecting to database");
  		console.log(err);
  		return;
  	}
    // selecting the databse
    db = client.db("a4")
    db.collection("questions").find({"_id" : ObjectId(qid)}).toArray(function(err, docs){
      if (err){
        throw err;
      }
      res.format({
        //"text/html": () => {res.status(200).send(createHTML(res.users, req))},
        "application/json": () => {res.status(200).json(docs)}
      });
    });
  })

}

module.exports = router;
