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

app.post('/text', function (req,res) {
  res.send('Bus Route Number' + req.header.id);
});

// serve public

app.get('/', function (req,res) {
  res.redirect(301, 'http://hrtb.us');
});


app.get('/msg', function (req,res) {
  res.send("Welcome to HRTB.us A volunteer project created by Code4HR. http://code4hr.org Just a moment, we're getting your bus stop information.");
});


app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
