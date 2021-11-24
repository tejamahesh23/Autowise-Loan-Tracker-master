
//======================================================================================================================
// TEST GROUP III - GENERAL NAVIGATION
//======================================================================================================================
describe('TEST GROUP III - GENERAL NAVIGATION: ', function() {
    
  // Before all tests, load the admin hub page
  beforeAll(function() {
    browser.get('http://localhost:5001/') ;
    
    // Fill out username and password fields
    element(by.model('username')).sendKeys('super') ;
    element(by.model('password')).sendKeys('admin') ;
    
    var EC = protractor.ExpectedConditions;
    browser.wait(EC.elementToBeClickable(by.id('button-login')), 5000);
    
    // Click 'Login' button
    element(by.id('button-login')).click() ;
    
    browser.waitForAngular() ;
  });

  //--------------------------------------------------------------------------------------------------------------------
  // HELPER FUNCTIONS
  //--------------------------------------------------------------------------------------------------------------------
  
  // Returns an object containing several navigational web elements
  var extractElements = function() {
    return {
      navMenu:   element(by.id('user-action-toggle')),
      navItems: [
        loans:   element(by.id('nav-loans')),
        account: element(by.id('nav-account')),
        manage:  element(by.id('nav-manage')),
        logout:  element(by.id('nav-logout')),
      ],
    } 
  }
  
  // Selects the specified loan status from the dropdown list specified by 'element'
  // One must click the dropdown menu and THEN proceed to click the dropdown item, it seems
  var selectDropdownStatus = function (element, status) {
    element.click() ;
    element.element(by.css('option[value=' + status + ']')).click();
  };
  
  //--------------------------------------------------------------------------------------------------------------------
  // TESTING FUNCTIONS
  //--------------------------------------------------------------------------------------------------------------------
  
  onPrepare: function() {
    browser.manage().window().setSize(1600, 1000);
  }

  //--------------------------------------------------------------------------------------------------------------------
  // Test #3.0: Select all navigation options
  //--------------------------------------------------------------------------------------------------------------------
  it('Test #3.0: Select all navigation options', function() {
    console.log('Test #3.0: Select all navigation options') ;
    
    var E = extractElements() ;
    
    for (item in E.navItems) {
    
      // Click on nav menu to open up options
      E.navMenu.click() ;
      
      // Click on the corresponding option and load the new page
      item.click() ;
      
      // Verify page title is the destination page
      //expect(LE.loanHeader.getText()).toContain('Oswald the Lucky') ;
    }
  });
});