var assert = require("assert");
var express = require("express");
var r = require("supertest");
var parseString = require('xml2js').parseString;
var should = require('should');
/**
* Test
*
* @param {Object} req - The request value.
**/
process.env.PORT = 4000;
var app = require("../app.js");


describe('General incoming request', function(){

  it('should respond with xml', function(done){
    r(app)
    .post('/msg')
    .send({Body:"8004"})
    .set('Accept', 'application/xml')
    .expect(200)
    .end(function(err, res){
      if (err) throw err;
      done();
    });
  });

  it('decode a typical stop, such as for a light rail stop named 8004', function(done){
    this.timeout(10000);
    r(app)
    .post('/msg')
    .send({Body:"8004"})
    .set('Accept', 'application/xml')
    .expect(200)
    .end(function(err, res){
      if (err) throw err;
      should.not.exist(err);

      // cleans utf8 parsing for xml in form
      // see http://www.multiasking.com/blog/xml2js-sax-js-non-whitespace-before-first-tag/
      var xml = res.text.replace("\ufeff", "");
      parseString(xml, function (err, ouput) {
         var parse = ouput.Response.Message[0];
         parse.should.startWith('Light rail ');
         done();
      });
    });
  });

  it('trim typical stom information incase of whitespace', function(done){
    this.timeout(10000);
    r(app)
    .post('/msg')
    .send({Body:" 8004  "})
    .set('Accept', 'application/xml')
    .expect(200)
    .end(function(err, res){
      if (err) throw err;
      should.not.exist(err);

      // cleans utf8 parsing for xml in form
      // see http://www.multiasking.com/blog/xml2js-sax-js-non-whitespace-before-first-tag/
      var xml = res.text.replace("\ufeff", "");
      parseString(xml, function (err, ouput) {
        var parse = ouput.Response.Message[0];
        parse.should.startWith('Light rail ');
        done();
      });
    });
  });


  it('should decode a bus stop for an address in norfolk ', function(done){
    r(app)
    .post('/msg')
    .send({Body:"111 Granby street "})
    .set('Accept', 'application/xml')
    .expect(200)
    .end(function(err, res){
      if (err) throw err;
      should.not.exist(err);

      // cleans utf8 parsing for xml in form
      // see http://www.multiasking.com/blog/xml2js-sax-js-non-whitespace-before-first-tag/
      var xml = res.text.replace("\ufeff", "");
      parseString(xml, function (err, ouput) {
        var parse = ouput.Response.Message[0];
        parse.should.startWith('Hi, currently');
        done();
      });
    });
  });
  it('should decode a full address', function(done){
    this.timeout(10000);
    r(app)
    .post('/msg')
    .send({Body:"111 Granby street Norfolk VA 23508"})
    .set('Accept', 'application/xml')
    .expect(200)
    .end(function(err, res){
      if (err) throw err;
      should.not.exist(err);

      // cleans utf8 parsing for xml in form
      // see http://www.multiasking.com/blog/xml2js-sax-js-non-whitespace-before-first-tag/
      var xml = res.text.replace("\ufeff", "");
      parseString(xml, function (err, ouput) {
        var parse = ouput.Response.Message[0];
        parse.should.startWith('Light rail ');
        done();
      });
    });
  });
});

describe('Edge cases for testing', function (){
  it('respond to term "help" with a useful message', function(done){
    r(app)
    .post('/msg')
    .send({Body:"help"})
    .set('Accept', 'application/xml')
    .expect(200)
    .end(function(err, res){
      if (err) throw err;
      should.not.exist(err);

      // cleans utf8 parsing for xml in form
      var xml = res.text.replace("\ufeff", "");
      parseString(xml, function (err, ouput) {
        var parse = ouput.Response.Message[0];
        parse.should.startWith('Hi, thanks for texting');
      });
      done();
    });
  });

  it('Search for an invalid bus stop number should respond with error message', function(done){
    r(app)
    .post('/msg')
    .send({Body:"82311"})
    .set('Accept', 'application/xml')
    .expect(200)
    .end(function(err, res){
      if (err) throw err;
      should.not.exist(err);

      // cleans utf8 parsing for xml in form
      var xml = res.text.replace("\ufeff", "");
      parseString(xml, function (err, ouput) {
        var parse = ouput.Response.Message[0];
        parse.should.startWith('Hmm, I cannot tell if');
        done();
      });
    });
  });

  it('Multiple inbound requests', function(){
    r(app)
    .post('/msg')
    .send({Body:"help"})
    .set('Accept', 'application/xml')
    .expect(200)
    .end(function(err, res){
      if (err) throw err;
      should.not.exist(err);

      // cleans utf8 parsing for xml in form
      var xml = res.text.replace("\ufeff", "");
      parseString(xml, function (err, ouput) {
        var parse = ouput.Response.Message[0];
        parse.should.startWith('Hi, thanks for texting');
      });
    });
    r(app)
    .post('/msg')
    .send({Body:"help"})
    .set('Accept', 'application/xml')
    .expect(200)
    .end(function(err, res){
      if (err) throw err;
      should.not.exist(err);

      // cleans utf8 parsing for xml in form
      var xml = res.text.replace("\ufeff", "");
      parseString(xml, function (err, ouput) {
        var parse = ouput.Response.Message[0];
        parse.should.startWith('Hi, thanks for texting');
      });
    });
    r(app)
    .post('/msg')
    .send({Body:"help"})
    .set('Accept', 'application/xml')
    .expect(200)
    .end(function(err, res){
      if (err) throw err;
      should.not.exist(err);

      // cleans utf8 parsing for xml in form
      var xml = res.text.replace("\ufeff", "");
      parseString(xml, function (err, ouput) {
        var parse = ouput.Response.Message[0];
        parse.should.startWith('Hi, thanks for texting');
      });
    });
  });
});


// #TODO Tests for
// Bounding Boxes
// Asking for help
// Checking for input a known address
// Checking for input a unknown/invalid address
// Check for known stop number
// Check for unknown/invalid stop number
// Check for addresses in 7 cities with generic typical names
// Bus stop with no buses coming
