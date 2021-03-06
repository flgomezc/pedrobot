
// PedroBot, fresh bread, just baked!
//
'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const path = require('path');
var wildcard = require('wildcard'); // Wildcard permite hacer matching tipo 'Hola Pedro' === 'Hola*' ==>true.

var messengerButton = "<html><head><title>PedroBot</title></head><body><h1>PedroBot</h1>"
messengerButton += "Pan recien horneado a domicilio! <div class=\"glitchButton\" "
messengerButton += " style=\"position:fixed;top:20px;right:20px;\"></div></body></html>";

// Para anadir paquetes adicionales
var coverage = require('./handlers/coverage.js')
var mySQLhandler = require('./handlers/mySQLhandler.js')
var sessionsHandler = require('./handlers/sessionsHandler.js')
var order = require('./handlers/order.js')

var PBlistener = require('./listeners/ReceivedPostback.js')
var RMlistener = require('./listeners/ReceivedMessage.js')

var cod_producto = ['7001', '7002']; 

// The rest of the code implements the routes for our Express server.
let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// Webhook validation
app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);          
  }
});

// Display the web page
app.get('/', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write(messengerButton);
  res.end();
});


// Message processing
app.post('/webhook', function (req, res) {
  console.log(req.body);
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object === 'page') {
    
    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
          RMlistener.receivedMessage(event);
        } else if (event.postback) {
          PBlistener.receivedPostback(event);   
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
});

function givemeYourAddress(recipientId) {
  var message = 'Perfecto. Para terminar dime en qué dirección quieres que entreguemos tu pedido';
  sendTextMessage(recipientId, message);
}

function askGoogle() {
  var request = require('request');
  request('http://www.google.com', function (error, response, body) {
  console.log('error:', error); // Print the error if one occurred 
  console.log('statusCode:', response && response.statusCode); 
    // Print the response status code if a response was received 
  console.log('body:', body); // Print the HTML for the Google homepage. 
  });
  
}

////////////////////////////////////////////////////
// Interactua con la API de facebook.
//  Env'ia los mensajes (de todo tipo)
////////////////////////////////////////////////////
function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
    
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s", 
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });  
}

// Set Express to listen out for HTTP requests
var server = app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port %s", server.address().port);
});

//////////////////////////
// Sending helpers
//////////////////////////
function TwoQuickReplies(recipientId){
  var messageData = {
    "recipient":{
      "id": recipientId
      },
    "message":{
      "text":"Yeiiii!:",
      "quick_replies":[
        {
          "content_type":"text",
          "title":"Yei!",
          "payload":"PICKING_YEII"
        },
        {
          "content_type":"text",
          "title":"Yupi!",
          "payload":"PICKING_YUPII"
        }
       ]
      }
  };
   
  callSendAPI(messageData);
}
module.exports.TwoQuickReplies = (recipientId) => TwoQuickReplies(recipientId)

function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}
module.exports.sendTextMessage = (recipientId, messageText) => sendTextMessage(recipientId, messageText)

function sendButtonMessage(recipientId, messageText, ButtonTitle, Payload) {
  var message = {
                  "recipient":{
                    "id":recipientId
                  },
                  "message":{
                    "attachment":{
                      "type":"template",
                      "payload":{
                        "template_type":"button",
                        "text":messageText,
                        "buttons":[
                          {
                            "type":"postback",
                            "title":ButtonTitle,
                            "payload":Payload
                          },
                        ]
                      }
                    }
                  }
                }
  callSendAPI(message);
}
module.exports.sendButtonMessage = (recipientId, messageText, ButtonTitle, Payload) => sendButtonMessage(recipientId, messageText, ButtonTitle, Payload)

function sendTwoButtonMessage(recipientId, messageText, ButtonTitle1, Payload1, ButtonTitle2, Payload2) {
  var message = {
                  "recipient":{
                    "id":recipientId
                  },
                  "message":{
                    "attachment":{
                      "type":"template",
                      "payload":{
                        "template_type":"button",
                        "text":messageText,
                        "buttons":[
                          {
                            "type":"postback",
                            "title":ButtonTitle1,
                            "payload":Payload1
                          },{
                            "type":"postback",
                            "title":ButtonTitle2,
                            "payload":Payload2
                          },
                        ]
                      }
                    }
                  }
                }
  callSendAPI(message);
}
module.exports.sendTwoButtonMessage = (recipientId, messageText, ButtonTitle1, Payload1, ButtonTitle2, Payload2) => sendTwoButtonMessage(recipientId, messageText, ButtonTitle1, Payload1, ButtonTitle2, Payload2)

//////////////////////////////////////////////////////////////////////////////
//
//   Funciones personalizadas
// 
//////////////////////////////////////////////////////////////////////////////

function GivemeYourLocation(recipientId, textMessage = 'Envia tu ubicación para verificar si te encuentras en el area de cobertura'){
  var messageData = {
    recipient: {id: recipientId},
    message: { text: textMessage,
              quick_replies:[{content_type:'location', payload:"USER_LOCATION"}]}
      }; 
  callSendAPI(messageData);
}
module.exports.GivemeYourLocation = (fbID, textMessage) => GivemeYourLocation(fbID, textMessage)


////////////////////////////////
// EL usuario escoge el combo que quiere pedir.
////////////////////////////
function ChooseYourCombo(recipientId, results) {
  
  var textMessage = 'Estos son los combos recién horneados que te ofrecemos hoy:'
  sendTextMessage(recipientId, textMessage)
  
  //console.log(results)
  var LEN = Object.keys(results).length
  //console.log(LEN)
   
  var messageData = {}
  
  messageData.recipient = {}
  messageData.recipient.id = recipientId
  messageData.message = {}
  messageData.message.attachment = {}
  messageData.message.attachment.type = "template" 
  messageData.message.attachment.payload = {}
  messageData.message.attachment.payload.template_type = "generic"
  messageData.message.attachment.payload.elements = []
  
  for (var k=0; k<LEN; k++){
    messageData.message.attachment.payload.elements.
    push( {"title" : results[k].nombre_producto,
          "subtitle": results[k].subtitulo,
          "item_url": "",
          "image_url": results[k].image_url,
          "buttons" : [{
            "type" : "postback",
            "title": "Quiero este combo!",
            "payload": results[k].cod_producto,
          },],
          })    
  }
  callSendAPI(messageData);
  console.log(JSON.stringify(messageData))
}
module.exports.ChooseYourCombo = (recipientId, results) =>  ChooseYourCombo(recipientId, results)

/////////////////////////////////////////////
// Una vez el usuario ha elegido el combo
// elige la cantidad de combos
/////////////////////////////////////////////

function chooseQuantity(recipientId){
  console.log("Pidiendo cantidad de combos");
  var message = {
                  "recipient":{
                    "id":recipientId
                  },
                  "message":{
                    "attachment":{
                      "type":"template",
                      "payload":{
                        "template_type":"button",
                        "text":'Cuántos combos quieres ordenar?',
                        "buttons":[
                          {
                            "type":"postback",
                            "title":'1',
                            "payload":"1"
                          },{
                            "type":"postback",
                            "title":'2',
                            "payload":'2'
                          },{
                            "type":"postback",
                            "title":'3',
                            "payload":'3'
                          },
                        ]
                      }
                    }
                  }
                }
  callSendAPI(message);
}
module.exports.chooseQuantity = (recipientId) => chooseQuantity(recipientId)