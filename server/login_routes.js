var express = require('express');

var auth = require("./auth.js");

//----------------------------------------------------------------------------------------------------------------------
// LOGIN ROUTING
//======================================================================================================================
var login_routes = express.Router();

function validPath(path) {
  var results = [];

  if (path) {
    var var_array = path.split("/");
    for (var i = 0; i < var_array.length; i++) {
      results.push("../");
    }
  }

  return results.join("");
}

login_routes.login = function(req, res, next) {
  // have these values yes or yes, go default to normal
  // only do it if you have both or neither (that's why XOR, first time i use it out after CDA)

  if (req.problem) {
    var good_path = validPath(req.originalUrl);

    if (req.ejs_msg && req.ejs_class) {
      res.render('login', {
        message: req.ejs_msg,
        type: req.ejs_class,
        path: good_path
      });
    }
  }
  else if (req.no_problem) {
    // console.log("should work!");
    // console.log(req.originalUrl);
    next();
  }
  else {
    res.render('login', {
      message: '',
      type: '',
      path: ''
    });
  }
};

//----------------------------------------------------------------------------------------------------------------------
// Login page routing
//----------------------------------------------------------------------------------------------------------------------
// login_routes.route("/")
  
login_routes.route("/")
  .all(login_routes.login);

module.exports = login_routes;