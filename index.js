//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));


//Connecting to local mongodb database
mongoose.connect("mongodb://localhost:27017/local",{useNewUrlParser: true});
//Creating the schema for Student collections
const studentSchema = new mongoose.Schema(
{//Using validators for various fields
  name : String,
  email: String,
  phoneNumber : Number,
  Age : Number,
  isStudent : Boolean,
  highestQualification : String,
  interests :
  [{type: String,
              default: undefined}]
});


//Compiling a model which help us create and read documents from the local mongodb database
const Student = mongoose.model("Student",studentSchema,'Student');


//Create POST request to create route
//Request is in form of Javascript object
//Save the data inside the request to Student collection inside mongodb database
app.post("/create",function(req,res){

const postData = req.body;


//Adding the document to Student collection which is called using Student model
  const student = new Student(postData);
  student.save(function(err)
  {
  if(!err)
  {
    //If the document is saved, print the message as success and document saved
    const response = {message : "Success",data: postData};
    const json_res = JSON.stringify(response,null,'\t').replace(/\\"/g, '"');
    //.replace is used for not escaping double quote characters inside array of strings.
    res.send(json_res);//send the JSON response
  }
  else
  {
    res.send(err);
  }
  });


});

//Create a POST request to update route

app.post("/update",function(req,res){
const given_id = req.body._id;//Getting the id of document
const record = req.body;//duplicate the request
delete record["_id"];//removes the _id field from the request
const fields = Object.keys(record);

const oldfields = Object.keys(studentSchema);

// ["name","email","phoneNumber","Age","isStudent","highestQualification","interests"];
let newfields = fields.filter(x => !oldfields.includes(x));


for(var i = 0; i < fields.length; i++){

 if(oldfields.includes(fields[i]))
 {
   var update = {};
   update[fields[i]] = record[fields[i]];

   Student.findOneAndUpdate({_id: given_id},update,{ runValidators: true }, function (err) {
   if (err) {res.send(err)};
   });

 }
 //Check if this field does not exists and add it to the schema
 else{
  var query = {};
  query[fields[i]] = String;
  studentSchema.add(query);
    //Find the document and update the field
  var update = {};
  update[fields[i]] = record[fields[i]];

  Student.findOneAndUpdate({_id: given_id},update,{ runValidators: true }, function (err) {
  if (err) {res.send(err)};
  });
}
}


//After updating all the fields, send the response
Student.findById(given_id,{_id:0,__v:0},function(err,doc){
  if(err){res.send(err);}
  else{
    const response = {message : "Success",data: doc};
    const json_res = JSON.stringify(response,null,'\t').replace(/\\"/g, '"');
    res.send(json_res);
      }

});


});

//Create a get route
app.route("/get")
//Write a function for get request with a query with _id as key
.get(function(req,res){
  const query = req.query;
  Student.findById(query["_id"],{_id:0,__v:0},function(err,doc){
    if(err){res.send(err);}
    else{
      const record = doc;
      const response = {message : "Success",data: record};
      const json_res = JSON.stringify(response,null,'\t').replace(/\\"/g, '"');;
      res.send(json_res);
    }


  });

});


//Create a DELETE request to delete route
app.delete("/delete",function(req,res){
  const given_id = req.body._id;//Get the _id field from the request body
  //find by id and delete the document
  Student.findByIdAndDelete(given_id,function(err,data){
    if(err){res.send(err);}
    else{
    const response = {message : "Success",data: "Document deleted successfully"};
    const json_res = JSON.stringify(response,null,'\t');
    res.send(json_res);
    }
  });

});

//Start the server on port 3000 : Go to localhost:3000/
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
