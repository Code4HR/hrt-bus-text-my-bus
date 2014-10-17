var r = require("request");
var express = require("express");
var app = express();
var api = "http://api.hrtb.us/api/stop_times/8004";
var path = require('path');
 twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

app.use(express.static(path.join(__dirname, 'public')));
// r.get(api, function (err, res, body) {
//   console.log(body);
// });
var data = [];
app.post('/text', function (req,res) {

  console.log(req.body);
  console.log(req.params);
  data.push(req.body);
  data.push(req.params);
  res.send(data);
  // res.send();
  // twilio.sendMessage({
  //
  //     to: number, // Any number Twilio can deliver to
  //     from: '+17579135000', // A number you bought from Twilio and can use for outbound communication
  //     body: 'businfo' + name + ": " + message,
  // }, function(err, responseData) {
  //     console.log(err);
  //     if (!err) {
  //     console.log(responseData);
  //     res.send(responseData.from + " " + responseData.body);
  //     res.end();
  //     }
  // });
});

// serve public

app.get('/', function (req,res) {
  res.redirect(301, 'http://hrtb.us');
});


app.post('/msg', function (req,res) {
  res.send("Welcome to HRTB.us A volunteer project created by Code4HR. http://code4hr.org Just a moment, we're getting your bus stop information.");
});


app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
