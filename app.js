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
(function () {
    var r = require("request"),
        express = require("express"),
        app = express(),
        path = require('path'),
        //twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN),
        twilio = require('twilio'),
        moment = require('moment'),
        _ = require('lodash'),
        bodyParser = require('body-parser'),
        bPromise = require('bluebird');

    app.use(bodyParser.urlencoded({
        extended: true
    }));

    app.use(bodyParser.json());
    app.use(express.static(path.join(__dirname, 'public')));

    // Example curl from twilio.
    /* curl -X POST -d "From=7571112222&Body=8004" http://localhost:3000/msg */
    app.post('/msg', function (req, res) {
        logRequestDebuggingValues(req);

        // Check for an address.
        (hasAddress(req.body.Body) ?
            getStop(req.body.Body).then(getTimes).then(getResponse) :
         // Checks for a stop number, like http://hrtb.us/#stops/0263
         isFinite(parseInt(req.body.Body)) ? 
            getTimes(req.body.Body).then(getResponse) : 
            // Otherwise, give a help(ful) message.
            getResponse('Hi, thanks for texting your HRT bus! Please text a ' 
                 + 'stop number to find the next time your bus will come your '
                 + 'way.')).then(res.send.bind(res));
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
     * @param {String} body - The request body to recognise as an address.
     *
     * @return {Boolean} Does the body have an address?
     **/
    var hasAddress = function (body) {
        // TODO - Write address recogniser.
        return false;
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
            // TODO - Write the code to return a stop from the given address.
            return resolve(address);
        });
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
                    var stops = body === '[]' || JSON.parse(body) === [] ?
                        'Hmm, I cannot tell if that stop does not exist or if '
                            + 'no buses will come to that stop in the near '
                            + 'future.\nEither way, no buses will come to the '
                            + 'stop you mentioned any time soon.' :
                        transformSteps(body);
                    console.log(stops);
                    return resolve(stops);
                });
        }); 
    };

    /**
     * Parse out the stops and return them in a human-readable format.
     *
     * @param {String} body - The body of the response.
     *
     * @return {String} The stops in a string format.
     **/
    var transformSteps = function (body) {
        // Sort by routes and destinations.
        return _.map(_.groupBy(JSON.parse(body), 'destination'),
            function (stops) {
                // EVMS/NORFOLK will be here in about 10, the next one in 15.
                // NEWTOWN ROAD will be here in about 5 minutes and the next.
                return _.reduce(stops, function (response, stop) {
                    return { 
                              '0': 'Light rail'
                            , '3': 'Bus'
                            , '4': 'Ferry' 
                        }[stop.drop_off_type] + ' '  
                        + stop.routeShortName + ' to ' + stop.destination 
                        + ' will arrive in ' 
                        + moment.utc(stop.arrival_time).diff(moment.utc()
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
            resolve('<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n'
                + '<Response>\n<Message>' + message + '</Message>\n</Response>');
        });
    };

    app.set('port', process.env.PORT || 3000);
    app.listen(app.get('port'), function() {
        console.log('Express server listening on port ' + app.get('port'));
    });
}());
