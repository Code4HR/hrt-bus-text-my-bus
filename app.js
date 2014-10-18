var r = require("request");
var express = require("express");
var app = express();
var path = require('path');
//var twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
var twilio = require('twilio');
var moment = require('moment');
var _ = require('lodash');
var qs = require('querystring');

app.use(express.static(path.join(__dirname, 'public')));

// serve public
app.get('/', function (req,res) {
  res.redirect(301, 'http://hrtb.us');
});

// app.post('/msg', function (req,res) {
//   res.writeHead(200, {'Content-Type': 'text/xml'});
//   console.log(JSON.stringify(req.params));
//   res.end(getResponse(req.query));
// });

app.post('/msg', function (req,res) {
    if (req.method == 'POST') {
        var body = '';

        req.on('data', function (data) {
            body += data;
        });

        req.on('end', function () {

            var POST = qs.parse(body);

            //validate incoming request is from twilio using your auth token and the header from Twilio
            var token = process.env.TWILIO_AUTH_TOKEN,
                header = req.headers['x-twilio-signature'];

            res.writeHead(200, { 'Content-Type':'text/xml' });
            console.log("****DEBUGGING***");
            console.log(req.query);
            console.log(req.body);
            console.log(req.params);
            res.end((getResponse(req.body.Body)));

        });
    }
    else {
        res.writeHead(404, { 'Content-Type':'text/plain' });
        res.end('send a POST');
    }

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
