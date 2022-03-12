const { assert } = require('chai');

const { checkEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "123"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "345"
  }
};

const testUrlDatabase = {
  "b2xVn2": {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  "9sm5xK": {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

describe('checkEmail', function() {
  it('shuold return true the email exists', function() {
    const emailExists = checkEmail(testUsers, "user@example.com")
    const expectedOutput = true;
    assert.equal(emailExists, expectedOutput);
  });

  it('shuold return false if the email doesnt exists', function() {
    const emailExists = checkEmail(testUsers, "abc@example.com")
    const expectedOutput = false;
    assert.equal(emailExists, expectedOutput);
  })
});