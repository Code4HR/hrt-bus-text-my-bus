var r = require("request");
var api = "http://api.hrtb.us/api/";

r.get(api, function (err, res, body) {
  console.log(body);
});
