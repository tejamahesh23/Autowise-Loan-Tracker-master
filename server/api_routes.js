var emailHandler = require("./emailing");
var express = require('express');
var router = express.Router();

var auth  = require("./auth.js") ;
var loans = require("./db/loans.crud.js") ;
var users = require("./db/users.crud.js") ;

//----------------------------------------------------------------------------------------------------------------------
// AUTHENTICATION, EMAILS, ETC.
//----------------------------------------------------------------------------------------------------------------------

router.route('/email')
      .post(emailHandler);

//----------------------------------------------------------------------------------------------------------------------
// LOANS
//----------------------------------------------------------------------------------------------------------------------

// Multiple loans
router.route('/loans')
      .put(loans.getAll)
      .post(loans.create, users.affixLoans);
      
// Individual loan
router.route('/loan/:loanID')
      // .get(loans.read)
      .put(loans.update);
      
router.route('/deleteLoan/:loanID')
      .put(loans.delete) ;
      
// Multiple loans under the currently logged-in User
router.route('/loansByUser/')
      .put(loans.loansByUserID);
      
//----------------------------------------------------------------------------------------------------------------------
// USERS
//----------------------------------------------------------------------------------------------------------------------

// > Individual user
router.route('/priv/super-admin/:userID')
      .put(users.makeSuperAdmin, users.update);

router.route('/priv/admin/:userID')
      .put(users.makeAdmin, users.update);

router.route('/priv/customer/:userID')
      .put(users.makeCustomer, users.update);

router.route('/deleteUser/:userID')
      .put(users.delete) ;

router.route('/userinfo/')
      .put(users.userByToken);

// > 'Multiple' users
router.route('/users')
      .put(users.getAll, users.returnUsers) ;

//----------------------------------------------------------------------------------------------------------------------
// Routing parameters
//----------------------------------------------------------------------------------------------------------------------
router.param('loanID', loans.loanByID) ;
router.param('userID', users.userByID) ;
router.param('token', auth.decodeToken);
// router.param('userInfo', function(req, res, next, userInfo) { req.userInfo = userInfo; next(); }) ;

module.exports = router;