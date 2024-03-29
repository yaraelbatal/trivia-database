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
let quizFromDB = []; //quizzes from databse

app.get('/', function(req, res){
  res.render('pages/index');

});

app.get('/triviaMongoDB-server.js', function(req, res){
  console.log("hello");


})
app.get('/getQ', function(req, res){
  // getDropDownArr function
  loadDropDown();
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
  // console.log('submitted1');
  // console.log(req.body);

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
  // function for loading drop down menu;
  loadDropDown();
  loadDatabaseQs(req, res);
  res.status(200).render('pages/createquiz', {category:catArr, difficulty:difArr, quizArray:quizArr, queArray:queArr});
})

// router for Add to Quiz in the createquiz page
app.get('/addToQuiz', function(req, res){
  //testing
  // console.log("quizArr at the beginning of addToQuiz")
  // console.log(quizArr);

  loadDropDown();
  loadDatabaseQs(req, res);

  //TODO: go through the queArr, make sure none of the Qs in quizArr are in queArr
  //use 2 for loops to go through it !
  for(i in queArr){
    for(j in quizArr){
      if(queArr[i] == quizArr[j]){
        delete queArr[i];
      }
    }
  }

  // check if there are more than 1 toBeAdded items (i.e. in an array)
  let toBeAdded = req.query.toBeAdded;
  if(!Array.isArray(toBeAdded)){
    toBeAdded = [toBeAdded];
  }
  // console.log("toBeAdded is:")
  // console.log(toBeAdded);

  // TODO: add to quizArr
  for(i in toBeAdded){
    console.log("looping through toBeAdded");
    if(!quizArr.includes(JSON.parse(toBeAdded[i]))){
      quizArr.push(JSON.parse(toBeAdded[i]));
    }
    // mc.connect("mongodb://localhost:27017/", function(err, client) {
    //    if(err) throw err;
    //    db = client.db("a4");
    //    db.collection("questions").findOne({"_id" : ObjectId(toBeAdded[i])}, function(err, result){
    //      if(err) throw err;
    // 		 if(!result){
    // 		     console.log("That doesn't exist");
    // 		 return;
    // 		 }
    //      console.log(result);
    //      quizArr.push(result);
    //    })
    // });
  }

  //testing
  // console.log("quizArr at the end of loadQs")
  // console.log(quizArr);
  res.status(200).render('pages/createquiz', {category:catArr, difficulty:difArr, quizArray:quizArr, queArray:queArr});
})

app.get('/remFromQuiz', function(req, res){
  loadDropDown();
  loadDatabaseQs(req, res);

  let toBeRemoved = req.query.toBeRemoved;
  if(!Array.isArray(toBeRemoved)){
    toBeRemoved = [toBeRemoved];
  }
  // console.log("toBeRemoved is:")
  // console.log(toBeRemoved);

  // TODO: add to quizArr
  for(i in toBeRemoved){
    for(j in quizArr){
      if(JSON.stringify(quizArr[j]) == toBeRemoved[i]){
        delete quizArr[j];
        break;  // jumps to the next question
      }
    }
    // //console.log("looping through toBeRemoved");
    // if(!queArr.includes(toBeRemoved[i])){
    //   queArr.push(JSON.parse(toBeRemoved[i]));
    // }
  }
  // console.log("quizArr at the end of toBeRemoved is: ");
  // console.log(quizArr);
  res.status(200).render('pages/createquiz', {category:catArr, difficulty:difArr, quizArray:quizArr, queArray:queArr});

})

app.get('/savequiz', function(req, res){
  let creator = req.query.creator.toLowerCase();
  // console.log(req.query.tags);
  let tags = req.query.tags.split(" ");

  for(i in tags){
    tags[i] = tags[i].toLowerCase();
  }

  console.log(creator);
  console.log(tags);

  // if fields are not filled out
  if(typeof creator == "undefined" || typeof tags == "undefined"){
    alert("Please fill in the creator and tags before saving");
    return;
  }

  if(quizArr.length == 0){
    alert("Please select some questions to add");
    return;
  }

  //create a database collection for quizes
  let quiz = {
    creator: creator,
    tags: tags,
    questions: quizArr
  }

  //add to quizzes db
  mc.connect("mongodb://localhost:27017", function(err, client) {
  	if (err) {
  		console.log("Error in connecting to database");
  		console.log(err);
  		return;
  	}
    db = client.db('a4');
    db.collection("quizzes").insertOne(quiz, function(err, result){
      if(err) throw err;
      console.log("Successfuly inserted quiz.")
    });

    // load the quizzes from the databse and render it to page
    db.collection("quizzes").find({}).toArray(function(err, docs){
      if (err){
        throw err;
      }
      //is this necessary?
      quizFromDB = docs.slice();
      // if(quizzes.length > 25){
      //   queArr = queArr.slice(0, 25);
      // }
      console.log("quizFromDB is: ");
      console.log(quizFromDB);
      res.status(200).render('pages/quizzes', {quizDB:quizFromDB});
    });
  });
});

