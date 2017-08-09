'use strict'
var main = require('./../bot.js')
var mySQLhandler = require('./mySQLhandler.js')
var register = []

/////////////////////////////////////////////
// "Remember the 4th of november".
// Handling sessions
/////////////////////////////////////////////

function FindOrCreateSession (fbID, callback){
  
  var sessionId
  var FB_username
  
    // Let's see if we already have a session for the user fbid
  Object.keys(register).forEach(k => {
    if ( register[k].fbid === fbID) {
         // Yep, got it!
      sessionId = k;
      console.log('SessionHandler \tSession found, sessionID = ', sessionId)    
      callback (sessionId);
    }
    }); 
 
  if (!sessionId) {
      // No session found for user fbid, let's create a new one
    sessionId = new Date().toISOString();
    register[sessionId] = {fbid:fbID, context:{},shoppingCart:{},status:'NewSession',score:'NULL'};
/**                           
                           context:      {
                             name:      '',   
                             latitude:   0,
                             longitude: '',
                             zone:       0,
                             address:      '',
                             phone:        '',
                             lastQuestion: '', // phone, adress, location, comboQuantity, undefined
                             },
                           shoppingCart: { 
                             combo : '',
                             quantity: '',
                             totalPrice: ''
                           },
                          status: '', // registering, ordering, assigned, shipping, delivering, delivered
                          score: ''};
   **/ 
    console.log('SessionHandler \tSession not found.  Creating sessionId = ', sessionId) 
    
    mySQLhandler.IsUserInDatabase(fbID, function(result){
      
      if ( Object.keys(result).length === 0){
        console.log('SessionHandler \tUser is not in PedroDatabase');
        register[sessionId].status='NewUser'
        mySQLhandler.GetUserName(fbID, function(username){
          console.log('SessionHandler \tFacebook username found: ', username);
          register[sessionId].context.name      = username;
          
          mySQLhandler.AddNewUserToDB(fbID, username)

          callback (sessionId);
        })
      } else {
        console.log('SessionHandler \tUser is in PedroDatabase', JSON.stringify(result))
        console.log('SessionHandler \tUser Name', result[0].nombre)
        register[sessionId].context.name      = result[0].nombre
        register[sessionId].context.latitude  = result[0].latitud
        register[sessionId].context.longitude = result[0].longitud
        register[sessionId].context.zone      = result[0].zona
        register[sessionId].context.address   = result[0].direccion
        register[sessionId].context.phone     = result[0].telefono

        callback (sessionId);
      }
    });
  }
}


function CurrentSession( sessionId ) {
  //console.log(register[sessionId])
  return register[sessionId]
}

function ModifyLatitude( sessionID, value){ 
  register[sessionID].context.latitude = value 
}

function ModifyLongitude( sessionID, value){ 
  register[sessionID].context.longitude = value 
}

function ModifyZone( sessionID, value){ 
  register[sessionID].context.zone = value 
}

function ModifyAddress( sessionID, value){ 
  register[sessionID].context.address = value 
}

function ModifyPhone( sessionID, value){ 
  register[sessionID].context.phone = value 
}

function ModifyLastQuestion(sessionID, value){
  register[sessionID].context.lastQuestion = value
}



function ModifyStatus(sessionID, value){
  register[sessionID].status = value
}

function ModifyScore(sessionID, value){
  register[sessionID].score = value
}



function ShoppingCartCombo(sessionID, value){
  register[sessionID].shoppingCart.combo = value
  //console.log('sessionHandler ShoppingCartCombo \n', register[sessionID].shoppingcart)
}

function ShoppingCartQuantity(sessionID, value){
  register[sessionID].shoppingCart.quantity = value
  //console.log('sessionHandler ShoppingCartQuantity \n', register[sessionID].shoppingcart)
}

function ShoppingCartTotalPrice(sessionID, value){
  register[sessionID].shoppingCart.totalprice = value
  //console.log('sessionHandler ShoppingCartTotalPrice \n', register[sessionID].shoppingcart)
}




module.exports.FindOrCreateSession    = (fbID,callback)       => FindOrCreateSession( fbID, callback )
module.exports.CurrentSession         = (sessionID, callback) => CurrentSession( sessionID, callback )

module.exports.ModifyLatitude         = (sessionID,value) => ModifyLatitude(sessionID,value)
module.exports.ModifyLongitude        = (sessionID,value) => ModifyLongitude(sessionID,value)
module.exports.ModifyZone             = (sessionID,value) => ModifyZone(sessionID,value)
module.exports.ModifyAddress          = (sessionID,value) => ModifyAddress(sessionID,value)
module.exports.ModifyPhone            = (sessionID,value) => ModifyPhone(sessionID,value)
module.exports.ModifyLastQuestion     = (sessionID,value) => ModifyLastQuestion(sessionID,value)
 
module.exports.ShoppingCartCombo      = (sessionID,value) => ShoppingCartCombo(sessionID,value)
module.exports.ShoppingCartQuantity   = (sessionID,value) => ShoppingCartQuantity(sessionID,value)
module.exports.ShoppingCartTotalPrice = (sessionID,value) => ShoppingCartTotalPrice(sessionID,value)

module.exports.ModifyStatus           = (sessionID,value) => ModifyStatus(sessionID,value)
module.exports.ModifyScore            = (sessionID,value) => ModifyScore(sessionID,value)