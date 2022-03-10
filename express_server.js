const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { send } = require('express/lib/response');

const PORT = 8080; //default port 8080
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

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
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// generate random alphanumeric string with 6 characters, shortURL
function generateRandomString() {
  const randomString = Math.random().toString(36).slice(2, 8);
  return randomString;
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

// Returning the URLs where the userID is equal to the id of the currenty logged-in user.
function urlsForUser(id) {
  const newURLDatabase = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      newURLDatabase[key] = { longURL: urlDatabase[key].longURL, userID: urlDatabase[key].userID };
    }
  }
  return newURLDatabase;
};

// rendering URLs & entire user object
app.get('/urls', (req, res) => {

  //urls page will need to filter the entire list in the urlDatabase by comparing the userID with the logged-in user's ID

  const templateVars = {
    urls: urlsForUser(req.cookies.user_id),
    user: users[req.cookies.user_id],
  };
  res.render("urls_index", templateVars);
});

// create random string when we recieve the POST request to /urls
// it responds with a redirection to /urls/:shortURL
app.post('/urls', (req, res) => {
  // none logged in user cannot add a new url with POST request
  if (req.cookies.user_id === undefined) {
    res.statusCode = 400;
    res.send("You need to be logged in to use this feature.");
    return;
  }

  // The form cannot be empty.
  if (!req.body.longURL) {
    res.statusCode = 400;
    return res.send("Fill out the form!");
  }

  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL: longURL, userID: req.cookies.user_id };
  res.redirect(`/urls/${shortURL}`);
});

// rendering to url_new userId cookie 
app.get('/urls/new', (req, res) => {

  //redirect to login page if user is not looged in
  if (req.cookies.user_id === undefined) {
    res.redirect('/login');
  } else {
    const templateVars = {
      user: users[req.cookies.user_id]
    };
    res.render("urls_new", templateVars);
  };
});

app.get('/urls/:shortURL', (req, res) => {
  const curUser = users[req.cookies.user_id];

  // if not logged in, redirect login/register
  // if not matches the id, send error
  if (!curUser) {
    const templateVars = { user: curUser };
    return res.render('urls_show', templateVars);
  } else if (urlDatabase[req.params.shortURL].userID !== curUser.id) {
    res.statusCode = 400;
    return res.send("Invalid Credentials.");
  }

  const shortURL = req.params.shortURL;
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: users[req.cookies.user_id],
  };
  res.render('urls_show', templateVars);
});

// Editing/updating longURL
app.post('/urls/:shortURL', (req, res) => {
  // the form need to be filled out 
  if (!req.body.longURL) {
    res.statusCode = 400;
    return res.send("Fill out the form!");
  }
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.longURL;
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
  const shortURL = req.params.shortURL;
  const urlObject = urlDatabase[shortURL];
  if (!urlDatabase[shortURL]) {
    res.statusCode = 404;
    res.send("The short URL does not exist.");
  } else {
    console.log(urlObject.longURL);
    res.redirect(urlObject.longURL);
  }
});

// render to login page
app.get('/login', (req, res) => {

  // if users logged in redirect to urls
  if (req.cookies.user_id === undefined) {
    const templateVars = {
      user: users[req.cookies.user_id]
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
    res.statusCode = 400;
    res.send("You need to fill out both forms.");
    return;
  }

  // Store checkEmail/checkPassword functions into variables so that 
  // the function doesn't have to run every time
  const emailExists = checkEmail(users, email);
  const passwordExists = checkPassword(users, password);

  // if the email doesn't exist or f the password doesn't match
  if (!emailExists || emailExists && !passwordExists) {
    res.statusCode = 403;
    res.send("Invalide credentials");
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

// render to register page, if logged in redirect /urls
app.get('/register', (req, res) => {
  if (req.cookies.user_id === undefined) {
    const templateVars = {
      user: users[req.cookies.user_id]
    };
    res.render('urls_registration', templateVars);
  } else {
    res.redirect('/urls');
  }

});

// POST endpoint to register user
app.post('/register', (req, res) => {
  const userId = generateRandomString();
  const email = req.body.email.trim();
  const password = req.body.password.trim();

  // create new user object if it's new
  // Handling error, if the form is empty
  if (!email || !password) {
    res.statusCode = 400;
    res.send("You need to fill out both forms.");
    return;
  }

  const emailExists = checkEmail(users, email);

  // if the email already exists, error message should not contain details
  if (emailExists) {
    res.statusCode = 400;
    res.send("Invalid credentials.");
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
  res.clearCookie('user_id'); // need name? 
  res.redirect('/login');
});


