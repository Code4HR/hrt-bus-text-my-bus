var r = require("request");
var express = require("express");
var app = express();
var api = "http://api.hrtb.us/api/stop_times/8004";
 twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

//
//
//  var resp = new twilio.TwimlResponse();
//
// resp.say('Welcome to Twilio!');
// resp.say('Please let us know if we can help during your development.', {
//     voice:'woman',
//     language:'en-gb'
// });





// r.get(api, function (err, res, body) {
//   console.log(body);
// });

app.post('/text', function (req,res) {
  res.send('Bus Route Number' + req.header.id);
});



app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});
