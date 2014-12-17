/*
    Copyright 2014 Code for Hampton Roads contributors

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 */
module.exports = (function () {
    var r = require("request"),
        express = require("express"),
        app = express(),
        path = require('path'),
        twilio = require('twilio'),
        moment = require('moment'),
        _ = require('lodash'),
        bodyParser = require('body-parser'),
        bPromise = require('bluebird'),
        where = require('where');

    app.use(bodyParser.urlencoded({
        extended: true
    }));

    app.use(bodyParser.json());
    app.use(express.static(path.join(__dirname, 'public')));

    // Twilio route.
    app.post('/msg', function (req, res) {
        var text = req.body.Body;
        logRequestDebuggingValues(req);

        // Asking for help.
        (/help/i.test(text) ?
            getResponse('Hi, thanks for texting your HRT bus! Please text an '
                + 'address or a stop number to find the next time your bus will'
                + ' come your way.') :
         // Check for an address.
         hasAddress(text) ?
            getStop(text).then(getTimes).then(getResponse) :
         // Checks for a bus stop number, like http://hrtb.us/#stops/0263
         hasStop(text) ?
            getTimes(text).then(getResponse) :
            // Otherwise, give a help(ful) message.
            getResponse('Hi! You have texted the Text Your Bus application.  I '
                + 'do not quite understand your request.  Please text "help" '
                + 'for a list of possible options.')).then(res.send.bind(res));
    });

    /**
     * Computation, logs request values to the console.
     *
     * @param {Object} req - The request value.
     **/
    var logRequestDebuggingValues = function (req) {
        console.log("****DEBUGGING***");
        console.log(req.headers);
        console.log(req.query);
        console.log(req.body);
        console.log("form", req.form);
        console.log(req.params);
    };

    /**
     * Predicate, holds when the body has an address.
     *
     * @param {String} text - The text a citizen sent.
     *
     * @return {Boolean} Does the body have an address?
     **/
    var hasAddress = function (text) {
        return /^\s*(\d*)\s*(([a-z]+[.]?|\d*(1st|[23]n?d|[4-9]th))\s*)+(([a-z]+[.]?)\s*,?)?\s*(([a-z]*\s*)*,?)?\s*(V(irgini)?a)?\s*$/i.test(text);
    };

    /**
     * Returns a promise to handle a stop from an address.
     *
     * @param {String} address - The address to return a stop from.
     *
     * @return {Promise} The stop promise.
     **/
    var getStop = function (address) {
        return new bPromise(function (resolve, reject) {
            var geocoder = new where.Geocoder;
            geocoder.toPoint({ display_name: address , country: 'us' },
                function (error, points) {
                    var bounded = bound(points), point = bounded[0];
                    if (bounded.length === 0) {
                        return resolve('0');
                    } else {
                        r.get('http://api.hrtb.us/api/stops/near/'
                                + point.lat + '/' + point.lon,
                            function (error, response, body) {
                                return resolve(closestStop(JSON.parse(body)
                                    , {location: [point.lon, point.lat]}));
                            });
                    }
                });
        });
    };

    /**
     * Returns the Nominatim points bounded by a bounding box local to the
     * Seven Cities area.
     *
     * @param {Array} points - The points returned from Nominatim.
     *
     * @return {Array} The points local to the Seven Cities.
     **/
    var bound = function (points) {
        return _.filter(points, function (point) {
            // viewbox: -77.32,37.28,-75.33,36.51
            return point.lon > -77.32 && point.lon < -75.33
                && point.lat > 36.51 && point.lat < 37.28;
        });
    };

    /**
     * Returns the name of the closest stop to the address specified.
     *
     * @param {Array} stops - The stop list.
     * @param {Object} here - The coordinates for the address specified.
     *
     * @return {String} The id of the closest stop.
     **/
    var closestStop = function (stops, here) {
        return _.reduce(stops, function (first, second) {
            return distance(here, first) < distance(here, second) ?
                first :
                second;
        }, {stopId: 'Richmond', location: [-77.4928, 37.5244]}).stopId;
    };

    /**
     * Returns the distance between two points.
     *
     * @param {Object} x - The first point.
     * @param {Object} y - The second point.
     *
     * @return {Number} The distance from x to y.
     **/
    var distance = function (x, y) {
        return Math.sqrt(Math.pow(x.location[0] - y.location[0], 2)
            + Math.pow(x.location[1] - y.location[1], 2));
    };

    /**
     * Makes API request to the HRTB.US API and transform the json results.
     *
     * @param {String} stop - The stop to get times for.
     *
     * @return {Promise} A promise returning the stringified hrtb.us results,
     *      passing them into the continuation.
     **/
    var getTimes = function (stop) {
        return new bPromise(function (resolve, reject) {
            r.get("http://api.hrtb.us/api/stop_times/" + stop,
                function (err, response, body) {
                    /* If we cannot parse the times, provide a helpful error
                     * message. */
                    return resolve(body === '[]' || JSON.parse(body) === [] ?
                        'Hmm, I cannot tell if that stop does not exist or if '
                            + 'no buses will come to that stop in the near '
                            + 'future.\nEither way, no buses will come to the '
                            + 'stop you mentioned any time soon.' :
                        showTimes(JSON.parse(body)));
                });
        });
    };

    /**
     * Transforms the times into a human-readable format.
     *
     * @param {Object} json - The times JSON.
     *
     * @return {String} The times in a human-readable string format.
     **/
    var showTimes = function (json) {
        // Sort by routes and destinations.
        return _.map(_.groupBy(json, 'destination'),
            function (times) {
                // EVMS/NORFOLK will be here in about 10, the next one in 15.
                // NEWTOWN ROAD will be here in about 5 minutes and the next.
                return _.reduce(times, function (response, time) {
                    return {
                              '0': 'Light rail'
                            , '3': 'Bus'
                            , '4': 'Ferry'
                        }[time.drop_off_type] + ' '
                        + time.routeShortName + ' to ' + time.destination
                        + ' will arrive in '
                        + moment.utc(time.arrival_time).diff(moment.utc()
                            , 'minutes')
                        + ' minutes.';
                }, '');
            }).join('\n');
    };

    /**
     * Returns a promise which returns an XML response of the given message.
     *
     * @param {String} message - The message to return.
     *
     * @return {Promise} An XML promise.
     **/
    var getResponse = function (message) {
        return new bPromise(function (resolve, reject) {
            console.log(message);
            resolve('<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n'
                + '<Response>\n<Message>' + message
                + '</Message>\n</Response>');
        });
    };

    /**
     * Predicate, holds when the text represents a bus stop number.
     *
     * @param {String} text - The text a citizen sent.
     *
     * @return {Boolean} Does the text represent a bus stop number?
     **/
    var hasStop = function (text) {
        return isFinite(parseInt(text));
    };

    app.set('port', process.env.PORT || 3000);
    app.listen(app.get('port'), function() {
        console.log('Express server listening on port ' + app.get('port'));
    });
    return app;
}());
