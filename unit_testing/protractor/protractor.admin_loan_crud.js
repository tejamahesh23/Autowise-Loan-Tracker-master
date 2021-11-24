
//======================================================================================================================
// TEST GROUP I - ADMINISTRATOR LOAN CRUD
//======================================================================================================================
describe('TEST GROUP I - ADMIN LOAN CRUD: ', function() {
  
  //--------------------------------------------------------------------------------------------------------------------
  // TESTING FUNCTIONS
  //--------------------------------------------------------------------------------------------------------------------
  
  // Before all tests, load the admin hub page and assign 
  beforeAll(function() {
    browser.manage().window().maximize() ;
    
    browser.get('http://localhost:5001/') ;
    
    // Fill out username and password fields
    element(by.model('username')).sendKeys('super') ;
    element(by.model('password')).sendKeys('admin') ;
    
    // Click 'Login' button
    clickIt(element(by.css('.tab-content .btn'))) ;
    
    browser.waitForAngular() ;
  });
  
  //--------------------------------------------------------------------------------------------------------------------
  // HELPER FUNCTIONS
  //--------------------------------------------------------------------------------------------------------------------
  
  // Returns an object containing several loan web elements
  var extractLoanElements = function() {
    var loans = element.all(by.repeater('loan in filtered_loans')) ;
    var loan = loans.first() ;
    
    return {
    
      // Top-level loan elements
      loans: loans,
      loan:  loan,
      
      // Within-loan elements
      loanHeader:     loan.element(by.css('.loanHeader')),
      warrantyBar:    loan.element(by.css('.warranty-bar')),
      buttonStatus:   loan.element(by.id('action-status')),
      buttonEdit:     loan.element(by.id('action-edit')),
      buttonWarranty: loan.element(by.id('action-warranty')),
      buttonEmail:    loan.element(by.id('action-email')),
      
      // Modal elements
      buttonUpdateStatus:   element(by.id('update-status')),
      buttonUpdateBO:       element(by.id('bo-update')),
      buttonUpdateWarranty: element(by.id('update-warranty')),
      statusDropdown:       element(by.id('status-dropdown')),
      nameField:            element(by.id('customer-name')),
      monthsFiled:          element(by.id('warranty-months')),
    } 
  }
  
  // Selects the specified loan status from the dropdown list specified by 'element'
  // One must click the dropdown menu and THEN proceed to click the dropdown item, it seems
  var selectDropdownStatus = function(element, status) {
    clickIt(element) ;
    clickIt(element.element(by.css('option[value=' + status + ']')));
  };
  
  // Uses javascript to click the specified web element
  // Protractor 'click' function is not working correctly...
  var clickIt = function(element) {
    browser.executeScript('arguments[0].click();', element.getWebElement()); 
  }
  
  //--------------------------------------------------------------------------------------------------------------------
  // Test #1.0: Loan status update dialog
  // Only opens the dialog: does not make any changes to the loan's status
  //--------------------------------------------------------------------------------------------------------------------
  it('Test #1.0: Loan status update dialog', function() {
    console.log('Test #1.0: Loan status update dialog') ;
    
    var LE = extractLoanElements() ;
    
    // Expand loan accordion
    clickIt(LE.loanHeader) ;
    browser.driver.sleep(1000) ;
    
    // Open 'change status' modal dialog
    clickIt(LE.buttonStatus) ;
    browser.driver.sleep(1000) ;
    
    // Confirm status
    clickIt(LE.buttonUpdateStatus) ;
    browser.driver.sleep(1000) ;
  });
  
  //--------------------------------------------------------------------------------------------------------------------
  // Test #1.1: Loan buyer's order editing dialog
  //--------------------------------------------------------------------------------------------------------------------
  it('Test #1.1: Loan buyer\'s order editing dialog', function() {
    console.log('Test #1.1: Loan buyer\'s order editing dialog') ;
    
    var LE = extractLoanElements() ;
    
    // Open 'edit buyer's order' modal dialog
    clickIt(LE.buttonEdit) ;
    browser.driver.sleep(1000) ;
    
    // Overwrite name field
    LE.nameField.clear() ;
    LE.nameField.sendKeys('Oswald the Lucky Rabbit') ;
    browser.driver.sleep(1000) ;
    
    // Confirm updated buyer's order
    clickIt(LE.buttonUpdateBO) ;
    browser.driver.sleep(1000) ;
    
    // Confirm alert
    browser.driver.sleep(500) ;
    browser.switchTo().alert().accept() ;
    
    // Verify that name on buyer's order has changed
    // The entire name won't fit on the header
    expect(LE.loanHeader.getText()).toContain('Oswald the Lucky') ;
    browser.driver.sleep(1000) ;
  });
  
  //--------------------------------------------------------------------------------------------------------------------
  // Test #1.2: Loan warranty editing dialog
  //--------------------------------------------------------------------------------------------------------------------
  it('Test #1.2: Loan warranty editing dialog', function() {
    console.log('Test #1.2: Loan warranty editing dialog') ;
    
    var LE = extractLoanElements() ;
    
    // Open 'update warranty' modal dialog
    clickIt(LE.buttonWarranty) ;
    browser.driver.sleep(1000) ;
    
    // Overwrite months field
    LE.monthsFiled.clear() ;
    LE.monthsFiled.sendKeys('48') ;
    browser.driver.sleep(1000) ;
    
    // Confirm updated warranty plan
    clickIt(LE.buttonUpdateWarranty) ;
    browser.driver.sleep(1000) ;
    
    // Confirm alert
    browser.driver.sleep(500) ;
    browser.switchTo().alert().accept() ;
    browser.driver.sleep(1000) ;
  });
});