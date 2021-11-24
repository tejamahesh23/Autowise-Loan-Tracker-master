angular.module('SWEApp').controller(
  'CRUDController', ['$rootScope', '$scope', '$location', '$timeout', '$window', 'Factory',
  function($rootScope, $scope, $location, $timeout, $window, Factory) {
    
    // GLOBALS
    // Essentially, anything that goes into an async (Factory) call
    $rootScope.loans = []; // All loans in the database
    $rootScope.currLoan = {}; // Single loan of a current operation (creating, updating, etc.)
    $rootScope.massLoans = []; // All loans currently selected (checked)
    $rootScope.loanWithNewComments = {}; // Loan with comments used to update the existing loan
    
    $rootScope.user = {} // current user
    $rootScope.loading = true; // shows the loading car animation
    $rootScope.warranty = {}; // Warranty plan placeholder object
    $rootScope.newStatus = null;
    $scope.filtered_loans = {}; // Filtered Loans placeholder object

    // Max's Variable to handle BO edits
    $rootScope.isEditingLoan = false;

    // Buyer's Order placeholder
    $rootScope.bo = {};
    $scope.newBo = {
      insr: {},
      car_info: {},
      purchaser: {},
      copurchaser: {},
      finances: { admin_fees: 489 },
    };

    $scope.init = function() {
      // console.log("MEAN App on it's way!");

      $scope.commentAsAdmin = false;

      // ## Order Filters ~ !them for ascending order
      // not doing much with this rn...
      $scope.reverse = true;
      $scope.reverse_comments = true;

      $scope.newLoan = {};
      $scope.isAdmin = true;

      // Filtering variables
      $scope.looking_for_archived = false;
      $scope.looking_for_selected = false;
      $scope.looking_for_important = false;

      // query + Variable names of above, needed for bug described below
      $scope.filterss = [
        "looking_for_archived",
        "looking_for_selected",
        "looking_for_important",
        "query"
      ];

      Factory.getLoans().then(
        function(res) {

          if (res.data.length && res.data.length != 0)
            $rootScope.loans = res.data;
          else
            console.log("DB is empty ~");

          $timeout(function() {
            $rootScope.loading = false;
          }, 1000);
        }
      );

      Factory.getUserInfo().then(
        function(res) {
          $rootScope.user = res.data;
          
        if (!$rootScope.user)
          window.location.href = "/profile/noAccount";
        else if (!$rootScope.user.isAdmin)
          window.location.href = "/profile/wrongUserType";
      });

      // This fixes bug when a SELECTED loan goes out of sight, 
      // and then comes back unselected
      // Better feature than simply clearing filtered_loans on query change
      $scope.$watchGroup($scope.filterss, function() {
        $rootScope.massLoans.forEach(function(loanID) {
          var checkbox = $("#" + loanID + "-checkbox")[0];

          if (checkbox)
            checkbox.checked = true;
        });
      });

    }

    //------------------------------------------------------------------------------------------------------------------
    // CONVINIENT FUNCTIONS
    //------------------------------------------------------------------------------------------------------------------
    $scope.convert_warranties = function(type) {
      // 'any-year' are drivetrains...
      // LEAVE THE IF!! CLEANER CONSOLE
      if (type)
        return type.toLowerCase().indexOf("any") > -1 ? "Drivetrain" : type;
    }

    // show ALL types of selected loans, reset archived filter and query
    $scope.toggleSelectedFilter = function() {
      $scope.looking_for_selected = !$scope.looking_for_selected;

      if ($scope.looking_for_selected) {
        $scope.query = undefined;
        $scope.looking_for_archived = false;
        $("#archived-filter").prop('checked', false);
      }
    }

    $scope.toggleArchivedFilter = function() {
      $scope.looking_for_archived = !$scope.looking_for_archived;
    }

    $scope.toggleImportantFilter = function() {
      $scope.looking_for_important = !$scope.looking_for_important;
    }

    //------------------------------------------------------------------------------------------------------------------
    // LOAN CRUD FUNCTIONS - SINGLE
    //------------------------------------------------------------------------------------------------------------------

    //------------------------------------------------------------------------------------------------------------------
    // Sets the current buyer's order and loan to a blank template and sets the 'isEditingLoan' property to 'false'
    //------------------------------------------------------------------------------------------------------------------
    $scope.prepareLoanCreate = function() {

      // Assign empty templates to current loan and buyer's order objects
      $rootScope.bo = Object.assign({}, $scope.newBo);
      $rootScope.currLoan = {};

      // Set editing flag to 'false'
      $rootScope.isEditingLoan = false;
    }

    $scope.prepareLoanDates = function(bo) {
      // All dates need to be reformated for correct display
      // Copied from loan models ~
      bo.purchaser.dob = new Date(bo.purchaser.dob);

      if (bo.copurchaser && bo.copurchaser.dob)
        bo.copurchaser.dob = new Date(bo.copurchaser.dob);

      if (bo.car_info.exp_date)
        bo.car_info.exp_date = new Date(bo.car_info.exp_date);

      if (bo.trade_in && bo.trade_in.good_thru)
        bo.trade_in.good_thru = new Date(bo.trade_in.good_thru);

      if (bo.insr && bo.insr.eff_dates)
        bo.insr.eff_dates = new Date(bo.insr.eff_dates);

      return bo;
    }

    //------------------------------------------------------------------------------------------------------------------
    // Assigns the current buyer's order to that of the specified loan and sets the 'isEditingLoan' property to 'true'
    //------------------------------------------------------------------------------------------------------------------
    $scope.prepareLoanEdit = function(loan) {
      // Assign global warranty object
      $rootScope.warranty = loan.warranty ? loan.warranty : {};

      // Assign current loan and buyer's order objects
      $rootScope.currLoan = loan;
      $rootScope.bo = loan.buyers_order;
      $rootScope.bo = $scope.prepareLoanDates($rootScope.bo);
      $rootScope.newStatus = loan.status;

      // Set editing flag to 'true'
      $rootScope.isEditingLoan = true;
    }

    // Steven's CSS/jQuery prowess in Material design
    // Should be in CSS only... oh well
    $scope.onFocusInput = function(number) {
      $("#sudo-select-" + number).css('opacity', '1');
      $("#sudo-select-" + number).css('height', 'auto');
    }

    $scope.onBlurInput = function(number) {
      $("#sudo-select-" + number).css('opacity', '0');
      $("#sudo-select-" + number).css('height', '0');
    }

    // TODO LATERRR: delete this, implement it in the frontend only
    $scope.setCarUsed = function(scopeVar, used) {
      if (scopeVar === 'type') {
        $rootScope.bo.car_info.type_t = used;
      } else {
        // console.log(used);
        $rootScope.bo.car_info.license_plate = used;
      }
      $scope.onBlurInput();
    };

    //------------------------------------------------------------------------------------------------------------------
    // Called from the buyer's order modal
    // Information on the 'bo' and 'currLoan' objects are used to create a new loan in the database
    //------------------------------------------------------------------------------------------------------------------
    $scope.addLoanWithBO = function() {
      if (!$rootScope.currLoan) return;

      var newLoan = $rootScope.currLoan;

      // Assign buyer's order information to loan
      // Copy Purchaser name to Loan name field
      newLoan.buyers_order = $rootScope.bo;
      newLoan.name = newLoan.buyers_order.purchaser.name;

      // Checks if insurance has been specifeid
      // If not, asks the User if they would like to continue
      var insurance = newLoan.buyers_order.insr;
      if (!(insurance.company && insurance.policy_no)) {
        var confirmation = confirm("Insurance company and/or policy number has not been specified. Submit this Loan anyway?");

        if (!confirmation)
          return;
        else
          ;
          // add insurance note here ~
      }

      // Create new loan and upload it to the database
      // On back-end, if a matching user exists with the purchaser information, the user is assigned this loan
      // Else the loan is dangling without an assigned user
      Factory.newLoan(newLoan).then(
        function(response) {
          if (response.data) {

            // Making the loan
            newLoan = response.data;
            newLoan.new = true;

            // Add loan to front-end scope
            $rootScope.loans.push(newLoan);

            // clear form data once done
            $scope.newLoan = {};
            $rootScope.bo = Object.assign({}, $scope.newBo);

            alert("Loan was created successfully!");
            $("#buyersOrderModal").modal('hide');
          }
        },
        function(err) {
          alert("Error submitting. Ensure all required (*) fields are filled.\nA value is invalid if the grey placeholders stay");

          console.log(err);
        }
      );
    }

    //------------------------------------------------------------------------------------------------------------------
    // Called from the buyer's order modal
    // Information on the 'bo' and 'currLoan' objects are used to update a loan in the database
    //------------------------------------------------------------------------------------------------------------------
    $scope.updateLoanWithBO = function() {
      if (!$rootScope.currLoan) return;
      // console.log($rootScope.currLoan);

      // Update loan in the database with updated buyer's order
      // On back-end, the loan may be reassigned to a user if the purchaser information has changed
      // Additionally, the loan may become dangling if there is no longer a user match

      // TODO: ADD NOTE
      Factory.modifyLoan($rootScope.currLoan._id, { buyers_order: $rootScope.bo }).then(
        function(res) {
          alert("Loan was updated successfully!");
          // Close modal
          $("#buyersOrderModal").modal('hide');
        },
        function(err) {
          alert("Error updating loan! Ensure all fields are filled properly");
          console.log(err);
        }
      );
    }

    //------------------------------------------------------------------------------------------------------------------
    // Called from the admin warranty modal
    // Updates the loan with warranty information
    //------------------------------------------------------------------------------------------------------------------
    $scope.resetWarranty = function() {
      $scope.warrantyBase({price: 0});
    }

    $scope.warrantyUpdate = function() {
      $scope.warrantyBase($rootScope.warranty);
    }

    $scope.warrantyBase = function(newWarranty) {
      // ADD NOTE
      Factory.modifyLoan($rootScope.currLoan._id, { warranty: newWarranty }).then(
        function(res) {

          // Assign warranty object to loan on the front-end 
          $rootScope.currLoan.warranty = newWarranty;
          alert("Warranty plan was updated successfully!");
          // AND Close modal
          $("#warrantyPlanAdmin").modal('hide');
        },
        function(err) {
          alert("Error updating warranty plan! Ensure field is filled properly");
          console.log(err);
        }
      );
    }

    //------------------------------------------------------------------------------------------------------------------
    // Removes a single loan of the specified ID
    //------------------------------------------------------------------------------------------------------------------
    $scope.removeLoan = function(loanID, uncofirmedDeletion) {
      // TODO Later:
      // Delete should send things to archieve?
      //        Delete from active DB, Add to 'archieve.json' in server or etc
      if (uncofirmedDeletion) {
        if (confirm("Are you sure you want to delete this loan? Doing so will delete ALL records of it"))
          $scope.removeLoan(loanID, true);
      } else {
        Factory.deleteLoan(loanID).then(
          function(response) {
            // update frontend after DB
            $rootScope.loans.some(function(item, index, loans) {
              if (item._id) {
                if (item._id == loanID) {
                  loans.splice(index, 1);
                  return true;
                }
              }
            });

            // if (displayAlert)
            //   alert("Successfully deleted loan");
          },
          function(err) {
            alert("Error deleting loan. Perhaps it was already deleted");
            console.log(err);
          }
        );
      }
    }

    //------------------------------------------------------------------------------------------------------------------
    // Updates the status of a single loan of the specified ID
    //------------------------------------------------------------------------------------------------------------------
    $scope.changeLoanStatus = function(loanID, newStatus) {
      // ADD NOTE
      Factory.modifyLoan(loanID, { status: newStatus }).then(
        function(response) {
          // update frontend after DB
          $rootScope.loans.some(function(item, index, loans) {
            if (item._id) {
              if (item._id == loanID) {
                loans[index].status = newStatus;
                return true;
              }
            }
          });

          $rootScope.currLoan = {};
        },
        function(err) {
          alert("Error updating loan status");
          console.log(err);
        }
      );
    }

    //------------------------------------------------------------------------------------------------------------------
    // Archives the loan of the specified ID
    //------------------------------------------------------------------------------------------------------------------
    $scope.archiveEnMass = function(loanID) {
      if (confirm("You sure you want to archive the " + $rootScope.massLoans.length + " selected loans?")) {
        $rootScope.massLoans.forEach(
          function(loanID) {
            $scope.changeLoanStatus(loanID, "archived");
          });
        $rootScope.massLoans = [];

        alert("All selected loans have been archived");
      }
    }

    //------------------------------------------------------------------------------------------------------------------
    // LOAN CRUD FUNCTIONS - EN MASSE
    //------------------------------------------------------------------------------------------------------------------
    //------------------------------------------------------------------------------------------------------------------
    // Removal of all selected loans. Called from the modal dialog for mass loan deletion
    //------------------------------------------------------------------------------------------------------------------
    $scope.removeEnMass = function() {
      if (confirm("You sure you want to remove the " + $rootScope.massLoans.length + " selected loans?")) {
        $rootScope.massLoans.forEach(
          function(loanID) {
            $scope.removeLoan(loanID, false);
          });
        $rootScope.massLoans = [];

        alert("All selected loans have been deleted");
      }
    }

    //------------------------------------------------------------------------------------------------------------------
    // Update to the specified status of all selected loans. Called from the modal dialog for mass loan update
    //------------------------------------------------------------------------------------------------------------------
    $scope.updateStatusEnMass = function(newStatus) {
      if (newStatus) {
        $rootScope.massLoans.forEach(
          function(loanID) {
            $scope.changeLoanStatus(loanID, newStatus)
            $scope.clearCheckbox(loanID);
          });

        // Clearing var once done
        $rootScope.massLoans = [];
        alert("All selected loans have been '" + newStatus + "'");
      } else {
        alert("Nothing was changed");
      }
    }

    //------------------------------------------------------------------------------------------------------------------
    // OTHER FUNCTIONS
    //------------------------------------------------------------------------------------------------------------------
    // MARK: CHECK LIST
    $rootScope.updateCheckList = function(loanID, add) {
      if (add) {
        if ($rootScope.massLoans.indexOf(loanID) < 0)
        {
          $rootScope.massLoans.push(loanID);
        }
      } else {
        $rootScope.massLoans.forEach(
          function(value, index, loans) {
            if (value === loanID) {
              loans.splice(index, 1);
            }
          });
      }
    }

    $scope.checkTrigger = function(loanID) {
      var stateUpdate = $("#" + loanID + "-checkbox")[0].checked;

      if (stateUpdate != -1)
        $scope.updateCheckList(loanID, stateUpdate);
    };

    // Clearing frontend checkboxes
    $scope.clearCheckbox = function(loanID) {
      // jQuery again
      var checkbox = ["#", loanID, "-checkbox"].join("");
      $(checkbox).prop('checked', false);
    }

    function addCommentFrontend(loanID, newCommentContent) {
      return $rootScope.loans.some(function(item, index, loans) {
        if (item._id) {
          if (item._id == loanID) {

            var newComment = {
              admin: loans[index].commentAsAdmin,
              writer: {
                id: $rootScope.user._id,
                name: $rootScope.user.name,
              },
              content: newCommentContent,
              newtime: new Date(),
              // time: new Date().toLocaleString('en-US', time_options),
            }

            loans[index].comments.push(newComment);
            $rootScope.loanWithNewComments = loans[index];
            return true;
          }
        }
      });
    }

    $scope.addComment = function(loanID) {
      /*
        The following uses jQuery
        No suitable Angular way found
      */
      // Saving message content, clearing input field
      var wantedInputField = ["#", loanID, "-new-comment"].join("");
      var newCommentContent = $(wantedInputField).val();
      $(wantedInputField).val("");
      // console.log(newCommentContent);

      if (newCommentContent) {
        // update frontend
        if (addCommentFrontend(loanID, newCommentContent)) {
          // and DB
          Factory.modifyLoan(loanID, $rootScope.loanWithNewComments).then(
            function(res) {
              console.log("Returned new loan with updated comments:");
              console.log(res.data);
            });
        }
      }
    }

    $scope.removeComment = function(loanID, comments, nonwanted) {
      // update frontend
      comments.some(function(item, index, array) {
        if (nonwanted.content == item.content && nonwanted.newtime == item.newtime) {
          array.splice(index, 1);
          return true;
        }
      });

      // update DB
      Factory.modifyLoan(loanID, { comments: comments }).then(
        function(response) {
          return;
        },
        function(err) {
          alert("Error deleting comment");
          console.log(err);
        }
      );
    }

    $scope.emailClient = function(loanID, userEmail, clientName, couserName, couserEmail) {

      if (!userEmail) {
        alert("No purchaser email found");
        return;
      }

      var errorMsg = "There was an error sending the email. Please check the logs";

      // Generic message will do for now...
      var bodyMessage = "You have an update on your loan application.";
      var email = {
        id: loanID,
        to: userEmail,
        name: clientName,
        message: bodyMessage,
      };

      Factory.sendEmail(email).then(
        function(response) {
          // this can be changed later to not trigger the alert
          //    and just do sucess messages like Assignments
          if (response.data.error) {
            console.log(response.data.error);
            alert(errorMsg);
          } else {
            alert("Notification email sent to " + userEmail + "!");
          }
        },
        function(error) {
          console.log(error);
          alert(errorMsg);
      });

      // email to copurchaser too...
      if (couserName && couserEmail)
        $scope.emailClient(loanID, couserName, couserEmail, false, false);
    };

  }
]);