'use strict'
var main            = require('./../bot.js')
var coverage        = require('./../handlers/coverage.js')
var mySQLhandler    = require('./../handlers/mySQLhandler')
var order           = require('./../handlers/order.js')
var sessionsHandler = require('./../handlers/sessionsHandler.js')

function help(fbID){
  
  setTimeout(function(){
  var text = "¿Cómo usar Pedro?"
    + "\n \n Cuando lo utilizas por primera vez Pedro te solicita tus coordenadas geograficas"
    + "(latitud y longitud) para verificar que te encuentres en nuestras zonas de cobertura."
    + "\n Los hornos de Pedro es un emprendimiento jóven, no te preocupes si estás fuera de " 
    + "cobertura, estamos trabajando para expandirnos y llegar a tí :)" 
  main.sendTextMessage(fbID, text)
  }, 0 )
    
  setTimeout(function(){
    var text = "Una vez sabemos dónde estás podemos ofrecerte los productos recién horneados"
      +  "en tu zona. Luego Pedro te solicita que escribas la dirección de entrega y un "
      + "teléfono de contacto." 
    main.sendTextMessage(fbID, text)    
  }, 2500 )
  
  setTimeout(function(){
    var text = "En el menú encontrarás el botón para hacer un nuevo pedido, también encuentras"
      + "las opciones para cambiar tu ubicación, tu dirección de" 
      + "entrega y tu teléfono de contacto"
    main.sendTextMessage(fbID, text)
  }, 5000 )
}

module.exports.help = fbID => help(fbID)