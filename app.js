var r = require("request");
var express = require("express");
var app = express();
var path = require('path');
 twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
var moment = require('moment');
var _ = require('lodash');

app.use(express.static(path.join(__dirname, 'public')));

var data = [];
app.post('/text', function (req,res) {

  console.log(req.body);
  console.log(req.headers);
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

//R

app.get('/notify/:bus/:number', function (req,res) {
  var api = "http://api.hrtb.us/api/stop_times/";
  var bus = req.params.bus;
});

app.post('/msg', function (req,res) {
  console.log(req.body.Body);
  res.send(getResponse(req.body.Body));
});

//EVMS/NORFOLK will be here in about 10, the next one in 15
//NEWTOWN ROAD will be here in about 5 minutes and the next

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

function test() {
  r.get("http://api.hrtb.us/api/stop_times/8004", function (err, response, body) {
    console.log("http://api.hrtb.us/api/stop_times/8004");
    console.log();
    var test = _.groupBy(JSON.parse(body),"destination");
    console.log(test);
  });
}

function getResponse(message) {
  return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<Response>\n<Message>" + message + "</Message>\n</Response>";
}

test();
