'use strict' ;

// Dependencies - installed modules
var should   = require('should') ;
var mongoose = require('mongoose') ;
var config_loader = require('dotenv');

config_loader.load({path: "../../.env"});
if (!process.env.MONGODB_URI)
  config_loader.load();

// Dependencies - local files
var Loan      = require('../../server/db/loans.model.js') ;
var express   = require('../../server/express.js') ;

//======================================================================================================================
// TEST GROUP I - BACK-END DATABASE CRUD FUNCTIONALITY
//======================================================================================================================
describe('TEST GROUP I - LOAN BACK-END DATABASE CRUD FUNCTIONALITY', function () {
  
  // Specify database connection
  before(function(done) {

    mongoose.connect(process.env.MONGODB_URI, {useMongoClient: true});
    //'mongodb://max_admin2:n$E0yDCyLc07@ds119044.mlab.com:19044/cen-class'
    done() ;
  }) ;
  
  // Set timeout to 5 seconds
  this.timeout(5000) ;
  
  // Database loan object
  var test_db_loan ;
  
  // Testing loan objects that are well-defined
  var test_loan_ok = new Loan({
    buyers_order: {
      purchaser: {
        name:  'Oswald the Lucky Rabbit',
        dl:    'ABC',
        dob:   new Date('1923/11/23'),
        address: {
          street: '108 Somewhere Lane',
          city:   'Disney World',
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
  
  //--------------------------------------------------------------------------------------------------------------------
  // Test #1.0: Loan is created and saved succesfully
  //--------------------------------------------------------------------------------------------------------------------
  it('Test #1.0: Loan is created and saved succesfully', function(done) {
    test_loan_ok.save(function (err) {
      should.not.exist(err) ;
      
      done() ;
    });
  });
  
  //--------------------------------------------------------------------------------------------------------------------
  // Test #1.1: Loan is created AND uploaded successfully (can be fetched from the database)
  //--------------------------------------------------------------------------------------------------------------------
  it('Test #1.1: Loan is created AND uploaded successfully (can be fetched from the database)', function(done) {
    Loan.find({'buyers_order.purchaser.dl': test_loan_ok.buyers_order.purchaser.dl}, function(err, loans) {
      should.not.exist(err) ;
      test_db_loan = loans[0] ;
      
      done() ;
    });
  });
  
  //--------------------------------------------------------------------------------------------------------------------
  // Test #1.2: Loan 'status' field updated to 'RECEIVED' due to unspecified 'status'
  //--------------------------------------------------------------------------------------------------------------------
  it('Test #1.2: Loan \'status\' field updated to \'RECEIVED\' due to unspecified \'status\'', function(done) {
    test_db_loan.status.should.equal('RECEIVED') ;
    
    done() ;
  });
  
  //--------------------------------------------------------------------------------------------------------------------
  // Test #1.3: Other Loan fields match those of uploaded Loan
  //--------------------------------------------------------------------------------------------------------------------
  it('Test #1.3: Other Loan fields match those of uploaded Loan', function(done) {
    var db_purchaser = test_db_loan.buyers_order.purchaser ;
    var purchaser = test_loan_ok.buyers_order.purchaser ;
    
    // Check a few select fields
    db_purchaser.name.should.equal(purchaser.name) ;
    db_purchaser.dl.should.equal(purchaser.dl) ;
    db_purchaser.dob.should.equal(purchaser.dob) ;
    
    done() ;
  });
  
  //--------------------------------------------------------------------------------------------------------------------
  // Test #1.4: Loan can be deleted from the database
  //--------------------------------------------------------------------------------------------------------------------
  it('Test #1.4: Loan can be deleted from the database', function(done) {
    test_db_loan.remove(test_db_loan, function (err) {
      should.not.exist(err) ;
      
      done() ;
    });
  });
  
  //--------------------------------------------------------------------------------------------------------------------
  // Test #1.5: Loan is successfully removed from the database
  //--------------------------------------------------------------------------------------------------------------------
  it('Test #1.5: Loan is successfully removed from the database', function(done) {
    Loan.find({_id: test_db_loan._id}, function(err, loans) {
      should.not.exist(err) ;
      should.not.exist(loans[0]) ;
      
      done() ;
    });
  });
  
  //--------------------------------------------------------------------------------------------------------------------
  // Test #1.6: Poorly-defined Loan cannot be saved in the database
  //--------------------------------------------------------------------------------------------------------------------
  it('Test #1.6: Poorly-defined Loan cannot be saved in the database', function(done) {
    test_loan_bad.save(function (err) {
      should.exist(err) ;
      
      done() ;
    });
  });
});
