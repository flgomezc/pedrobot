'use strict'
var main            = require('./../bot.js')
var coverage        = require('./../handlers/coverage.js')
var mySQLhandler    = require('./../handlers/mySQLhandler')
var order           = require('./../handlers/order.js')
var sessionsHandler = require('./../handlers/sessionsHandler.js')
var help            = require('./../handlers/help.js')


function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;
   
  console.log("Received message for user %d and page %d at %d with message:", 
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId          = message.mid;
  var messageText        = message.text;
  var messageAttachments = message.attachments;    
  
  var sessionID = sessionsHandler.FindOrCreateSession(senderID, function(sessionID){
    var session = sessionsHandler.CurrentSession(sessionID)
    
    if (messageText) {
      // If we receive a text message, check to see if it matches a keyword
      // and send back the template example. Otherwise, just echo the text we received.
      switch (messageText) {
          
        case 'c':
          main.TwoQuickReplies(senderID)
          break;
          
        case "ayuda": case "Ayuda": case "AYUDA":
          help.help(senderID)
          break;
          
        default:
          if(session.context.lastQuestion === 'address'){
            sessionsHandler.ModifyAddress(sessionID, messageText)
            main.sendTwoButtonMessage(senderID, 'Es correcta esta direccion\n' + messageText + '?', 
                                 'CONFIRMAR', 'ADDRESS_OK', 'MODIFICAR', 'ADDRESS_RETRY') 
            break;
          }
          
          if(session.context.lastQuestion === 'Account_Check_Address'){
            sessionsHandler.ModifyAddress(sessionID, messageText)
            main.sendTwoButtonMessage(senderID, 'Es correcta esta direccion\n' + messageText + '?', 
                                 'CONFIRMAR', 'ACCOUNT_ADDRESS_OK', 'MODIFICAR', 'MODIFY_OLD_ADDRESS') 
            break;  
          }
          
          if(session.context.lastQuestion === 'phone'){
            sessionsHandler.ModifyPhone(sessionID, messageText)
            main.sendTwoButtonMessage(senderID, 'Es correcto este número\n' + messageText + '?', 
                                 'CONFIRMAR', 'PHONE_OK', 'MODIFICAR', 'PHONE_RETRY') 
            break;
          }
          
          if(session.context.lastQuestion === 'Account_Check_Phone'){
            sessionsHandler.ModifyPhone(sessionID, messageText)
            main.sendTwoButtonMessage(senderID, 'Es correcto este número\n' + messageText + '?', 
                                 'CONFIRMAR', 'ACCOUNT_PHONE_OK', 'MODIFICAR', 'MODIFY_OLD_PHONE') 
            break;
          }
      }
    } else if (messageAttachments) {

      if(messageAttachments[0].type === 'location'){

        var lat  = messageAttachments[0].payload.coordinates.lat;
        var long = messageAttachments[0].payload.coordinates.long;    
        var zone = coverage.isItUnderCover(lat, long);

        sessionsHandler.ModifyLatitude(sessionID, lat)
        sessionsHandler.ModifyLongitude(sessionID, long)
        sessionsHandler.ModifyZone(sessionID, zone)
        sessionsHandler.CurrentSession(sessionID)

        if( zone ){
          mySQLhandler.ModifyCoordinatesAndZone(senderID, lat, long, zone)
          //Modificar este mensaje de texto y pasarlo a carrusel
          main.sendTextMessage(senderID, "Perfecto! Estás dentro de nuestra zona de cobertura.");

          mySQLhandler.AskForCombosInZone(zone, function(results){ 
            setTimeout( function(){
              main.ChooseYourCombo(senderID, results)
            }, 500)   
          });

        }  else {
          mySQLhandler.ModifyCoordinatesAndZone(senderID, lat, long, zone)
          main.sendTextMessage(senderID, "Changos!, estás fuera de la zona de cobertura \n\n (ノಠ益ಠ)ノ");
        }

      } else {
        main.sendTextMessage(senderID, "Message with attachment received");
      }
    }

  }); // Callback for function 'FindOrCreateSession' ends here
}


module.exports.receivedMessage = (event) => receivedMessage(event)