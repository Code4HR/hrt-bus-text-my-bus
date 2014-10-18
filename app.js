var r = require("request");
var express = require("express");
var app = express();
var path = require('path');
 twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
var moment = require('moment');
var _ = require('lodash');

app.use(express.static(path.join(__dirname, 'public')));

// serve public
app.get('/', function (req,res) {
  res.redirect(301, 'http://hrtb.us');
});

app.post('/msg', function (req,res) {
  res.send(getResponse(req.query.Body));
});

//EVMS/NORFOLK will be here in about 10, the next one in 15
//NEWTOWN ROAD will be here in about 5 minutes and the next

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

function getResponse(message) {
  return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<Response>\n<Message>" + message + "</Message>\n</Response>";
}

function debugging() {
  r.get("http://api.hrtb.us/api/stop_times/8004", function (err, response, body) {
    console.log("http://api.hrtb.us/api/stop_times/8004");
    var test = _.groupBy(JSON.parse(body),"destination");
    console.log(test);
  });
}

debugging();
