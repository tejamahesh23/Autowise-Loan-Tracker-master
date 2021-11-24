var jwt = require('jsonwebtoken');
var User = require('./db/users.model.js') ;
var secret = "Lean MEAN Client Machine";

module.exports = {

  // tokens: a string-representation of an array. you split by "," to get its actual values

  // User Login Route
  login: function(req, res) {
    User.findOne({ username: req.body.username }).exec(
      function(err, user) {
        if (err) throw err;

        if (!user) {
          res.json({ error: 'Invalid Username and password combination' });
        } 
        else if (!req.body.password) {
          res.json({ error: 'No password provided!' });
        } 
        else {
          var validPassword = user.comparePassword(req.body.password);

          if (validPassword) {
            var user_details = {
              dl: user.dl,
              id: user._id,
              dob: user.dob,
              name: user.name,
              email: user.email,
              isAdmin: user.isAdmin,
              username: user.username,
              md5hash: req.body.md5hash,
              isSuperAdmin: user.isSuperAdmin,
            }

            var token = jwt.sign(user_details, secret, { expiresIn: process.env.MAX_SESSION_TIME });
            res.json(token);
          } 
          else {
            var p = { error: 'Invalid Username and password combination' };
            // console.log(p);
            res.json(p);
          }
        }
    });
  },

  // Returns GUUD token
  decodeToken: function(req, res, next, token_array) {
    // console.log(token_array);

    if (!token_array) {
      req.body.token = "nothing ever";
      next();
    }
    else {
      if (typeof token_array == 'string')
        token_array = token_array.split(",");

      var token = token_array[0];
      var md5hash = token_array[1];

      jwt.verify(token, secret, function(err, decodedToken) {

        if (err) {
          req.problem = true;
          // console.log(err);
          // console.log(token_array, md5hash);
          
          if (err.name == "TokenExpiredError") {
            req.ejs_msg = "Your session expired. Please login again";
            req.ejs_class = "alert bg-warning";
            next();
          }
          else if (token == "badtoken" || token == "wrongUserType") {
            // console.log("GOOD TRY");
            req.ejs_msg = "Pasting links onto other computers/browsers won't work :D";
            req.ejs_class = "alert bg-danger";
            next();
          }
          else if (token == "noAccount") {
            // if the account was deleted and still had valid token
            req.ejs_msg = "Your account has been deleted";
            req.ejs_class = "alert bg-danger";
            next();
          }
          else {
            // console.log(token, err, decodedToken);
            // console.log("INVALID TOKEN!!!");
            req.ejs_msg = "Please login to access your profile";
            req.ejs_class = "alert bg-danger";
            next();
          }

        }
        else {
          // REAL NEXT
          // console.log(decodedToken);
          req.no_problem = true
          req.body.old_token = req.body.token;
          req.body.token = decodedToken;
          next();
        }
      });
    }
  },

  // Auth middleware *mess warning*
  //      Send to login if no token with no message
  //      IF not valid, display you need to login again
  //      If valid, continue to next callback
  authenticate: function(req, res, next) {
    
    var token_array = req.body.token;
    
    if (token_array) {
      // console.log(token_array);
      if (typeof token_array == 'string')
        token_array = token_array.split(",");

      var token = token_array[0];
      var md5hash = token_array[1];

      jwt.verify(token, secret, function(err, decodedToken) {
        if (err || decodedToken.md5hash != md5hash) {
          // console.log("Bad Token");
          // console.log(decodedToken, md5hash);

          // technically don't need these, but leaving for future debugging
          req.problem = true;
          req.ejs_msg = "Your session expired. Please login again";
          req.ejs_class = "alert bg-warning";

          next();
        }
        // REAL next
        else {
          // console.log("GUUUD Token");
          // console.log(decodedToken);
          req.body.old_token = req.body.token;
          req.body.token = decodedToken;
          req.no_problem = true
          next();
        }
      });
    } 
    else {
      // console.log("no token evah", token_array);
      req.problem = true;
      req.ejs_msg = "Please login to access your profile";
      req.ejs_class = 'alert bg-danger';
      next();
    }
  },
}