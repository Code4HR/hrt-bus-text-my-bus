var assert = require("assert");
var express = require("express");
var r = require("supertest");

/**
* Test
*
* @param {Object} req - The request value.
**/
process.env.PORT = 4000;
var app = require("../app.js");


describe('General incoming request', function(){
  it('respond with xml', function(done){
    r(app)
    .post('/msg')
    .send({Body:"8004"})
    .set('Accept', 'application/xml')
    .expect(200, done);
  });
});

function clientError(e) {
  return e.code >= 400 && e.code < 500;
}



// #TODO Tests for
// Bounding Boxes
// Asking for help
// Checking for input a known address
// Checking for input a unknown/invalid address
// Check for known stop number
// Check for unknown/invalid stop number
