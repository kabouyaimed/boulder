const http = require("http");
const express = require("express");
const MessagingResponse = require("twilio").twiml.MessagingResponse;
var url = "mongodb://localhost:27017/";
var MongoClient = require("mongodb").MongoClient;

const app = express();
// test run on node server start
var testTask = { task: "Task1" };
MongoClient.connect(url, function (err, db) {
  if (err) throw err;
  // db pointing to newdb
  // create 'users' collection in newdb database
  var dbase = db.db("boulder"); //here
  dbase.createCollection("user", function (err, result) {
    if (err) throw err;
    console.log("Collection is created!");
    // close the connection to db when you are done with it
    db.close();
  });
  dbase.collection("user").insertOne(testTask, function (err, res) {
    if (err) throw err;
    console.log("1 document inserted");
    db.close();
  });
});

// real time function listening to sms
app.post("/sms", (req, res) => {
  const twiml = new MessagingResponse();
  // catch the text from the message and set it in a doccument
  var realTask = { task: req.body.Body };
  // start mongo client
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("boulder");
    // add Task to User collection whe message is received
    dbo.collection("user").insertOne(realTask, function(err, res) {
      if (err) throw err;
      console.log("Task captured and added");
      db.close();
    });
  });
  twiml.message("Task stored");
  res.writeHead(200, { "Content-Type": "text/xml" });
  res.end(twiml.toString());
});

http.createServer(app).listen(1337, () => {
  console.log("listening to server");
});
