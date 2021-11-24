'use strict' ;

// Dependencies - installed modules
var should   = require('should') ;
var mongoose = require('mongoose') ;
var request  = require('supertest') ;
var config_loader = require('dotenv');

config_loader.load({path: ".env"});
config_loader.load({path: "../../.env"});

// Dependencies - local files
var Loan      = require('../../server/db/loans.model.js') ;
var express   = require('../../server/express.js') ;

//======================================================================================================================
// TEST GROUP II - FRONT-END LOAN HTTP ROUTING
//======================================================================================================================
describe('TEST GROUP II - FRONT-END LOAN HTTP ROUTING', function () {
  
  // Specify HTTP agent
  var agent ;
  
  // Set timeout to 5 seconds
  this.timeout(5000) ;
  
  // Database loan objects
  var test_loan_id ;
  
  // Testing loan objects that are well-defined
  var test_loan_ok = new Loan({
    buyers_order: {
      purchaser: {
        name:  'Slugcat',
        dl:    'ABCDFGHGHGH',
        dob:   new Date('1923/11/23'),
        address: {
          street: 'Somewhere',
          city:   'Rain World',
          state:  'FL',
          county: 'Orange',
          zip:    '12345',
        },
        phone: {
          cell: '1234567890',
        },
      },
      car_info: {   
        year:   1999,
        make:   'Ford',
        model:  'T',
        type_t: 'Old', 
        color:  'Black & White'
      },
      finances: {
        nada_retail:       1000,
        admin_fees:        1000,
        trade_allowance:   1000,
        trade_difference:  1000,
        total_sale_price:  1000,
        bal_owed_on_trade: 1000,
        total_due:         1000
      }
    }
  });
  
  // Testing loan object that is poorly defined
  var test_loan_bad = new Loan({});
  
  // Specify tokens and hash
  var test_hash = 'gardner-mccune > dave small' ;
  var token_hash_ok ;
  var token_haxxor = 'jo_mamma'
  
  before(function(done) {
    mongoose.connect(process.env.MONGODB_URI, {useMongoClient: true});
    agent = request.agent(express.init()) ;
    
    // Login arguments
    var newUser = {
      name:     'Joe Momma',
      dob:      '1923/11/23',
      dl:       '1234ghjkasdf3',
      username: 'AAAAAAAAAAAAAAAAAAAAAAAA',
      password: 'VVVVVVVVVVVVVVVVVVVVVVVV',
    }
    
    // this is not how it works...
    // token_hash_ok = res.body + ',' + test_hash ;

    // Gimme' a token
    // Append hash to it as well as dictated by the authentication module
    agent.post('/new').send(newUser).expect(200).end(function(err, res) {
      console.log(res.body) ;
      done() ;
    });
  });
  
  // //--------------------------------------------------------------------------------------------------------------------
  // // Test #2.0: Loan is created and saved succesfully -> HTTP response is empty object
  // //--------------------------------------------------------------------------------------------------------------------
  // it('Test #2.0: Loan is created and saved succesfully -> HTTP response is empty object', function(done) {
  //   agent.post('/api/loans/').send({token: token_hash_ok, buyers_order: test_loan_ok.buyers_order}).expect(200)
  //   .end(function(err, res) {
  //     should.not.exist(err) ;
      
  //     should.exist(res) ;
  //     should.exist(res.body) ;
      
  //     done() ;
  //   });
  // });
  
  // //--------------------------------------------------------------------------------------------------------------------
  // // Test #2.1: Loan was created AND uploaded successfully -> HTTP response body is JSON of posted Loan
  // //--------------------------------------------------------------------------------------------------------------------
  // it('Test #2.1: Loan was created AND uploaded successfully -> HTTP response body is JSON of posted Loan', function(done) {
  //   agent.put('/api/loans').send({token: token_hash_ok}).expect(200)
  //   .end(function(err, res) {
  //     should.not.exist(err)
      
  //     should.exist(res) ;
  //     should.exist(res.body) ;
      
  //     var db_loan      = res.body[res.body.length-1] ;
  //     var db_purchaser = db_loan.buyers_order.purchaser ;
  //     var purchaser    = test_loan_ok.buyers_order.purchaser ;
      
  //     test_loan_id = db_loan._id ;
      
  //     // Check that 'RECEIVED' status was assigned
  //     db_loan.status.should.equal('RECEIVED') ;
      
  //     // Check a few select fields
  //     db_purchaser.name.should.equal(purchaser.name) ;
  //     db_purchaser.dl.should.equal(purchaser.dl) ;
      
  //     done() ;
  //   });
  // });
  
  // //--------------------------------------------------------------------------------------------------------------------
  // // Test #2.2: All Loans may be retrieved -> HTTP response body is JSON array of Loans
  // //--------------------------------------------------------------------------------------------------------------------
  // it('Test #2.2: All Loans may be retrieved -> HTTP response body is JSON array of Loans', function(done) {
  //   agent.put('/api/loans').send({token: token_hash_ok}).expect(200)
  //   .end(function(err, res) {
  //     should.not.exist(err)
      
  //     should.exist(res) ;
  //     should.exist(res.body) ;
  //     should.exist(res.body.length) ;
      
  //     done() ;
  //   });
  // });
  
  // //--------------------------------------------------------------------------------------------------------------------
  // // Test #2.3: May update a loan successfully -> HTTP response body is JSON of posted Loan
  // //--------------------------------------------------------------------------------------------------------------------
  // it('Test #2.3: May update a loan successfully -> HTTP response body is JSON of posted Loan', function(done) {
  //   agent.put('/api/loan/' + test_loan_id).send({token: token_hash_ok, status: 'PENDING', buyers_order: test_loan_ok.buyers_order})
  //   .expect(200).end(function(err, res) {
  //     should.not.exist(err) ;
      
  //     should.exist(res) ;
  //     should.exist(res.body) ;
      
  //     res.body.status.should.equal('PENDING') ;
      
  //     done() ;
  //   });
  // });
  
  // //--------------------------------------------------------------------------------------------------------------------
  // // Test #2.5: May delete a Loan -> HTTP response body is JSON deleted Loan
  // //--------------------------------------------------------------------------------------------------------------------
  // it('Test #2.5: May delete a Loan -> HTTP response body is JSON deleted Loan', function(done) {
  //   agent.put('/api/deleteLoan/' + test_loan_id).send({token: token_hash_ok}).expect(200)
  //   .end(function(err, res) {
  //     should.not.exist(err) ;
      
  //     should.exist(res) ;
      
  //     done() ;
  //   });
  // });
  
  // //--------------------------------------------------------------------------------------------------------------------
  // // Test #2.6: Loan is successfully removed from database
  // //--------------------------------------------------------------------------------------------------------------------
  // it('Test #2.6: Loan is successfully removed from database', function(done) {
  //   agent.put('/api/loans').send({token: token_hash_ok}).expect(200)
  //   .end(function(err, res) {
  //     should.not.exist(err)
      
  //     should.exist(res) ;
  //     should.exist(res.body) ;
      
  //     var db_loan = res.body[res.body.length-1] ;
      
  //     // Check that fetched loan is not the original one
  //     db_loan._id.should.not.equal(test_loan_id) ;
      
  //     done() ;
  //   });
  // });
  
  // //--------------------------------------------------------------------------------------------------------------------
  // // Test #2.6: Loan routing fails with illegal token -> HTTP response is empty object
  // //--------------------------------------------------------------------------------------------------------------------
  // it('Test #2.6: Loan routing fails with illegal token -> HTTP response is empty object', function(done) {
  //   agent.put('/api/loan/' + test_loan_id).send({token: token_haxxor}).expect(200)
  //   .end(function(err, res) {
  //     should.not.exist(err) ;
      
  //     should.exist(res) ;
  //     should.exist(res.body) ;
      
  //     // Check that response is a non-existent loan
  //     should.not.exist(res.body.status) ;
      
  //     done() ;
  //   });
  // });

  
});