var request = require('request')

var address = 'av el dorado # 69 -76, bogota,colombia'
var url     = https://maps.googleapis.com/maps/api/geocode/json

request('http://www.google.com', function (error, response, body) {
  console.log('error:', error); // Print the error if one occurred 
  console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
  console.log('body:', body); // Print the HTML for the Google homepage. 
});