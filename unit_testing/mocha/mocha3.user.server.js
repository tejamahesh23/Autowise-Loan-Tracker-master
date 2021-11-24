'use strict';

// Dependencies - installed modules
var should   = require('should');
var mongoose = require('mongoose');
var config_loader = require('dotenv');

config_loader.load({path: "../../.env"});
if (!process.env.MONGODB_URI)
  config_loader.load();

// Dependencies - local files
var User      = require('../../server/db/users.model.js');
var express   = require('../../server/express.js');

//======================================================================================================================
// TEST GROUP III - USER BACK-END DATABASE CRUD FUNCTIONALITY
//======================================================================================================================
describe('TEST GROUP III - USER BACK-END DATABASE CRUD FUNCTIONALITY', function () {
  
  // Specify database connection
  before(function(done) {

    mongoose.connect(process.env.MONGODB_URI, {useMongoClient: true});
    //'mongodb://max_admin2:n$E0yDCyLc07@ds119044.mlab.com:19044/cen-class'
    done();
  });
  
  // Set timeout to 5 seconds
  this.timeout(5000);
  
  // Database User object
  var test_db_user;
  
  // Testing User objects that are well-defined
  var test_user_ok = new User({

    username: 'Chicken Nuggets',
    password: '123',
    name: 'Ronald McDonald',
    dl: 'A123123123123123',
    dob: new Date('1923/11/23'),
    email: 'mcNuggets@gmail.com',
    isAdmin: true,
    isSuperAdmin: false

  });
  
  // Testing User object that is poorly defined
  var test_user_bad = new User({});
  
  //--------------------------------------------------------------------------------------------------------------------
  // Test #3.0: User is created and saved succesfully
  //--------------------------------------------------------------------------------------------------------------------
  it('Test #3.0: User is created and saved succesfully', function(done) {
    test_user_ok.save(function (err) {
      should.not.exist(err);
      
      done();
    });
  });
  
  //--------------------------------------------------------------------------------------------------------------------
  // Test #3.1: User is created AND uploaded successfully (can be fetched from the database)
  //--------------------------------------------------------------------------------------------------------------------
  it('Test #3.1: User is created AND uploaded successfully (can be fetched from the database)', function(done) {
    User.find({'username': test_user_ok.username}, function(err, users) {
      should.not.exist(err);
      test_db_user = users[0];
      
      done();
    });
  });
  
  //--------------------------------------------------------------------------------------------------------------------
  // Test #3.2: Other User fields match those of uploaded User
  //--------------------------------------------------------------------------------------------------------------------
  it('Test #3.2: Other User fields match those of uploaded User', function(done) {
    

    // Check a few select fields
    test_user_ok.username.should.equal(test_db_user.username);
    test_user_ok.name.should.equal(test_db_user.name);
    
    done();
  });
  
  //--------------------------------------------------------------------------------------------------------------------
  // Test #3.3: User can be deleted from the database
  //--------------------------------------------------------------------------------------------------------------------
  it('Test #3.3: User can be deleted from the database', function(done) {
    test_db_user.remove(test_db_user, function (err) {
      should.not.exist(err);
      
      done();
    });
  });
  
  //--------------------------------------------------------------------------------------------------------------------
  // Test #3.4: User is successfully removed from the database
  //--------------------------------------------------------------------------------------------------------------------
  it('Test #3.4: User is successfully removed from the database', function(done) {
    User.find({_id: test_db_user._id}, function(err, users) {
      should.not.exist(err);
      should.not.exist(users[0]);
      
      done();
    });
  });
  
  //--------------------------------------------------------------------------------------------------------------------
  // Test #3.5: Poorly-defined User cannot be saved in the database
  //--------------------------------------------------------------------------------------------------------------------
  it('Test #3.5: Poorly-defined User cannot be saved in the database', function(done) {
    test_user_bad.save(function (err) {
      should.exist(err);
      
      done();
    });
  });
});
