'use strict'
var main = require('./../bot.js')
var mySQLhandler    = require('./mySQLhandler')
var sessionsHandler = require('./sessionsHandler')


function Preorder (sessionID, callback){
 
  var session = sessionsHandler.CurrentSession(sessionID)
  var valorTotal = session.shoppingCart.quantity * 5000
  sessionsHandler.ShoppingCartTotalPrice(sessionID, valorTotal)
  
  var combo 
  if (session.shoppingCart.combo === "7001"){
    combo = 'Pan Francés\n10 unidades\nEntrega 8:30am-9:30am\n   $5000'
  } 
  if (session.shoppingCart.combo === "7002"){
    combo = 'Pan Rollito\n10 unidades\nEntrega 9:30am-10:30am\n   $5000'
  }
  
  var textMessage = 'Listo '+session.context.name+', esta sería tu orden de compra \n'+
      '\n(recuerda pagar en efectivo, valor del domicilio incluido)\n\n'
  textMessage    += 'Combo '+combo
  textMessage    += '\n     x'+session.shoppingCart.quantity
  textMessage    += '\nValor:  $'+ valorTotal 
  
  main.sendTwoButtonMessage(session.fbid, textMessage, 
                            'CONFIRMAR', 'PRE_ORDER_OK', 
                            'MODIFICAR', 'USER_MAKES_NEW_ORDER')
}


function AskForAddress(sessionID){
  var session = sessionsHandler.CurrentSession(sessionID)
  var textMessage = 'Escribe la dirección donde quieres que entreguemos tu pedido' 
  main.sendTextMessage(session.fbid, textMessage)
}


function AskForPhone(sessionID){
  var session = sessionsHandler.CurrentSession(sessionID)
  var textMessage = 'Escribe tu teléfono de contacto' 
  main.sendTextMessage(session.fbid, textMessage)
}


function ConfirmOrder (sessionID, callback){ 
  var session = sessionsHandler.CurrentSession(sessionID)
  var valortotal = (session.shoppingCart.quantity * 5000)  
  sessionsHandler.ShoppingCartTotalPrice(sessionID, valortotal)
  var combo 
  
  if (session.shoppingCart.combo === "7001"){
    combo = 'Pan Francés\n10 unidades\nEntrega 8:30am-9:30am\n   $5000'
  } 
  if (session.shoppingCart.combo === "7002"){
    combo = 'Pan Rollito\n10 unidades\nEntrega 9:30am-10:30am\n   $5000'
  }
  
  var textMessage = 'Orden de Compra \n'
  textMessage += 'Cliente: '+session.context.name+'\n'
  textMessage += 'Dirección: '+session.context.address+'\n'
  textMessage += 'Teléfono: '+session.context.phone+'\n\n'
  textMessage += 'Combo '+ combo
  textMessage += '\n x'+session.shoppingCart.quantity+'\n'
  textMessage += '\nValor:  $'+ valortotal 
  
  main.sendTwoButtonMessage(session.fbid, textMessage, 
                            'CONFIRMAR', 'ORDER_OK', 
                            'MODIFICAR', 'USER_MAKES_NEW_ORDER')
}


module.exports.Preorder = (sessionID, callback) => Preorder(sessionID, callback)
module.exports.AskForAddress = (sessionID) => AskForAddress(sessionID)
module.exports.AskForPhone = (sessionID) => AskForPhone(sessionID)
module.exports.ConfirmOrder = (sessionID, callback) => ConfirmOrder(sessionID, callback)