angular.module('SWEApp').controller('UserAccounts', ['$rootScope', '$scope', '$location', 'Factory',
  function($rootScope, $scope, $location, Factory) {

    // GLOBALS
    $rootScope.user = {}; // Currently logged-in user

    $scope.init = function() {
      // Fetch user information
      Factory.getUserInfo().then(
        function(res) {
          if (res.data) {
            $rootScope.user = res.data;
            $rootScope.isAdmin = $rootScope.user.isAdmin;
            $rootScope.user.dob = new Date(res.data.dob).toLocaleDateString("es-PA");
          }
      });
    }

    $scope.changePasswordSubmit = function(pwd, pw1, pw2) {
      // TODO: Implement this the way login/register is done ~
      if (pwd == null || pw1 == null || pw2 == null) {
        alert("Password cannot be blank!")
      } 
      else if (pw1 == pw2) {
        alert("New password is: '" + pw1 + "'");
        $scope.pwd = null;
        $scope.pw1 = null;
        $scope.pw2 = null;
      } 
      else
        alert("Passwords do not match!")
    }

    $scope.changePasswordSubmit = function(pwd, pw1, pw2) {
      if (pw1 == pw2) {
        alert("New password is: '" + pw1 + "'");
      } else {
        alert("Passwords do not match!")
      }
    }

    $scope.resetForm = function() {
      //$scope.resetme.reset();
      document.getElementById('resetme').reset();
    };
  }
]);