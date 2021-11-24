var config_loader = require('dotenv');
config_loader.load();

function startServer() {
  var app = require("./server/app");
  var server = app.start();
}

function waitForHerokuVariables(count) {
  // we need this else the ".env" is worthless
  
  if (process.env.MONGODB_URI)
    startServer();
  else {
    // console.log("loading...", count);
    // Recurses ~1100 times... wow
    config_loader.load();
    waitForHerokuVariables(count+1);
  }
}

waitForHerokuVariables(1);
