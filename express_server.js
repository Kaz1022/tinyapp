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
    passowrd: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    passowrd: "dishwasher-funk"
  }
};

// Checking it the email exist or not
function checkEmail(input) {
  for (const key in users) {
    if (users[key].email === input) {
      return true;
    }
    return false;
  }
};

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
  console.log(urlDatabase[shortURL]);
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
  console.log(urlDatabase);
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

// create an endpoint to handle a POST to LOGIN
// also create cookie with user_ID 🍪 ???????????????????
app.post('/login', (req, res) => {
  res.cookie('user_id', req.body.email);
  res.redirect('/urls');
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

  // if the email already exists
  if(checkEmail(email)) {
    res.statusCode = 400;
    res.send("You already have an account with this email.");
    return;
  }

  // if the email is new
  if (!checkEmail(email)) {
    users[userId] = { id: userId, email, password };
    res.cookie('user_id', userId);
    console.log(users);
    res.redirect('/urls');
    return;
  }

 });

// LOGOUT/clear cookie 
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});


