angular.module('SWEApp').controller('Permissions', 
  ['$rootScope', '$scope', '$location', '$timeout', 'Factory',
  function($rootScope, $scope, $location, $timeout, Factory) {

    $rootScope.users = [];
    $rootScope.loading = true;
    $rootScope.currentUser = {};

    Factory.getUserInfo().then(
      function(res) {
        $rootScope.this_user = res.data;

        if (!$rootScope.this_user)
          window.location.href = "/profile/noAccount";
        else if (!$rootScope.this_user.isSuperAdmin)
          window.location.href = "/profile/wrongUserType";
    });

    Factory.getAllUsers().then(
      function(res) {
        $rootScope.users = res.data;

        // Formatting dates
        $rootScope.users.forEach(function(item, index, obj) {
          obj[index].dob = new Date(item.dob).toLocaleDateString('es-PA');
        });
      },
      function(err) {
        alert(err);
    });

    $scope.init = function() {
      $scope.query = [];
      $scope.isAdmin = true;
      $scope.visible = "visible";

      $timeout(function() {
        $rootScope.loading = false;
      }, 500);
    }

    // 'prepare' selected use
    $scope.assignCurrentUser = function(user) {
      $rootScope.currentUser = user;
    }

    $scope.removeUser = function(userID) {
      // DB
      Factory.deleteUser(userID).then(
        function(response) {
          // Frontend
          $rootScope.users.some(function(item, index, users) {
            if (item._id) {
              if (item._id == userID) {
                users.splice(index, 1);
                return true;
              }
            }
          });
          
          if (userID == $rootScope.this_user._id)
            window.location.href = "/profile/noAccount";
        },
        function(err) {
          alert("There was a problem deleting this User.");
          console.log(err);
        }
      );
    }

    $scope.makeSuperAdmin = function(userID) {
      Factory.setUserPrivileges('super-admin', userID).then(
        function(response) {
          $rootScope.users.some(function(item, index, users) {
            if (item._id == userID) {
              users[index].isSuperAdmin = true;
              users[index].isAdmin= true;
              console.log(users[index]);
            }
          });
        },
        function(err) {
          alert("Error making user a super admin");
          console.log(err);
        });
    }

    $scope.makeAdmin = function(userID) {
      Factory.setUserPrivileges('admin', userID).then(
        function(response) {
          $rootScope.users.some(function(item, index, users) {
            if (item._id == userID) {
              users[index].isSuperAdmin = false;
              users[index].isAdmin = true;
              console.log(users[index]);
            }
          });
        },
        function(err) {
          alert("Error making user an admin");
          console.log(err);
        });
    }

    $scope.makeCustomer = function(userID) {
      Factory.setUserPrivileges('customer', userID).then(
        function(response) {
          $rootScope.users.some(function(item, index, users) {
            if (item._id == userID) {
              users[index].isSuperAdmin = false;
              users[index].isAdmin = false;
              console.log(users[index]);
            }
          });
        },
        function(err) {
          alert("Error turning into customer");
          console.log(err);
        });
    }
  }
]);