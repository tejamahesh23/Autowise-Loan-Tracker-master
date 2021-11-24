var mongoose = require('mongoose') ;
mongoose.Promise = global.Promise;
require('mongoose-type-email');

//----------------------------------------------------------------------------------------------------------------------
// LOAN SCHEMA
//======================================================================================================================
// Details a type and status and admin-created comments. Shows static info transcribed from the purchase order. Every
// loan is associated with a particular customer
//----------------------------------------------------------------------------------------------------------------------
var loanSchema = new mongoose.Schema({
  
  // REMINDER: SAVE ALL DATES AS STRINGS!!!
  // except for the comments (not on this file, so don't worry about it)

  //--------------------------------------------------------------------------------------------------------------------
  // User information
  //--------------------------------------------------------------------------------------------------------------------
  // this needs to be a Array
  user_ids:  [String],
  
  //--------------------------------------------------------------------------------------------------------------------
  // App Functionality
  //--------------------------------------------------------------------------------------------------------------------
  // type:         String,   // Loan type
  status:     String,   // Loan status
  comments:   Array,    // List of loan comments
  
  //--------------------------------------------------------------------------------------------------------------------
  // Warranty plan information
  //--------------------------------------------------------------------------------------------------------------------
  warranty: {
    type_t: String,
    price:  Number,
    term :  {months: Number,   miles: Number},
  },
  
  //--------------------------------------------------------------------------------------------------------------------
  // Tracking information
  //--------------------------------------------------------------------------------------------------------------------
  created_at: String,
  updated_at: String,
  created_by: String,

  //--------------------------------------------------------------------------------------------------------------------
  // Buyers Order
  //====================================================================================================================
  // The original "paper copy" of a loan. Majority of fields described here are transcribed from the document
  //--------------------------------------------------------------------------------------------------------------------
  buyers_order: {
    // Purchaser and Co-Purchaser
    purchaser: {
      name:     {type:   String, required: true},
      email:    {type:   mongoose.SchemaTypes.Email, required: false},
      dl:       {type:   String, required: true},
      dob:      {type:   String, required: true},
      dob_extra:{type:   String, },

      // Contact information
      address: {
        street: {type: String, required: true},
        city:   {type: String, required: true},
        state:  {type: String, required: true},
        county: {type: String, required: true},
        zip:    {type: Number, required: true},
      },
    
      phone: {
        home: {type: Number},
        work: {type: Number},
        cell: {type: Number, required: true},
      },
    },
    
    copurchaser: {
      invalid: {type: Boolean},
      name:    {type:   String, /*required: false*/},
      dl:      {type:   String, /*required: false*/},
      dob:     {type:   String, /*required: false*/},
     dob_extra:{type:   String, /*required: false*/},

      // Contact information
      address: {
        street: {type: String, /*required: false*/},
        city:   {type: String, /*required: false*/},
        state:  {type: String, /*required: false*/},
        county: {type: String, /*required: false*/},
        zip:    {type: Number, /*required: false*/},
      },
    },

    // Car information
    car_info: {   
      year:             {type: Number, required: true},
      make:             {type: String, required: true},
      model:            {type: String, required: true},
      
      // 'type' is a reserved word
      // i think it's cuz we already have it..
      type_t:           {type: String, required: true}, 
      color:            {type: String, required: true},
      cyl:              Number,

      serial_no:        String,
      stock_no:         String,
      mileage:          Number,
      salesperson:      String,
      lender:           String,

      tag_no:           String,
      exp_date:         String,
      transfer:         String,
      plate_no:         String,
      // NEW/USED as a STRING
      license_plate:    String,
      // license_plate:    {type: String, required: true},
    },

    // Financing and fees
    finances: {
      nada_retail:         {type: String, required: true},
      admin_fees:          {type: Number, required: true},
      trade_allowance:     {type: Number, required: true},
      trade_difference:    {type: Number, required: true},
      total_sale_price:    {type: Number, required: true},
      sub_total_a:         Number,
      
      sales_tax: {
        is_county:         Boolean,
        percentage:        Number,
      },

      estimated_fees:      Number,
      lemon_law_fee:       Number,
      sub_total_b:         Number,

      bal_owed_on_trade:   {type: Number, required: true},
      total_due:           {type: Number, required: true},
      down_payment:        Number,
      unpaid_due:          Number,
    },

    // Insurance information
    insr: {
      agent:       String,
      company:     String,
      verif_by:    String,
      phone_no:    Number,
      policy_no:   Number,
      eff_dates:   String,
    },

    // Trades information
    trade_in: {
      year:        Number,
      make:        String,
      model:       String,
      type_t:      String,
      color:       String,
      cyl:         String,

      holder:      String,
      mileage:     Number,
      address:     String,
      phone_no:    Number,
      serial_no:   String,
      account_no:  String,
      amount:      Number,
      verif_by:    String,
      qualif_by:   String,
      good_thru:   String,
    },
  }
});

// function yyyy_mm_dd(string) {
//   // CORRECT FORMAT FOR 'date' type input transcition
//   // YYYY-mm-dd
//   return new Date(string).toLocaleDateString('km-KH');
// }

function mm_dd_yyyy(string) {
  // mm/dd/YYYY
  return new Date(string).toLocaleDateString('es-PA');
}

function american_date(string) {
  // mm/dd/YYYY with missing zeros if mm and dd < 10
  return new Date(string).toLocaleDateString();
}

function formatDates(bo) {
  // forming dates to string-friendly searchable formate

  bo.purchaser.dob = mm_dd_yyyy(bo.purchaser.dob);
  bo.purchaser.dob_extra = american_date(bo.purchaser.dob);

  if (bo.copurchaser && bo.copurchaser.dob) {
    bo.copurchaser.dob = mm_dd_yyyy(bo.copurchaser.dob);
    bo.copurchaser.dob_extra = american_date(bo.copurchaser.dob);
  }
  
  if (bo.car_info.exp_date)
    bo.car_info.exp_date = mm_dd_yyyy(bo.car_info.exp_date);

  if (bo.trade_in && bo.trade_in.good_thru)
    bo.trade_in.good_thru = mm_dd_yyyy(bo.trade_in.good_thru);

  if (bo.insr && bo.insr.eff_dates)
    bo.insr.eff_dates = mm_dd_yyyy(bo.insr.eff_dates);

  return bo;
}

//--------------------------------------------------------------------------------------------------------------------
// PRE-PROCESSING: Save
//--------------------------------------------------------------------------------------------------------------------
loanSchema.pre('save', function(next) {
  var currentDate = new Date();
  // these could be used for filtering ~ but too fancy, no time
  this.updated_at = currentDate;

  if (!this.status)
    this.status = "RECEIVED";
  
  if (!this.created_at)
    this.created_at = currentDate;

  // CORRECLTY Format all dates
  this.buyers_order = formatDates(this.buyers_order);

  next();
});

//--------------------------------------------------------------------------------------------------------------------
// RE-PROCESSING: update
//--------------------------------------------------------------------------------------------------------------------
loanSchema.pre('findOneAndUpdate', function(next) {
  // CORRECLTY Format all dates
  // ALL THE TIME!
  
  if (this._update.buyers_order = formatDates(this._update.buyers_order))
    next();
});

// Create loan model from schema
var Loan = mongoose.model('Loans', loanSchema) ;
// this.collection.dropIndexes();

// Export loan model to application
module.exports = Loan ;
