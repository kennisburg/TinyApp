var express = require('express');
const bodyParser = require('body-parser');
const app = express();
// const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt')
const session = require('cookie-session');
const PORT = 8080;

app.use(bodyParser.urlencoded({extended:true}));

// app.use(cookieParser());

app.use(session({
  secret: 'yellayella',
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000
}));

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": {
    shortURL: "b2xVn2",
    longURL: "http://www.lighthouselabs.ca",
    userID: '0000a1'
  },
  "9sm5xK": {
    shortURL: "9sm5xK",
    longURL: "http://www.google.com",
    userID: '0000a2'
  },
  "9090":{
    shortURL: "9090",
    longURL: "http://www.google.com",
    userID: "0000a2"
  }

};

const users = {
  "0000a1": {
    id: "0000a1",
    email: "user@example.com",
    password: bcrypt.hashSync("123456", 10)
  },
  "0000a2": {
    id:"0000a2",
    email: "user2@example.com",
    password: bcrypt.hashSync("123456", 10)
  }
};



function generateRandomString() {
    return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}


function userURL(id) {
  var arr = [];
  for (var i in urlDatabase) {
    if (id === urlDatabase[i].userID) {
      arr.push(urlDatabase[i])
    }
  }
  return arr;
}


app.get('/', (req, res) => {
  res.send(`<html>
              <body>
                Hello <b>World</b>
                <section>
                  <a href='/urls'>To TinyApp</a>
                </section>
              </body>
            </html>\n`);
});

app.get('/login', (req, res) => {
  let templateVars = {username: req.session.user_id}
  res.render('login', templateVars)
})

app.get('/registration', (req, res) => {
  res.render('registration');
})

app.get('/urls', (req, res) => {
  let templateVars = {
    urls: userURL(req.session.user_id),
    username: req.session.user_id,
    user: users
  }
  res.render('urls_index', templateVars)
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls/new', (req, res) => {
  let templateVars = {
    username: req.session.user_id,
    user: users
  }
  res.render('urls_new', templateVars)
})

app.get('/urls/:id', (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    username: req.session.user_id,
    user:users
  }
  res.render('urls_show', templateVars);
})

app.get('/u/:shortURL', (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL.slice(0, 5) === 'http:' || longURL.slice(0, 6) === 'https:') {
    res.redirect(longURL);
  } else {
    res.redirect('https://' + longURL)
  }
})

app.get('/:id', (req, res) => {
  res.sendStatus(404);
})

app.post('/registration', (req, res) => {
  var NewID = generateRandomString();

  for (var i in users) {
    if (req.body.email === users[i].email) {
      res.send("Email already exists").sendStatus(400)
    } else if (!req.body.email || !req.body.password) {
      res.send("Enter valid Email or Password")
    } else {
      users[NewID] = {};
      users[NewID].id = NewID;
      users[NewID].email = req.body.email;
      users[NewID].password = bcrypt.hashSync(req.body.password, 10);
    }
  }
  res.redirect('/urls');
})

app.post('/urls', (req, res) => {
  var newURL = generateRandomString();
  urlDatabase[newURL] = {};
  urlDatabase[newURL].shortURL = newURL;
  urlDatabase[newURL].longURL = req.body.longURL;
  urlDatabase[newURL].userID = req.session.user_id;
  res.redirect('/urls');
})

app.post('/urls/:id', (req, res) => {
  urlDatabase[req.params.id] = {};
  urlDatabase[req.params.id].shortURL = req.params.id
  urlDatabase[req.params.id].longURL = req.body.longURL;
  urlDatabase[req.params.id].userID = req.session.user_id;
  res.redirect('/urls');
})

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls/');
})

app.post('/login', (req, res) => {
  for (var i in users) {
    if ((req.body.username == users[i].email) && bcrypt.compareSync(req.body.password, users[i].password)) {
      req.session.user_id = users[i].id;
      res.redirect('/urls');
      return;
    }
  }
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  req.session.user_id = null;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`listening on port: ${PORT}`)
});

