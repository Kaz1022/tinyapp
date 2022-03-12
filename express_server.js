const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');

//helper functions
const { checkEmail, fetchUserId, urlsForUser } = require('./helpers');

const PORT = 8080; //default port 8080
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ["key1"],

  maxAge: 24 * 60 * 60 * 1000
}));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// base database for URL
const urlDatabase = {
  "b2xVn2": {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  "9sm5xK": {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

// Store User Info
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("1234")
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("5678")
  }
};

// generate random alphanumeric string with 6 characters, shortURL
function generateRandomString() {
  const randomString = Math.random().toString(36).slice(2, 8);
  return randomString;
};

// rendering URLs & entire user object
app.get('/urls', (req, res) => {

  // urls page will need to filter the entire list in the urlDatabase 
  // by comparing the userID with the logged-in user's ID

  const templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase),
    user: users[req.session.user_id],
  };
  res.render("urls_index", templateVars);
});

// create random string when we recieve the POST request to /urls
// it responds with a redirection to /urls/:shortURL
app.post('/urls', (req, res) => {
  // none logged in user cannot add a new url with POST request
  if (req.session.user_id === undefined) {
    return res.status(400).send("You need to be logged in to use this feature.");
  }

  // The form cannot be empty.
  if (!req.body.longURL) {
    const templateVars = {
      user: users[req.session.user_id],
      errorCode: 400,
      errorMessage: "Fill out the form."
    };
    return res.status(403).render('urls_error', templateVars);
  }

  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL: longURL, userID: req.session.user_id };
  res.redirect(`/urls/${shortURL}`);
});

// rendering to url_new userId cookie 
app.get('/urls/new', (req, res) => {

  //redirect to login page if user is not looged in
  if (req.session.user_id === undefined) {
    res.redirect('/login');
  } else {
    const templateVars = {
      user: users[req.session.user_id]
    };
    res.render("urls_new", templateVars);
  };
});

app.get('/urls/:shortURL', (req, res) => {
  const curUser = users[req.session.user_id];

  // if not logged in, redirect login/register
  // if not matches the id, send error
  if (!curUser) {
    const templateVars = { user: curUser };
    return res.render('urls_show', templateVars);
  } else if (urlDatabase[req.params.shortURL].userID !== curUser.id) {
    const templateVars = {
      user: users[req.session.user_id],
      errorCode: 403,
      errorMessage: "Invalid credentials."
    };
    return res.status(403).render('urls_error', templateVars);
  }

  const shortURL = req.params.shortURL;
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: users[req.session.user_id],
  };
  res.render('urls_show', templateVars);
});

// Editing/updating longURL
app.post('/urls/:shortURL', (req, res) => {
  // only the owner(creator)of the URL can edit or delete the link 
  // prevent the access from terminals using curl
  const curUser = users[req.session.user_id];
  if (!curUser || urlDatabase[req.params.shortURL].userID !== curUser.id) {
    return res.status(400).send("Access denied.");
  }

  // the form need to be filled out 
  if (!req.body.longURL) {
    const templateVars = {
      user: users[req.session.user_id],
      errorCode: 400,
      errorMessage: "Fill out the form!"
    };
    return res.status(400).render('urls_error', templateVars);
  }
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect(`/urls`);
});


// add delete botton
app.post('/urls/:shortURL/delete', (req, res) => {

  // only the owner(creator)of the URL can edit or delete the link 
  // prevent the access from terminals using curl
  const curUser = users[req.session.user_id];
  if (!curUser || urlDatabase[req.params.shortURL].userID !== curUser.id) {
    return res.status(400).send("You have no access.");
  }
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// redirect any request to /u/:shortURL to its longURL
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const urlObject = urlDatabase[shortURL];
  if (!urlDatabase[shortURL]) {
    const templateVars = {
      user: users[req.session.user_id],
      errorCode: 404,
      errorMessage: "The short URL does not exist."
    };
    res.status(404).render('urls_error', templateVars);
  } else {
    res.redirect(urlObject.longURL);
  }
});

// render to login page
app.get('/login', (req, res) => {

  // if users logged in redirect to urls
  if (req.session.user_id === undefined) {
    const templateVars = {
      user: users[req.session.user_id]
    };
    res.render('urls_login', templateVars);
  } else {
    res.redirect('/urls');
  }

});

// create an endpoint to handle a POST to LOGIN
app.post('/login', (req, res) => {
  const email = req.body.email.trim();
  const password = req.body.password.trim();

  if (!email || !password) {
    const templateVars = {
      user: users[req.session.user_id],
      errorCode: 400,
      errorMessage: "You need to fill out both forms."
    };
    return res.status(400).render('urls_error', templateVars);
  }

  // Store checkEmail/checkPassword functions into variables so that 
  // the function doesn't have to run every time
  const emailExists = checkEmail(users, email);
  const userId = fetchUserId(users, email);
  const user = users[userId];
  const hashedPassExists = bcrypt.compareSync(password, user.password);

  // if the email doesn't exist or the password does not match
  // **** we are not providing detailed error message such as password does not match
  // because we don't want to give away too much info for security purposes
  if (!emailExists || !hashedPassExists) {
    const templateVars = {
      user: users[req.session.user_id],
      errorCode: 403,
      errorMessage: "Invalid credentials."
    };
    return res.status(403).render('urls_error', templateVars);
  }

  // if the email and password matches
  // create cookie with the user id🍪
  if (emailExists && hashedPassExists) {
    // cookie is the user object key = id
    req.session.user_id = fetchUserId(users, email);
    res.redirect('/urls');
  }
});

// render to register page, if logged in redirect /urls
app.get('/register', (req, res) => {
  if (req.session.user_id === undefined) {
    const templateVars = {
      user: users[req.session.user_id]
    };
    res.render('urls_registration', templateVars);
  } else {
    res.redirect('/urls');
  }

});

// POST endpoint to register user
app.post('/register', (req, res) => {
  const email = req.body.email.trim();
  const password = req.body.password.trim();

  // create new user object if it's new
  // Handling error, if the form is empty
  if (!email || !password) {
    const templateVars = {
      user: users[req.session.user_id],
      errorCode: 400,
      errorMessage: "You need to fill out both forms."
    };
    return res.status(400).render('urls_error', templateVars);
  }

  const emailExists = checkEmail(users, email);

  // if the email already exists, error message should not contain details
  if (emailExists) {
    const templateVars = {
      user: users[req.session.user_id],
      errorCode: 400,
      errorMessage: "Invalid credentials."
    };
    return res.status(400).render('urls_error', templateVars);
  }

  // if the email is new
  const userId = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!emailExists) {
    users[userId] = { id: userId, email, password: hashedPassword };
    req.session.user_id = userId;
    res.redirect('/urls');
    return;
  }
});

// LOGOUT/clear cookie 
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});


