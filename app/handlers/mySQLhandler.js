'use strict';
var request = require('request')
var sessionsHandler = require('./sessionsHandler')
var mysql = require('mysql');

var connection = mysql.createConnection(
  {
    host    : process.env.MYSQL_HOST,
    user    : process.env.MYSQL_USER,
    password: process.env.MYSQL_PSSWD,
    database: 'Horno_Pedro' 
  }
);

////////////////////////////////////
// mySQL asks if user is already in database
////////////////////////////////////
function IsUserInDatabase( fbID , callback){    
  console.log('mySQL \t Checking if the user is in the database')  
  var query = 'SELECT * FROM usuarios WHERE fbID=' + fbID +';'; 
  //console.log(query);
  connection.query( query , function (error, results, fields) {
    if (error) console.error('Error trying to get User in Database! ', error);    
    //console.log(results );
    callback (results);
  }); 
}

/** 
 * Stores a new user to database
 * @param {Number} fbID
 * @returns null
**/
function AddNewUserToDB(fbID, first_name) { 
  console.log('mySQLhandler \tAdding new user to database')
  var queryTxt = 'SET time_zone = "-5:00"; INSERT INTO usuarios (fbID, nombre, first_contact) VALUES ('
  + '"'+ fbID + '", "' + first_name + '", NOW() );';

  connection.query( queryTxt , function (error, results, fields) {
    if (error) throw error;
    console.log(queryTxt);
    
  });    
}


function ModifyCoordinatesAndZone( fbID, latitude, longitude, zone ){
  
  var queryTxt = 'UPDATE usuarios SET '
  queryTxt +=    ' latitud=' + latitude
  queryTxt +=  ', longitud=' + longitude
  queryTxt +=      ', zona=' + zone
  queryTxt += ' WHERE fbID=' + fbID + ';'

  connection.query( queryTxt , function (error, results, fields) {
    if (error) throw error;
    console.log(queryTxt);
    
  });    
}

function ModifyAddress(fbID, address){
  
  var queryTxt = 'UPDATE usuarios SET '
  queryTxt +=  ' direccion="' + address +'"'
  queryTxt += ' WHERE fbID=' + fbID + ';'

  connection.query( queryTxt , function (error, results, fields) {
    if (error) throw error;
    console.log(queryTxt);
  });
}


function ModifyPhone(fbID, phone){
  
  var queryTxt = 'UPDATE usuarios SET '
  queryTxt +=   ' telefono="' + phone +'"'
  queryTxt += ' WHERE fbID=' + fbID + ';'

  connection.query( queryTxt , function (error, results, fields) {
    if (error) throw error;
    console.log(queryTxt);
  });
}


function AskForCombosInZone(zone, callback) {  
  var query = 'SELECT nombre_producto, subtitulo, cod_producto, image_url FROM producto WHERE zona='+ zone +';';
  console.log('Asking for data with mySQL');
  connection.query( query , function (error, results, fields) {
    if (error) throw error;
    console.log(query);
    //console.log(results);
           
    callback (results);
  });
}


function GetUserName(fbID, callback){
  var first_name
  request({
      uri: 'https://graph.facebook.com/v2.6/'+ fbID +'?fields=first_name',
      method: 'GET',
      qs: { access_token: process.env.PAGE_ACCESS_TOKEN }
    }, function (error, response, body) {
    
    if (!error && response.statusCode == 200) {
      var userJSON = JSON.parse(body);  
      first_name = userJSON.first_name;
      callback(first_name)
    } else {
      console.error(fbID, 'GetUserName \tUnable to get User Data.');
      //console.error(response);
      console.error(error);
      first_name = 'Anonimo'
      }
    });
}

function SendOrder(sessionID, callback){

  var session = sessionsHandler.CurrentSession(sessionID)
  
  var combo 
  if (session.shoppingCart.combo === "7001"){
    combo = 'FRANCES'
  } 
  if (session.shoppingCart.combo === "7002"){
    combo = 'ROLLITO'
  }
  
  if (session.status != 'ordered'){ 
    var query = 'INSERT INTO pedidos (fbID, valor_total, fecha_hora, status, session, '+
        'NombreUsuario, DireccionEntrega, Telefono, Combo, CantidadCombos) VALUES ('+
        '"'+ session.fbid +'", ' +
        '"'+ session.shoppingCart.totalprice +'", ' +
        'now(), ' +
        '"1", '  +
        ' "'+sessionID+'", '+
        '"'+session.context.name+'", '+
        '"'+session.context.address+'", '+
        '"'+session.context.phone+'", '+
        '"'+ combo +'", '+
        '"'+session.shoppingCart.quantity+'"'+');'
    
    console.log('Asking for data with mySQL');
    connection.query( query , function (error, results, fields) {
      if (error) throw error;
      //console.log(query);
      //console.log(results);         
      callback (true);
      session.status = 'ordered'
    });
  }
  
}

module.exports.IsUserInDatabase   = (fbID, callback) => IsUserInDatabase(fbID, callback);
module.exports.AddNewUserToDB = (fbID,username) => AddNewUserToDB(fbID, username); 
module.exports.GetUserName        = (fbID, callback) => GetUserName(fbID, callback); 
module.exports.AskForCombosInZone = (zone, callback) => AskForCombosInZone(zone, callback);
module.exports.ModifyCoordinatesAndZone = ( 
  fbID, latitude, longitude, zone) => ModifyCoordinatesAndZone( fbID, latitude, longitude, zone)
module.exports.ModifyAddress = (fbID, address) => ModifyAddress(fbID, address)
module.exports.ModifyPhone   = (fbID, phone  ) => ModifyPhone(fbID, phone)
module.exports.SendOrder    = (sessionID, callback) => SendOrder(sessionID, callback)