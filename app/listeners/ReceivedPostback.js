'use strict'
var main            = require('./../bot.js')
var coverage        = require('./../handlers/coverage.js')
var mySQLhandler    = require('./../handlers/mySQLhandler')
var order           = require('./../handlers/order.js')
var sessionsHandler = require('./../handlers/sessionsHandler.js')
var help            = require('./../handlers/help.js')

function receivedPostback(event) {
  var senderID = event.sender.id;
  
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;
  var payload = event.postback.payload;

  console.log("Received postback for user %d and page %d with payload '%s' " + 
    "at %d", senderID, recipientID, payload, timeOfPostback);

  var sessionID = sessionsHandler.FindOrCreateSession(senderID, function(sessionID){   
    var session = sessionsHandler.CurrentSession(sessionID) 
    console.log('ReceivedPostback \t payload = ', payload)
    switch(payload){     
        
      case 'GET_STARTED_PAYLOAD':
        console.log('ReceivedPostback \t payload = ', payload)
                    
        var text = 'Hola '+session.context.name+'!\n'
        text += 'Soy Pedro, tu tendero digital. Es un placer conocerte. '
        text += 'Puedo llevar pan recién horneado a tu oficina'
        
        main.sendTextMessage(senderID,  text)
        setTimeout(function(){
          var text1 = 'Primero necesito verificar si '
          text1 += 'estás en la zona de cobertura. Comparte tu ubicación para continuar'
          main.GivemeYourLocation(senderID, text1)}
                   , 300)
        break;

      case 'USER_MAKES_NEW_ORDER':
        if(session.context.zone>0){
          sessionsHandler.ModifyStatus(sessionID, 'NewOrder')
          mySQLhandler.AskForCombosInZone(session.context.zone, function(results){
            main.ChooseYourCombo(senderID, results);
          })
        }else{
          main.sendTextMessage(senderID, 'u__u\nLo sentimos, no hay un Horno de Pedro cerca.'+
                                         'Puedes revisar en nuestra página nuestras zonas de cobertura\n')
        }
        break;

      case 'USER_LOCATION':
        mySQLhandler.AskForCombosInZone();
        break;
        
      case 'ACCOUNT_CHECK_COVERAGE':
        var text = 'Comparte tu ubicacion para verificar si estas dentro de la zona de cobertura'
        main.GivemeYourLocation(senderID, text);
        break;

      case 'ACCOUNT_CHECK_ADDRESS':
        sessionsHandler.ModifyLastQuestion(sessionID, "Account_Check_Address")
        textMessage = 'Esta es tu direccion actual:\n'+session.context.address
        main.sendTwoButtonMessage(session.fbid, textMessage, 
                                  'CONFIRMAR', 'ACCOUNT_ADDRESS_OK', 
                                  'MODIFICAR', 'MODIFY_OLD_ADDRESS')  
        break;
        
      case  'ACCOUNT_CHECK_TELEPHONE':
        sessionsHandler.ModifyLastQuestion(sessionID, "Account_Check_Phone")
        textMessage = 'Este es tu telefono actual:\n'+session.context.phone
        main.sendTwoButtonMessage(session.fbid, textMessage, 
                                  'CONFIRMAR', 'ACCOUNT_PHONE_OK', 
                                  'MODIFICAR', 'MODIFY_OLD_PHONE')       
        break;
        
      case 'ACCOUNT_ADDRESS_OK': case 'ACCOUNT_PHONE_OK':
        sessionsHandler.ModifyLastQuestion(sessionID, "none")
        main.sendTextMessage(senderID, 'Perfecto!\nDatos de contacto actualizados.\n(•ω•)')
        break;
        
      case 'MODIFY_OLD_ADDRESS':
        sessionsHandler.ModifyLastQuestion(sessionID, "Account_Check_Address")
        order.AskForAddress(sessionID)
        break;

      case 'MODIFY_OLD_PHONE':
        sessionsHandler.ModifyLastQuestion(sessionID, "Account_Check_Phone")
        order.AskForPhone(sessionID);
        break;

        
      case 'HELP_PAYLOAD':
        help.help(senderID)
        break;
        
  // case '7001, 7002, 7003.... cod_producto
      case '7001': case '7002': 
        sessionsHandler.ShoppingCartCombo(sessionID, payload)       
        main.chooseQuantity(senderID);
        break;           

      case '1': case '2': case '3':
        sessionsHandler.ShoppingCartQuantity(sessionID, payload)
        order.Preorder(sessionID)
        break;
        
      case 'PRE_ORDER_OK': 
        sessionsHandler.ModifyLastQuestion(sessionID, 'address')
        console.log("\n\n\t===========>", session.status)
        if( session.status != 'NewUser' ){
          textMessage = 'Esta es tu direccion actual:\n'+session.context.address
          main.sendTwoButtonMessage(session.fbid, textMessage, 
                                  'CONFIRMAR', 'ADDRESS_OK', 
                                  'MODIFICAR', 'ADDRESS_RETRY')
          break;}
      case 'ADDRESS_RETRY':
        sessionsHandler.ModifyLastQuestion(sessionID, 'address')
        order.AskForAddress(sessionID)
        break;

        
      case 'ADDRESS_OK': 
        console.log("\n\n\t===========>", session.status)
        if( session.status != 'NewUser'){
          textMessage = 'Este es tu telefono actual:\n'+session.context.phone
          main.sendTwoButtonMessage(session.fbid, textMessage, 
                                    'CONFIRMAR', 'PHONE_OK', 
                                    'MODIFICAR', 'PHONE_RETRY')       
        break;}
      case 'PHONE_RETRY':
        sessionsHandler.ModifyLastQuestion(sessionID, 'phone')
        mySQLhandler.ModifyAddress(session.fbid,session.context.address)
        order.AskForPhone(sessionID);
        break;
        
      case 'PHONE_OK':
        // ocultar teclado
        main.TwoQuickReplies(senderID)
        
        sessionsHandler.ModifyLastQuestion(sessionID, 'finish')
        mySQLhandler.ModifyPhone(session.fbid,session.context.phone)
        order.ConfirmOrder(sessionID);
        break;
        
      case 'ORDER_OK':
        mySQLhandler.SendOrder(sessionID, function(OrderConfirmed){
          if (OrderConfirmed){
            main.sendTextMessage(senderID, 'Yupiii!' 
                            +'\nGracias por tu compra, te entregaremos pronto tu pedido.'
                            +'\n (づ｡◕‿‿◕｡)づ')
          } else {
            main.sendTextMessage(senderID, 'Changos, algo salio mal. u____u')
          }  
          
        })
        if( session.status === "ordered"){
          var textMessage = 'Re-contra confirmamos tu pedido. \n (ง ͡ʘ ͜ʖ ͡ʘ)ง'+
              '\n Si quieres pedir de nuevo escribe busca la opción en el menú inferior.'
          main.sendTextMessage(senderID, textMessage)
        }
        break;
          
        }
  
  }
);
}


module.exports.receivedPostback = (event) => receivedPostback(event)