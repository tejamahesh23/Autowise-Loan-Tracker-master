var importants = {
  "denied": true,
  "approved": true,
  "received": true,
  "submitted": true,
};

// Show loans that have been selected
angular.module('SWEApp').filter('selected_filter', function() {
  return function(loans, active, selected) {

    if (active) {
      var item = {};
      var size = loans.length;

      // reverse loop, preserves index positions
      for (var index = size-1 ; index > -1 ; index--) {
        item = loans[index];

        if (selected.indexOf(item._id) < 0)
          loans.splice(index, 1);
      }
    }

    return loans;
  }
});

// Show active loans and not archived ones by default 
angular.module('SWEApp').filter('archived_filter', function() {
  return function(loans, active, selected_active) {

    var item = {};
    var size = loans.length;
    var isArchived = false;

    // reverse loop, preserves index positions
    for (var index = size-1 ; index > -1 ; index--) {
      item = loans[index];
      isArchived = item.status.toLowerCase() == 'archived';

      // nifty trick, hehehe
      // I'm liking these Bitwise operators haha
      if ((active ^ isArchived) && !selected_active)
        loans.splice(index, 1);
    }

    return loans;
  }
});

// Shows loans with statuses deemed 'important'
angular.module('SWEApp').filter('important_filter', function() {
  return function(loans, active) {

    if (active) {
      var size = loans.length;

      // reverse loop, preserves index positions
      for (var index = size-1 ; index > -1 ; index--) {
        item = loans[index];
        if (!importants[item.status.toLowerCase()]) {
          loans.splice(index, 1);
        }
      }
    }

    return loans;
  }
});

// TODO LATEEERR
// angular.module('SWEApp').filter('date_filter', function() {
//   return function(loans, active, start, end, created) {
// 
//     // if (active) {
//     //   var item = {};
//     //   var size = loans.length;
// 
//     //   // reverse loop, preserves index positions
//     //   for (var index = size-1 ; index > -1 ; index--) {
//     //     item = loans[index];
// 
//     //     // do the thing here ~
//     //     // if (item.status.toLowerCase() != 'archived') {
//     //     //   loans.splice(index, 1);
//     //     // }
//     //   }
//     // }
// 
//     return loans;
//   }
// });