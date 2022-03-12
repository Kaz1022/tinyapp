// Checking if the User email exists or not
const checkEmail = function(userObj, input) {
  for (const key in userObj) {
    if (userObj[key].email === input) {
      return true;
    }
  }
  return false;
};

// Checking the key of the object which matches the email
// to fetch UserId
const fetchUserId = function(userObj, input) {
  for (const key in userObj) {
    if (userObj[key].email === input) {
      return key;
    }
  }
  return undefined;
};

// Returning the URLs where the userID is equal to the id of the currenty logged-in user.
const urlsForUser = function(id, urlDatabase) {
  const newURLDatabase = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      newURLDatabase[key] = { longURL: urlDatabase[key].longURL, userID: urlDatabase[key].userID };
    }
  }
  return newURLDatabase;
};



module.exports = { checkEmail, fetchUserId, urlsForUser };

