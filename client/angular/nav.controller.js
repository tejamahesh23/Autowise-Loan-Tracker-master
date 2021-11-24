angular.module('SWEApp').controller('Navigation', 
  ['$rootScope', '$scope', '$location', '$window', 'Factory',
  function($rootScope, $scope, $location, $window, Factory) {
    
    // Security checks
    var website = window.location.href;
    if (!$scope.login_page) {
      var isNotSececure = website.indexOf("https") < 0;
      var isNotRunningLocally = website.indexOf("localhost") < 0;

      if (isNotSececure && isNotRunningLocally)
        window.location.href = "https" + website.slice(4);
    }

    var badHash = website.indexOf(Factory.getToken());
    var alreadyBad = website.indexOf("badtoken") < 0;
    alreadyBad = alreadyBad | website.indexOf("wrongUserType") < 0;

    if (!Factory.getToken() && !alreadyBad) {
      window.location.href = "/profile/badtoken";
    }

    // GLOBALS ACCROSS ALL VIEWS/CONTROLLERS
    $rootScope.visible = 'visible'; // Display ugly looking angular content once it's loaded
    
    //--------------------------------------------------------------------------------------------------------------------
    // Navigates to the page as specified by the 'key'
    //--------------------------------------------------------------------------------------------------------------------
    $scope.goTo = function(key) {
      var url = '' ;
      var token = Factory.getToken() ;
      
      // Determine URL from specified key
      switch (key) {
        case 'loans'   : url = '/profile/'             + token ; break ;
        case 'account' : url = '/profile/account/'     + token ; break ;
        case 'perm'    : url = '/profile/permissions/' + token ; break ;
        default        : ;
      }
      
      // Assign URL and load destination page
      if ($window.location.pathname != url){
        $window.location.href = url ;
      }
    }
    
    //--------------------------------------------------------------------------------------------------------------------
    // Logs the current user out
    //--------------------------------------------------------------------------------------------------------------------
    $scope.logout = function() {
      Factory.logout();
    }
  }
]);