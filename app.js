var r = require("request");
var express = require("express");
var app = express();
var path = require('path');
//var twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
var twilio = require('twilio');
var moment = require('moment');
var _ = require('lodash');
var qs = require('querystring');
var bodyParser = require('body-parser');
var bPromise = require('bluebird');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// serve public
app.get('/', function (req,res) {
  res.redirect(301, 'http://hrtb.us');
});


// example curl from twilio
/**  curl -X POST -d "From=3031111111&Body=Test Message" http://localhost:3000/msg **/

app.post('/msg', function (req,res) {
  res.writeHead(200, {'Content-Type': 'text/xml'});
  console.log("****DEBUGGING***");
  console.log(req.headers);
  console.log(req.query);
  console.log(req.body);
  console.log(req.form);
  console.log(req.params);
  console.log(req.params.Body);

  //TRANSFORM THIS DATA
  var busstop = req.body.Body;

  res.end(getResponse(req.body.Body));
});

app.get('/msg/:id', function (req, res) {

  getStops(req.params.id).then(res.send.bind(res));

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

//http://hrtb.us/#stops/0263

var	routeType = {
  '0': 'light-rail',
  '3': 'bus',
  '4': 'ferry'
};
//
// var date = function(arrival_time) {
//   return new Date(Date.toISOString(arrival_time));
// };
// var calculateTime = function (busAdherence) {
//   var arriveTime = date();
//   if(busAdherence) {
//     arriveTime = arriveTime.addMinutes(busAdherence * -1);
//   }
//
//   var arriveTimeFromNow = new Date(arriveTime - new Date().getTime());
//   return (arriveTimeFromNow.getTime() / 1000 / 60 | 0);
// };

/**Makes API request to the HRTB.US API and transform the json results **/

function getStops(param) {
//  param = "8004";
  console.log(param);
  if (_.isUndefined(param)){
     param = "8004";
  }
  return new bPromise(function (resolve, reject) {

  var url = "http://api.hrtb.us/api/stop_times/"+ param;
  r.get(url, function (err, response, body) {
    console.log(JSON.parse(body));
    console.log(body);
    console.log(typeof JSON.parse(body));

    if (JSON.parse(body) === []){
      return resolve("not a valid stop");
    }
    var info = [];
    var stops = {};
    var destinations = _.groupBy(JSON.parse(body), "destination");
    var routes;
    //get the time now
    var now = moment.utc(new Date());
    //sort by routes and destinations
    _.each(destinations, function (route) {
      _.each(route, function (stop, key) {
      var time = moment(stop.arrival_time).diff(now);
      // TODO DANGEROUS -- DAYLIGHT SAVINGS TIME WILL BREAK THIS
      var d = moment.duration(time).subtract("240","minutes");
      time = Math.ceil(d.asMinutes()-240);
        //new stop
      if (_.isUndefined(stops[stop.destination]) && time > 0 ){
          stops[stop.destination] = {
            "route": stop.routeShortName,
            "time": [time],
            "type": routeType[stop.drop_off_type]
          };
      }
      else if (time > 0 ){
        //existing stop
        stops[stop.destination].time.push(time);
      }
      });
    });
    console.log(toText(stops));
    resolve(toText(stops));
  });
}); // end of promise
}

/** Stringify createed text object from from getStops **/
function toText(stops) {
  var response = '';
  var aTimes;
  var next;
  _.each(stops, function (value, key){
    next = value.time.slice(1);
    if (next !== []) {
       aTimes = _.reduce(next, function (a, b) {
        return a + " & " + b;
      });
      next = "next " + value.type + " in "+ aTimes+ " mins";
    }
    else {
      next = "";
    }
    response += value.type + " " +  value.route +  " to "+ key + " in " + value.time[0] + " mins "+ next + "\n";
  });
    return response;
}

getStops();
