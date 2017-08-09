'use strict';

/**
 * isItUnderCover(Lat,Long)
 * Checks if th given location is into any service zone.
 * @param {Number} Lat
 * @param {Number} Long
 * @return {Number} zone. If it is out of coverage returns 0.
 * Elser, returns an integer.
**/
function isItUnderCover(Lat,Long){
  var zone = 0 // out of coverage area

  var s0, s1, s2, s3, s4;
  
  console.log('Coverage \tTesting coverage for coordinates', Lat,Long);
  
  // Salitre01, Bogota, Colombia
  s0 = ( Lat <  0.532258064518*Long +   44.1077909679)
  s1 = ( Lat < -1.599514563110*Long + -113.875618786)
  s2 = ( Lat >  0.562500000003*Long +   46.3400812502)
  s3 = ( Lat > -1.561611374410*Long + -111.07054825)
  console.log('Coverage \t Is user in zone 01-01 Salitre?', s0, s1, s2, s3);
  if (s0 & s1 & s2 & s3){
    zone = 1
    return zone
  }
  
  // Salitre01, Bogota, Colombia
  s0 = ( Lat <  0.413793103459*Long +  35.3268189663)
  s1 = ( Lat < -0.797590361444*Long + -54.4461809155)
  s2 = ( Lat < -3.153846153880*Long +-229.0534061560)
  s3 = ( Lat >  0.555555555555*Long +  45.8254644444)
  s4 = ( Lat > -1.596969696970*Long +-113.6870319400)
  console.log('Coverage \t Testing if User is in zone 01-02 Salitre', s0, s1, s2, s3, s4);
  if (s0 & s1 & s2 & s3 & s4){
    zone = 1  ;
    return zone
  }
  
  console.log('Coverage \t User is out of coverage, zone = 0');
  return zone
}

exports.isItUnderCover = (Lat, Long) => isItUnderCover(Lat,Long);