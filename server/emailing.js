var atob = require('atob');
var nodemailer = require('nodemailer');

var app_link = function(text) {
  return [
    "<a href='", 
    process.env.BASE_URL, 
    "' target='_blank'>" + text + "</a>."
  ].join("");
}

var format_email_html = function (req) {
  // Variables to be returned later
  var to;
  var subject;
  var message;
  
  // Email prepartion based on type
  if (req.type == "warranty") {
    to = process.env.WARRANTIES_DESTINATION;

    subject = "NEW Warranty interest from " + req.name ;
    
    message = [
      // "* This is an automatically generated message *",
      // "",
      req.message
    ];
      
  } 
  else {
    to = req.to;
    subject = "Autowise Cars: Your loan application has been updated";
    
    // Create and insert a link to the user's loan inside the message body
    var verbatim_link = app_link('here');
    var clickable_link = app_link(process.env.BASE_URL);
    
    message = [
      "",
      "Hi " + req.name + "!",
      "",
      req.message,
      "You can check your loan application and its comment by logging in to our website " + clickable_link,
      "",
      "If that doesn't work, please copy and paste the following into your browser:",
      verbatim_link,
      "",
      "",
      "Sincerely,",
      "",
      "<b>Autowise Buying Service, Inc</b>"
    ];
  }
  
  // Return object containing email subject and message array joined into a string on line-breaks
  return {subject: subject, message: message.join("<br>"), to}
}


module.exports = function (req, res) {
  
  // Get email info object
  var email_info = format_email_html(req.body) ;
  // console.log(email_info);
  // console.log(req.body);

  // Basic Email Settings
  var mailOptions = {
    // from: process.env.GMAIL_USERNAME,
    from: process.env.YAHOO_USERNAME,
    subject: email_info.subject,
    generateTextFromHTML: true,
    html: email_info.message,
    to: email_info.to,
  };

  var transporter = nodemailer.createTransport({
    service: "Yahoo",
    auth: {
      // Yahoo instructions =>
      //   Account Security => Two-step => New App => Other App
      //   Maybe also: Allow less-secure apps
      user: process.env.YAHOO_USERNAME,
      pass: process.env.YAHOO_PASSWORD,
    }
    // Gmail Instructions: Get a Gmail API key, adjust valid urls
    // clientId: process.env.CLIENT_ID,
    // auth: {
    //   user: process.env.GMAIL_USERNAME,
    //   pass: process.env.GMAIL_PASSWORD,
    // }
  });

  // Code taken from either StackOverflow or NodeMailer documentation ~
  // Token generation/retrival
  transporter.set('oauth2_provision_cb', function(user, renew, callback) {
    var accessToken = userTokens[user];
    if (!accessToken)
      return callback(new Error('Unknown user'));
    else
      return callback(null, accessToken);
  });

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      // console.log(error);
      res.json({error});
    } else {
      // console.log('Message sent: ' + info.response);
      res.json({result: info.response});
    }
  });

};