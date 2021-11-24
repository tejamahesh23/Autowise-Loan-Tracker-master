angular.module('SWEApp').factory('Factory', ['$http', '$window',
  function($http, $window) {
    
    // Authentication Helper methods
    var removeToken = function() {
      $window.localStorage.removeItem('token');
    }
    
    var addToken = function(token) {
      // console.log(token);
      removeToken();
      if (!$window.localStorage.setItem('token', token))
        $window.location.href = '/profile/' + getToken();
    }

    var getToken = function() {
      var token = $window.localStorage.getItem('token');
      if (token)
        if (Object.keys(token).length > 0)
          return [token, $window.fingerprint.md5hash];
    }

    // DO NOT MAKE 'GET'/'DELETE' METHODS THAT HANDLE TOKENS!!!! THEY DON'T WORK!
    var methods = {
      
      //----------------------------------------------------------------------------------------------------------------
      // Emailing
      //----------------------------------------------------------------------------------------------------------------
      sendEmail: function(updates) {
        var args = Object.assign(updates, {token: getToken()});
        return $http.post('/api/email', args);
      },

      //----------------------------------------------------------------------------------------------------------------
      // Users CRUD
      //----------------------------------------------------------------------------------------------------------------
      newUser: function(User) {
        // console.log(User);
        var args = Object.assign(User, {token: getToken(), md5hash: window.fingerprint.md5hash});
        
        return $http.post('/new', args).then(
          function(res) {
            addToken(res.data);
            // For whoever wants to improve the security of this project later on:
            // https://stackoverflow.com/questions/30498646/how-to-send-json-and-parse-it-on-next-html-page-through-url-in-jquery
            // do the messages via encoding .... bye
          },
          function(err, message) {
            alert(message + err + JSON.stringify(err));
        });
      },
      getUsernames: function() {
        return $http.get('/usernames');
      },
      // Security: this needs to change
      getAllUsers: function() {
        var args = {token: getToken()};
        return $http.put('/api/users', args);
      },
      getUserInfo: function() {
        var args = {token: getToken()};
        return $http.put('/api/userinfo/', args);
      },
      setUserPrivileges: function(type, id) {
        var args = {token: getToken()};
        return $http.put('/api/priv/' + type + "/" + id, args);
      },
      deleteUser: function(id) {
        var args = {token: getToken()};
        return $http.put('/api/deleteUser/' + id, args);
      },
      
      //----------------------------------------------------------------------------------------------------------------
      // Loans CRUD
      //----------------------------------------------------------------------------------------------------------------
      newLoan: function(loan) {
        var args = Object.assign(loan,   {token: getToken()});
        return $http.post('/api/loans', args);
      },
      getUserLoans: function() {
        var args = {token: getToken()};
        return $http.put('/api/loansByUser/', args);
      },
      getLoans: function() {
        var args = {token: getToken()};
        return $http.put('/api/loans', args);
      },
      deleteLoan: function(id) {
        var args = {token: getToken()};
        return $http.put('/api/deleteLoan/' + id, args);
      },
      modifyLoan: function(id, updatedLoan) {
        // var args = {token: getToken()};
        var args = Object.assign(updatedLoan, {token: getToken()});
        return $http.put('/api/loan/' + id, args);
      },
      
      //----------------------------------------------------------------------------------------------------------------
      // Authentication
      //----------------------------------------------------------------------------------------------------------------
      addToken: function(token) {
        addToken(token);
      },
      getToken: function() {
        return getToken();
      },
      removeToken: function() {
        removeToken();
      },
      isLoggedIn: function() {
        var token = getToken();
        return $http.post('/', {token});
      },
      login: function(loginData) {
        var args = Object.assign(loginData, {md5hash: window.fingerprint.md5hash});
        return $http.post('/login', args);
      },
      logout: function() {
        if (!removeToken())
          $window.location.href = '/';
      },
    };
    
    return methods;
  }
]);