app.get('/quizzes', function(req, res){
  let creator = req.query.creator;
  let tags = req.query.tags;


  //converting parameters to lowercase
  if(typeof tags != "undefined"){
    tags = [tags];
  }
  if(typeof creator != "undefined"){
    creator = creator.toLowerCase();
  }
  for(i in tags){
    if(typeof tags[i] != "undefined"){
      tags[i] = tags[i].toLowerCase();
    }
  }

  console.log(creator);
  console.log("type of creator is: ");
  console.log(typeof creator);

  console.log(tags);
  console.log("typeof tags is: ");
  console.log(typeof tags);

  mc.connect("mongodb://localhost:27017", function(err, client) {
  	if (err) {
  		console.log("Error in connecting to database");
  		console.log(err);
  		return;
  	}
    // selecting the databse
    db = client.db("a4");

    // if no query is provided, find all documents
    if(typeof creator == 'undefined' && typeof tags == 'undefined'){
      db.collection("quizzes").find({}).toArray(function(err, docs){
        if (err){
          throw err;
        }
        //console.log(queArr);
        res.format({
          "text/html": () => {res.status(200).render('pages/quizzes', {quizDB:docs})},
          "application/json": () => {res.status(200).json(docs)}
        });
      });
      // client.close();
    }

    // if only creator is provided
    else if(typeof creator != 'undefined' && typeof tags == 'undefined'){
      db.collection("quizzes").find({'creator' : creator}).toArray(function(err, docs){
        if (err){
          throw err;
        }
        console.log("Entered the 2nd condition");
        console.log(docs);
        res.format({
          "text/html": () => {res.status(200).render('pages/quizzes', {quizDB:docs})},
          "application/json": () => {res.status(200).json(docs)}
        });
      });
      // client.close();
    }

    // if only creator provided
    else if(typeof creator == 'undefined' && typeof tags != 'undefined'){
      db.collection("quizzes").find({'creator' : creator}).toArray(function(err, docs){
        if (err){
          throw err;
        }
        //console.log(queArr.length);
        res.format({
          "text/html": () => {res.status(200).render('pages/quizzes', {quizDB:docs})},
          "application/json": () => {res.status(200).json(docs)}
        });
      });
      // client.close();
    }

    // if both query provided, use query filter
    else if(creator != '' && typeof tags != 'undefined'){
      db.collection("questions").find({'creator' : creator, 'tags' : {$in:tags}}).toArray(function(err, docs){
        if (err){
          throw err;
        }
        console.log("Entered the 4th condition");
        console.log(docs);
        res.format({
          "text/html": () => {res.status(200).render('pages/quizzes', {quizDB:docs})},
          "application/json": () => {res.status(200).json(docs)}
        });
      });
      // client.close();
    }
  });

});

app.post('/quizzes', function(req, res){
  let creator = req.query.creator;
  let tags = req.query.tags;
  let questions = req.query.questions;

  if(typeof creator == 'undefined' || typeof tags == 'undefined' || typeof questions == 'undefined'){
    console.log("there is an error in query");
    return;
  }

  //converting parameters to lowercase
  if(typeof tags != "undefined"){
    tags = [tags];
  }
  if(typeof creator != "undefined"){
    creator = creator.toLowerCase();
  }
  for(i in tags){
    if(typeof tags[i] != "undefined"){
      tags[i] = tags[i].toLowerCase();
    }
  }
  if(typeof questions != 'undefined'){
    questions = [questions];
  }

  // add condition to verify the question from Database



  //add the quiz to database
  let quiz = {
    creator: creator,
    tags: tags,
    questions: questions
  }

  //add to quizzes db
  mc.connect("mongodb://localhost:27017", function(err, client) {
  	if (err) {
  		console.log("Error in connecting to database");
  		console.log(err);
  		return;
  	}
    db = client.db('a4');
    db.collection("quizzes").insertOne(quiz, function(err, result){
      if(err) throw err;
      console.log("Successfuly inserted quiz.")
    });
  });

});

app.get("/quiz/:quizID"){
  let quizID = req.params.quizID;

  mc.connect("mongodb://localhost:27017", function(err, client){
    if (err) {
      console.log("Error in connecting to database");
      console.log(err);
      return;
    }
    // selecting the databse
    db = client.db("a4");
    db.collection("quizzes").find({"_id" : ObjectId(qID)}).toArray(function(err, docs){
      if (err){
        throw err;
      }
      res.format({
        "text/html": () => {res.status(200).render('pages/singleQ', {questions:docs})},
        "application/json": () => {res.status(200).json(docs)}
      });
    });
  });
}




function loadDropDown(){
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
  })

    catArr.sort();
    difArr.sort();
}

//function for load database questions, for createquiz page only!
function loadDatabaseQs(req, res){
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

        // res.status(200).render('pages/createquiz', {category:catArr, difficulty:difArr, quizArray:quizArr, queArray:queArr});
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
        // res.status(200).render('pages/createquiz', {category:catArr, difficulty:difArr, quizArray:quizArr, queArray:queArr});
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
        // res.status(200).render('pages/createquiz', {category:catArr, difficulty:difArr, quizArray:quizArr, queArray:queArr});
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
        // res.status(200).render('pages/createquiz', {category:catArr, difficulty:difArr, quizArray:quizArr, queArray:queArr});
      });
      // client.close();
    }
  });
}


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
