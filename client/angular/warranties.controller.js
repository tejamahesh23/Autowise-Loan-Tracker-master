var money_formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  // the default value for minimumFractionDigits depends on the currency
  minimumFractionDigits: 0,
});

function mm_dd_yyyy(string) {
  // mm/dd/YYYY with missing zeros if mm and dd < 10
  return new Date(string).toLocaleDateString('es-PA');
}

// Disclaimer: This view wasn't the most effecient written, but welp it does the job
// Provides raw warranty plan data and functions for querying warranty plans based on user-inputted information
angular.module('SWEApp').controller('Warranties', 
  ['$rootScope', '$scope', '$http', '$location', '$window', 'Factory',
  function($rootScope, $scope, $http, $location, $window, Factory) {
    
    // GLOBALS
    $rootScope.loan = null; // Current loan to have a warranty added
    $rootScope.user = null; // Current logged-in user

    //--------------------------------------------------------------------------------------------------------------------
    // Initialize the controller, declaraing the 'matchedWarranties' and 'query' objects
    //--------------------------------------------------------------------------------------------------------------------
    $scope.init = function() {

      $scope.query = { age: '-1', mileage: 0, make: 'Domestic' };
      $scope.warrantyInfo = "Warranty information will go here";
      $scope.matchedWarranties = [];

      $scope.car_year_convertor = {
        "-1": "Any year",
        "2007": "2007 or newer",
        "2011": "2011 or newer",
      };

      Factory.getUserInfo().then(
        function(res) {
          $rootScope.user = res.data;
          // user = res.data;
        });

      $scope.queryWarrantyPlan();
    }

    // TODO LATERRR:
    // Move this mess to the backend

    // Tabulation of warranty plan prices according to car age, period of warranty plan, and mileage
    var warranties_table = [

      // Any-Year warranties
      { age: -1, type: 'Any-Year', term: { months: 3, miles: 3 }, mileage: { min: -1, max: -1 }, price: 180 },
      { age: -1, type: 'Any-Year', term: { months: 6, miles: 6 }, mileage: { min: -1, max: -1 }, price: 390 },
      { age: -1, type: 'Any-Year', term: { months: 12, miles: 12 }, mileage: { min: -1, max: -1 }, price: 1025 },
      { age: -1, type: 'Any-Year', term: { months: 24, miles: 24 }, mileage: { min: -1, max: -1 }, price: 1350 },
      { age: -1, type: 'Any-Year', term: { months: 36, miles: 36 }, mileage: { min: -1, max: -1 }, price: 1455 },

      // Deluxe warranties (> 2007)
      { age: 2007, type: 'Deluxe', term: { months: 3, miles: 3 }, mileage: { min: 125, max: 150 }, price: 390 },
      { age: 2007, type: 'Deluxe', term: { months: 3, miles: 3 }, mileage: { min: 000, max: 125 }, price: 335 },
      { age: 2007, type: 'Deluxe', term: { months: 6, miles: 6 }, mileage: { min: 125, max: 150 }, price: 710 },
      { age: 2007, type: 'Deluxe', term: { months: 6, miles: 6 }, mileage: { min: 100, max: 125 }, price: 640 },
      { age: 2007, type: 'Deluxe', term: { months: 6, miles: 6 }, mileage: { min: 000, max: 100 }, price: 560 },
      { age: 2007, type: 'Deluxe', term: { months: 12, miles: 12 }, mileage: { min: 125, max: 150 }, price: 1415 },
      { age: 2007, type: 'Deluxe', term: { months: 12, miles: 12 }, mileage: { min: 100, max: 125 }, price: 1360 },
      { age: 2007, type: 'Deluxe', term: { months: 12, miles: 12 }, mileage: { min: 000, max: 100 }, price: 1285 },
      { age: 2007, type: 'Deluxe', term: { months: 24, miles: 24 }, mileage: { min: 125, max: 150 }, price: 1805 },
      { age: 2007, type: 'Deluxe', term: { months: 24, miles: 24 }, mileage: { min: 80, max: 125 }, price: 1755 },
      { age: 2007, type: 'Deluxe', term: { months: 24, miles: 24 }, mileage: { min: 000, max: 80 }, price: 1665 },
      { age: 2007, type: 'Deluxe', term: { months: 36, miles: 36 }, mileage: { min: 125, max: 150 }, price: 2090 },
      { age: 2007, type: 'Deluxe', term: { months: 36, miles: 36 }, mileage: { min: 80, max: 125 }, price: 2030 },
      { age: 2007, type: 'Deluxe', term: { months: 36, miles: 36 }, mileage: { min: 000, max: 80 }, price: 1915 },
      { age: 2007, type: 'Deluxe', term: { months: 48, miles: 48 }, mileage: { min: 80, max: 125 }, price: 2350 },
      { age: 2007, type: 'Deluxe', term: { months: 48, miles: 48 }, mileage: { min: 000, max: 80 }, price: 2220 },

      // Factory-Type warranties (> 2011)
      { age: 2011, type: 'Factory-Type', term: { months: 3, miles: 3 }, mileage: { min: 65, max: 85 }, price: 440 },
      { age: 2011, type: 'Factory-Type', term: { months: 3, miles: 3 }, mileage: { min: 00, max: 65 }, price: 410 },
      { age: 2011, type: 'Factory-Type', term: { months: 6, miles: 6 }, mileage: { min: 65, max: 85 }, price: 695 },
      { age: 2011, type: 'Factory-Type', term: { months: 6, miles: 6 }, mileage: { min: 00, max: 65 }, price: 630 },
      { age: 2011, type: 'Factory-Type', term: { months: 12, miles: 12 }, mileage: { min: 65, max: 85 }, price: 1410 },
      { age: 2011, type: 'Factory-Type', term: { months: 12, miles: 12 }, mileage: { min: 00, max: 65 }, price: 1335 },
      { age: 2011, type: 'Factory-Type', term: { months: 24, miles: 24 }, mileage: { min: 65, max: 85 }, price: 1810 },
      { age: 2011, type: 'Factory-Type', term: { months: 24, miles: 24 }, mileage: { min: 00, max: 65 }, price: 1740 },
      { age: 2011, type: 'Factory-Type', term: { months: 36, miles: 36 }, mileage: { min: 65, max: 85 }, price: 2185 },
      { age: 2011, type: 'Factory-Type', term: { months: 36, miles: 36 }, mileage: { min: 00, max: 65 }, price: 2060 },
      { age: 2011, type: 'Factory-Type', term: { months: 48, miles: 48 }, mileage: { min: 65, max: 85 }, price: 2430 },
      { age: 2011, type: 'Factory-Type', term: { months: 48, miles: 48 }, mileage: { min: 00, max: 65 }, price: 2310 },

      // Factory-Type warranties - Extensive use (> 2011, term >= 4 years or mileage >= 75,000)
      { age: 2011, type: 'Factory-Type', term: { months: 48, miles: 120 }, mileage: { min: 40, max: -1 }, price: { Foreign: 1970, Domestic: 2300 } },
      { age: 2011, type: 'Factory-Type', term: { months: 48, miles: 120 }, mileage: { min: 15, max: 40 }, price: { Foreign: 1840, Domestic: 2070 } },
      { age: 2011, type: 'Factory-Type', term: { months: 48, miles: 120 }, mileage: { min: 00, max: 15 }, price: { Foreign: 1720, Domestic: 1960 } },

      { age: 2011, type: 'Factory-Type', term: { months: 48, miles: 100 }, mileage: { min: 40, max: -1 }, price: { Foreign: 1865, Domestic: 2100 } },
      { age: 2011, type: 'Factory-Type', term: { months: 48, miles: 100 }, mileage: { min: 15, max: 40 }, price: { Foreign: 1760, Domestic: 1940 } },
      { age: 2011, type: 'Factory-Type', term: { months: 48, miles: 100 }, mileage: { min: 00, max: 15 }, price: { Foreign: 1650, Domestic: 1850 } },
      { age: 2011, type: 'Factory-Type', term: { months: 48, miles: 75 }, mileage: { min: 40, max: -1 }, price: { Foreign: 1795, Domestic: 2050 } },
      { age: 2011, type: 'Factory-Type', term: { months: 48, miles: 75 }, mileage: { min: 15, max: 40 }, price: { Foreign: 1695, Domestic: 1855 } },
      { age: 2011, type: 'Factory-Type', term: { months: 48, miles: 75 }, mileage: { min: 00, max: 15 }, price: { Foreign: 1595, Domestic: 1775 } },

      { age: 2011, type: 'Factory-Type', term: { months: 60, miles: 120 }, mileage: { min: 40, max: -1 }, price: { Foreign: 2020, Domestic: 2390 } },
      { age: 2011, type: 'Factory-Type', term: { months: 60, miles: 120 }, mileage: { min: 15, max: 40 }, price: { Foreign: 1930, Domestic: 2170 } },
      { age: 2011, type: 'Factory-Type', term: { months: 60, miles: 120 }, mileage: { min: 00, max: 15 }, price: { Foreign: 1795, Domestic: 2090 } },
      { age: 2011, type: 'Factory-Type', term: { months: 60, miles: 100 }, mileage: { min: 40, max: -1 }, price: { Foreign: 1960, Domestic: 2275 } },
      { age: 2011, type: 'Factory-Type', term: { months: 60, miles: 100 }, mileage: { min: 15, max: 40 }, price: { Foreign: 1850, Domestic: 2010 } },
      { age: 2011, type: 'Factory-Type', term: { months: 60, miles: 100 }, mileage: { min: 00, max: 15 }, price: { Foreign: 1740, Domestic: 1915 } },
      { age: 2011, type: 'Factory-Type', term: { months: 60, miles: 75 }, mileage: { min: 40, max: -1 }, price: { Foreign: 1850, Domestic: 2080 } },
      { age: 2011, type: 'Factory-Type', term: { months: 60, miles: 75 }, mileage: { min: 15, max: 40 }, price: { Foreign: 1740, Domestic: 1930 } },
      { age: 2011, type: 'Factory-Type', term: { months: 60, miles: 75 }, mileage: { min: 00, max: 15 }, price: { Foreign: 1635, Domestic: 1840 } },

      { age: 2011, type: 'Factory-Type', term: { months: 72, miles: 120 }, mileage: { min: 40, max: -1 }, price: { Foreign: 1910, Domestic: 2475 } },
      { age: 2011, type: 'Factory-Type', term: { months: 72, miles: 120 }, mileage: { min: 15, max: 40 }, price: { Foreign: 1800, Domestic: 2230 } },
      { age: 2011, type: 'Factory-Type', term: { months: 72, miles: 120 }, mileage: { min: 00, max: 15 }, price: { Foreign: 1690, Domestic: 2150 } },
      { age: 2011, type: 'Factory-Type', term: { months: 72, miles: 100 }, mileage: { min: 40, max: -1 }, price: { Foreign: 2020, Domestic: 2350 } },
      { age: 2011, type: 'Factory-Type', term: { months: 72, miles: 100 }, mileage: { min: 15, max: 40 }, price: { Foreign: 1900, Domestic: 2090 } },
      { age: 2011, type: 'Factory-Type', term: { months: 72, miles: 100 }, mileage: { min: 00, max: 15 }, price: { Foreign: 1795, Domestic: 1990 } },
      { age: 2011, type: 'Factory-Type', term: { months: 72, miles: 75 }, mileage: { min: 40, max: -1 }, price: { Foreign: 1880, Domestic: 2140 } },
      { age: 2011, type: 'Factory-Type', term: { months: 72, miles: 75 }, mileage: { min: 15, max: 40 }, price: { Foreign: 1770, Domestic: 1990 } },
      { age: 2011, type: 'Factory-Type', term: { months: 72, miles: 75 }, mileage: { min: 00, max: 15 }, price: { Foreign: 1660, Domestic: 1875 } },

      { age: 2011, type: 'Factory-Type', term: { months: 84, miles: 120 }, mileage: { min: 40, max: -1 }, price: { Foreign: 2160, Domestic: 2540 } },
      { age: 2011, type: 'Factory-Type', term: { months: 84, miles: 120 }, mileage: { min: 15, max: 40 }, price: { Foreign: 2040, Domestic: 2280 } },
      { age: 2011, type: 'Factory-Type', term: { months: 84, miles: 120 }, mileage: { min: 00, max: 15 }, price: { Foreign: 1950, Domestic: 2200 } },
      { age: 2011, type: 'Factory-Type', term: { months: 84, miles: 100 }, mileage: { min: 40, max: -1 }, price: { Foreign: 2050, Domestic: 2395 } },
      { age: 2011, type: 'Factory-Type', term: { months: 84, miles: 100 }, mileage: { min: 15, max: 40 }, price: { Foreign: 1925, Domestic: 2110 } },
      { age: 2011, type: 'Factory-Type', term: { months: 84, miles: 100 }, mileage: { min: 00, max: 15 }, price: { Foreign: 1850, Domestic: 2020 } },
      { age: 2011, type: 'Factory-Type', term: { months: 84, miles: 75 }, mileage: { min: 40, max: -1 }, price: { Foreign: 1910, Domestic: 2190 } },
      { age: 2011, type: 'Factory-Type', term: { months: 84, miles: 75 }, mileage: { min: 15, max: 40 }, price: { Foreign: 1800, Domestic: 2010 } },
      { age: 2011, type: 'Factory-Type', term: { months: 84, miles: 75 }, mileage: { min: 00, max: 15 }, price: { Foreign: 1690, Domestic: 1895 } },

      { age: 2011, type: 'Factory-Type', term: { months: 96, miles: 120 }, mileage: { min: 40, max: -1 }, price: { Foreign: 2195, Domestic: 2590 } },
      { age: 2011, type: 'Factory-Type', term: { months: 96, miles: 120 }, mileage: { min: 15, max: 40 }, price: { Foreign: 2090, Domestic: 2340 } },
      { age: 2011, type: 'Factory-Type', term: { months: 96, miles: 120 }, mileage: { min: 00, max: 15 }, price: { Foreign: 2000, Domestic: 2270 } },
      { age: 2011, type: 'Factory-Type', term: { months: 96, miles: 100 }, mileage: { min: 40, max: -1 }, price: { Foreign: 2050, Domestic: 2420 } },
      { age: 2011, type: 'Factory-Type', term: { months: 96, miles: 100 }, mileage: { min: 15, max: 40 }, price: { Foreign: 1945, Domestic: 2140 } },
      { age: 2011, type: 'Factory-Type', term: { months: 96, miles: 100 }, mileage: { min: 00, max: 15 }, price: { Foreign: 1835, Domestic: 2075 } },
      { age: 2011, type: 'Factory-Type', term: { months: 96, miles: 75 }, mileage: { min: 40, max: -1 }, price: { Foreign: 1925, Domestic: 2250 } },
      { age: 2011, type: 'Factory-Type', term: { months: 96, miles: 75 }, mileage: { min: 15, max: 40 }, price: { Foreign: 1830, Domestic: 2035 } },
      { age: 2011, type: 'Factory-Type', term: { months: 96, miles: 75 }, mileage: { min: 00, max: 15 }, price: { Foreign: 1730, Domestic: 1920 } },
    ]

    // TODO LATEEEEERRRR: Turn this into an Angular filter ~
    /* WARRANTY QUERYING -
     A Query is pulled from the client side and matched against warranty plans in the warranty table
     The following steps determine the warranty plan that is returned
     
     1. Car minimum age equal to query minimum age
     2. Mileage in the appropriate range (-1 if no maximum)
     3. If applicable, select price based on the country of origin
    */

    //--------------------------------------------------------------------------------------------------------------------
    // Called on submission of the warranties selection form. Checks the query against all possible warranties and assigns
    // Matching warranties to the 'matchedWarranties' object
    //--------------------------------------------------------------------------------------------------------------------
    $scope.queryWarrantyPlan = function() {
      // console.log("Query age:         " + $scope.query.age);
      // console.log("Query max milegae: " + $scope.query.mileage);
      // console.log("Query make:        " + $scope.query.make);

      // Select possible warranties
      var plans = [];
      var warranties = warranties_table.filter(checkWarrantyAgainstQuery);

      // Assign 'plan' items from warranty length, miles, and price
      warranties.forEach(function(warranty) {
        var plan = { 
          type: warranty.type,
          term: {
            months: warranty.term.months,
            miles: warranty.term.miles,
          } 
        };

        // Refine 'price' field if a country of origin is requried
        if (typeof warranty.price === 'object')
          plan.price = warranty.price[$scope.query.make];
        else
          plan.price = warranty.price;

        plans.push(plan);
      });

      // Assign the compatible plans to an object in the scope
      $scope.matchedWarranties = plans;
    }

    //--------------------------------------------------------------------------------------------------------------------
    // Filter function for warranty querying
    //--------------------------------------------------------------------------------------------------------------------
    function checkWarrantyAgainstQuery(warranty) {
      return (
        $scope.query.age === warranty.age.toString()) 
        && ($scope.query.mileage >= warranty.mileage.min * 1000 
        && ($scope.query.mileage <= warranty.mileage.max * 1000 || warranty.mileage.max < 0)
      );
    }

    $scope.setChosenWarranty = function(warranty) {
      $scope.chosenWarranty = warranty;
    }

    /* WARRANTIES SELECTOR */
    $scope.setWarrantiesYear = function(year) {
      $scope.query.age = year;
      $scope.query.age_text = $scope.car_year_convertor[year];
      $scope.queryWarrantyPlan();
    }

    $scope.setWarrantiesMake = function(make) {
      $scope.query.make = make;
      $scope.queryWarrantyPlan();
    }

    // Should be in CSS only... but welp
    $scope.onFocusInputWarr = function(ind) {
      $("#sudo-select-warr-" + ind).css('opacity', '1');
      $("#sudo-select-warr-" + ind).css('height', 'auto');
    }

    $scope.onBlurInputWarr = function(ind) {
      $("#sudo-select-warr-" + ind).css('opacity', '0');
      $("#sudo-select-warr-" + ind).css('height', '0');
    }
    /* END WARRANTIES SELECTOR */

    //--------------------------------------------------------------------------------------------------------------------
    // Email Autowise that the current user is interested in the currently selected warranty plan
    //--------------------------------------------------------------------------------------------------------------------
    $scope.emailWarrantyInterest = function() {
      var errorMsg = "There was an error sending the email. Please check the logs";
      var warranty = $scope.chosenWarranty;

      // what about the link to the insurance website??
      // ^ Dind't add it. it looks awful anyways
      if (warranty.type == "Any-Year")
        converted_war_type = "Drivetrain";
      else
        converted_war_type = warranty.type;

      var bodyMessage = [
        "Customer " + $rootScope.user.name,
        " (username: " + $rootScope.user.username +
        ", DOB " + mm_dd_yyyy($rootScope.user.dob) + ")",
        "is interested in the following warranty plan:",
        "",
        "<b>Type</b>: " + converted_war_type,
        "<b>Plan length</b>: " + warranty.term.months,
        "<b>Plan mileage</b>: " + warranty.term.miles * 1000,
        "<b>Starting at:</b> $" +  money_formatter.format(warranty.price),
      ].join("<br>");

      // Email object
      var email = {
        type: 'warranty',
        name: $rootScope.user.name,
        message: bodyMessage,
      };

      // Send email to Autowise
      Factory.sendEmail(email).then(
        function(response) {
          if (response.data.error) {
            console.log(response.data.error);
            alert(errorMsg);
          } 
          else {
            alert("Email was sent to Autowise! Please allow up to 3 days for an update on your loan application");

            // Add comment to LOAN signifying that Warranty interest has been submitted
            var newComment = [
              "Customer is interested in the following warranty plan: ",
              converted_war_type, ", ",
              warranty.term.months, " months, ",
              warranty.term.miles * 1000, " miles. ",
              "Starting at ", money_formatter.format(warranty.price), ". "
            ].join('');

            // Add on comment and return to customer hub page
            $http.post(window.location.href, { 
              note: newComment, 
              isAdminNote: false, 
              token: Factory.getToken(),
            })
            .then(function(res) { 
              $window.location.href = '/profile/' + Factory.getToken(); 
            });
          }
        },
      function(error) {
        console.log(error);
        alert(errorMsg);
      });
    };

    
  }
]);