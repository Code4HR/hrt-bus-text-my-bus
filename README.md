
hrt-bus-text-my-bus
===================

[![Build Status](https://travis-ci.org/Code4HR/hrt-bus-text-my-bus.svg?branch=master)](https://travis-ci.org/Code4HR/hrt-bus-text-my-bus)

STATUS: pre-alpha need more testing
phone number: 757-913-5000  

text to find in realtime when the bus is coming. powered by the hrtb.us api  `


How it works
---
This app relies on a Text Message as a Service API called Twilio. Twilio parses text messages it receives on its service and makes a HTTP GET/POST to a third party route service you specific. Then on that response it determines what type of actions it needs to take.

This is using TWIML a twilio XML format for formatting reponse messages. The Node service hits the bus api and formats the XML object that is returned to twilio.


Currently there is a heroku service setup at http://hrtbus.herokuapp.com/msg/8004 that parses and creates messages for twilio to send out.

development
---
To test locally you DO NOT need to set up twilio. You can install the dependencies and test locally what type of reponse messages are formed from the console.

A command to test each type of response the server can currently handle:
* Address
```bash
curl -X POST -d "From=7571112222&Body=111 Granby St." http://localhost:3000/msg
```
* Stop number
```bash
curl -X POST -d "From=7571112222&Body=8004" http://localhost:3000/msg
```
* Default help message
```bash
curl -X POST -d "From=7571112222&Body=hi!" http://localhost:3000/msg
```

The rest will be handled by the third party service

installation
----
```
git clone http://gitub.com/YOURNAME/hrt-bus-text-my-bus
npm install
node app.js
```

<img src="http://i.imgur.com/UTX2FUu.png" width="400px";></img>


HRT BUS API
----
http://api.hrtb.us/api/
