var express = require('express');

var auth = require("./auth.js");
var loans = require('./db/loans.crud.js');
var login_routes = require('./login_routes.js');

//----------------------------------------------------------------------------------------------------------------------
// PROFILE ROUTING
//======================================================================================================================
var profile_routes = express.Router();

//----------------------------------------------------------------------------------------------------------------------
// User (admin and customer) home/hub routing
//----------------------------------------------------------------------------------------------------------------------
profile_routes.route('/:token').all(
  login_routes.login,
  function(req, res, next) {
    // next page routing based on token status and admin
    var token = req.body.token;
    // console.log(token);

    if (token.isAdmin || token.isSuperAdmin)
      res.render("admin", {path: "../"});
    else
      res.render("customer", {path: "../"});
});

//----------------------------------------------------------------------------------------------------------------------
// Admin user permissions routing
//----------------------------------------------------------------------------------------------------------------------
profile_routes.route('/permissions/:token')
  .all(function(req, res) {
    res.render("permissions", {path: "../../"});
});

//----------------------------------------------------------------------------------------------------------------------
// Account view/edit routing
//----------------------------------------------------------------------------------------------------------------------
profile_routes.route('/account/:token').all(function(req, res) {
  res.render("account", {path: "../../"});
});

//----------------------------------------------------------------------------------------------------------------------
// Customer warranty plans routing
//----------------------------------------------------------------------------------------------------------------------
profile_routes.route('/warranties/:token/:loan_id')
  .post(loans.update)
  .all(function(req, res) {
    res.render("warranties", {path: "../../../"});
});

//----------------------------------------------------------------------------------------------------------------------
// Account info routing
//----------------------------------------------------------------------------------------------------------------------
profile_routes.route('/account/:token')
  .all(function(req, res) {
    res.render("account", {path: "../../"});
});

profile_routes.param('token', auth.decodeToken);
profile_routes.param('loan_id', loans.loanByID);

module.exports = profile_routes;