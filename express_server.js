const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const PORT = 8080; //default port 8080
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// generate random alphanumeric string with 6 characters, shortURL
function generateRandomString() {
  const randomString = Math.random().toString(36).slice(2, 8);
  return randomString;
};


// base database for URL
const urlDatabase = {
  // "b2xVn2": "http://www.lighthouselabs.ca",
  // "9sm5xK": "http://www.google.com"
};

// Store User Info
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// Checking if the User email exists or not
function checkEmail(userObj, input) {
  for (const key in userObj) {
    if (userObj[key].email === input) {
      return true;
    }
  }
  return false;
};

// Checking if the User passowrd exists or not
function checkPassword(userObj, input) {
  for (const key in userObj) {
    if (userObj[key].password === input) {
      return true;
    }
  }
  return false;
};

// Checking the key of the object which matches the email
function fetchUserId(userObj, input) {
  for (const key in userObj) {
    if (userObj[key].email === input) {
      return key;
    }
  }
  return undefined;
}

// rendering URLs & entire user object
app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.user_id],
  };
  res.render("urls_index", templateVars);
});

// create random string when we recieve the POST request to /urls
// it responds with a redirection to /urls/:shortURL
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

// rendering to url_new userId cookie 
app.get('/urls/new', (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
  };
  res.render("urls_new", templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL],
    user: users[req.cookies.user_id]

  };
  res.render("urls_show", templateVars);
});

// Editing/updating longURL
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls`);
});


// add delete botton
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// redirect any request to /u/:shortURL to its longURL
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// render to login page
app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
  };
  res.render('urls_login', templateVars);
});

// create an endpoint to handle a POST to LOGIN
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.statusCode = 400;
    res.send("You need to fill out both forms.");
    return;
  }

  // Store checkEmail/checkPassword functions into variables so that 
  // the function doesn't have to run every time
  const emailExists = checkEmail(users, email);
  const passwordExists = checkPassword(users, password);

  // if the email doesn't exist
  if (!emailExists) {
    res.statusCode = 403;
    res.send("You don't have an account with this email.");
    return;
  }

  // if the password doesn't match
  if (emailExists && !passwordExists) {
    res.statusCode = 403;
    res.send("Your passowrd doesn't match.");
    return;
  }

  // if the email and password matches
  // create cookie with the user id🍪
  if (emailExists && passwordExists) {
    // cookie is the user object key = id
    res.cookie('user_id', fetchUserId(users, email));
    res.redirect('/urls');
  }

});

// render to register page
app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
  };
  res.render('urls_registration', templateVars);
});

// POST endpoint to register user
app.post('/register', (req, res) => {
  const userId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  // create new user object if it's new
  // Handling error, if the form is empty
  if (!email || !password) {
    res.statusCode = 400;
    res.send("You need to fill out both forms.");
    return;
  }

  const emailExists = checkEmail(users, email);

  // if the email already exists
  if (emailExists) {
    res.statusCode = 400;
    res.send("You already have an account with this email.");
    return;
  }

  // if the email is new
  if (!emailExists) {
    users[userId] = { id: userId, email, password };
    res.cookie('user_id', userId);
    res.redirect('/urls');
    return;
  }
});

// LOGOUT/clear cookie 
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});


