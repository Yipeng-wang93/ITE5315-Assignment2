/******************************************************************************
***
*
ITE5315 – Assignment 2
*
I declare that this assignment is my own work in accordance with Humber Academic Policy.
*
No part of this assignment has been copied manually or electronically from any other source
*
(including web sites) or distributed to other students.
*
*
Name: Yipeng Wang Student ID: N01625427 Date: 6.30
*
*
******************************************************************************
**/

/*
D1) On a sacle from 1 to 5, how much did you use generative AI to complete this assignment:

The answer is 2. To be honest, I used AI to help me to answer my issues that I faced, not do the assigenment.
I used it very minimally, but most of the materials are in-class examples that you shown us.

D2) On a scale from 1 to 5, how confident are you in your understanding of the generative AI support you
utilized in this assignment, and your ability to explain it if questioned?

The answer is 4. I can usually understand and explain AI's answers right after asking a
question, and for a while afterward. However, as the prof once said, practice and repetition
are important to make knowledge stick. So, after some time, I may not be able to explain everything
100% clearly. Also, my speaking skills are still a bit limited, which may affect how well I can express
the answer.
*/

// In general, the workflow of handlebars template engine is:
// Client(browser) send the request, then express middleware process the request, 
// then reach out controller(call back function, such as (req,res)=>{…}), 
// then the controller call res.render(hbs path, data), then handlebars template engine will 
// render hbs path(such as filteredData.hbs) and data as HTML, 
// then express will send the response to the client by using res.send().

// import Express framework
var express = require('express');
// Node.js module for file paths
var path = require('path');
// create an Express app object
var app = express();

const fs = require('fs');
// load all of key-value pairs in .env, then add them to the Node.js global object process.env
// dotenv read .env, then inject the content of .env into process.env
require('dotenv').config();
// get HOST and PORT from environment (must be after dotenv.config())
const PORT = process.env.PORT;
const HOST = process.env.HOST;

// import express-handlebars templating engine
const exphbs = require('express-handlebars');

// set up Handlebars with .hbs file extension. and custom helpers
const hbs = exphbs.create({ 
  extname: '.hbs',
  defaultLayout: 'main',
  // if the default directory is partials, we don't have to specify the directory name
  // but if there are more than one partials directories, or not the default partial name(partials)
  // we have to specify the partial directory
  partialsDir: path.join(__dirname, 'views/partials'),
  helpers: {
    // convert a string to uppercase
    uppercase: function (str) {
      return str.toUpperCase();
    },
    // check if the given actors field is a non-empty array, prevent rendering empty actor lists in the template
    hasActors: function (actors) {
      return Array.isArray(actors) && actors.length > 0;
    },
    // check if the given metascore is present and not blank, used to filter out entries with missing metascore.
    hasMetascore: function (metascore) {
      return metascore !== undefined && metascore !== null && metascore.toString().trim() !== '';
    },
    // check if the metascore is either null/empty or explicitly marked as 'N/A'.
    // used to highlight or style rows with invalid or missing metascore. (step 9)
    isNAMetascore: function (metascore) {
      return !metascore || metascore.trim().toLowerCase() === 'n/a';
    }

  }
});

// serve static files (stylesheets, images) from the 'public' folder
// This line tells express to serve static files 
// (images, css) from the public directory. It’s a built-in middleware. For instance, 
// the stylesheet style.css in main.hbs will only load if this middleware is active. 
// If I comment it out, images and css files will not be used, and layout will be broken on the web.
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
// register Handlebars engine with '.hbs' extension
app.engine('hbs', hbs.engine);
// Set Handlebars as the view engine
app.set('view engine', 'hbs');

// This line explicitly tells Express where to look for template (view) files
// It means: “Use the views folder located in the same directory as app.js as the base directory 
// for all .hbs (Handlebars), or other templating engine files.”
// If I don't set it manually, Express tries to find the views directory by default,
// but in many cases (especially in Vercel or subfolder structure), the default path fails.
app.set('views', path.join(__dirname, 'views'));

// route for the homepage (renders index.hbs)
app.get('/', function(req, res) {
  res.render('index', { 
    title: 'Express',
    layout: 'main'
   });
});

// data route
app.get('/data', (req, res) => {
  const filePath = path.join(__dirname, 'movie-dataset-a2/movie-dataset-a2.json');
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      console.error("Reading JSON file wrong!", err);
      return res.status(500).render('error', { title: 'Error', message: 'Logic error loading data.', layout: 'main' });
    }
    const jsonData = JSON.parse(data);
    res.render('data', { layout: 'main', title: 'Movie Data Loaded', message: 'JSON data is loaded and ready!' });
  });
});

// users route
app.get('/users', function(req, res) {
  res.send('respond with a resource');
});

// 
app.get('/data/movie/:index', (req, res) => {
  const index_no = parseInt(req.params.index);
  const filePath = path.join(__dirname, 'movie-dataset-a2/movie-dataset-a2.json');
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      return res.status(500).render('error', { layout: 'main', title: 'Error', message: 'File load error' });
    }
    const movies = JSON.parse(data);
    if (isNaN(index_no) || index_no < 0 || index_no >= movies.length) {
      return res.status(404).render('error', { layout: 'main', title: 'Not Found', message: `No movie at index ${index_no}` });
    }
    const movie = movies[index_no];
    res.render('movie', { layout: 'main', index: index_no, movie });
  });
});

// Search by Id(get form)
app.get('/data/search/id', (req, res) => {
  res.render('searchId', { layout: 'main', title: 'Search by ID' });
});

// search by id(post handler)
app.post('/data/search/id', (req, res) => {
  const input = parseInt(req.body.MovieID);
  const filePath = path.join(__dirname, 'movie-dataset-a2/movie-dataset-a2.json');
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) return res.status(500).render('error', { layout: 'main', title: 'Error', message: 'Data load failed' });
    const movies = JSON.parse(data);
    const movie = movies.find(m => m.Movie_ID === input);
    if (movie) {
      res.render('movie', { layout: 'main', title: 'Search Result', movie });
    } else {
      res.status(404).render('error', { layout: 'main', title: 'Not Found', message: `Movie ID ${input} not found` });
    }
  });
});

//search by title(get form)
app.get('/data/search/title', (req, res) => {
  res.render('searchTitle', { layout: 'main', title: 'Search by Title' });
});

//search by title(post handler)
app.post('/data/search/title', (req, res) => {
  const inputTitle = req.body.MovieTitle.trim().toLowerCase();
  const filePath = path.join(__dirname, 'movie-dataset-a2/movie-dataset-a2.json');
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) return res.status(500).render('error', { layout: 'main', title: 'Error', message: 'Data load failed' });
    const movies =  JSON.parse(data);
    const matched = [];
    for (let i = 0; i < movies.length; i++) {
      const title = movies[i].Title.toLowerCase();
      if (title.includes(inputTitle)) {
        matched.push({
          Movie_ID: movies[i].Movie_ID,
          Title: movies[i].Title,
          Genre: movies[i].Genre,
          Year: movies[i].Year,
          Director: movies[i].Director,
          // make sure Actors are array, for handlebars each using
          Actors: movies[i].Actors
            ? movies[i].Actors.split(',').map(actor => actor.trim())
            : []
        });
      }
    }
    if (matched.length > 0) {
      res.render('results', { layout: 'main', title: 'Search Results', movies: matched });
    } else {
      res.status(404).render('error', { layout: 'main', title: 'Not Found', message: `No movie matches "${req.body.MovieTitle}"` });
    }
  });
});

// Add a new route /allData or /filteredData  to display specific movies in an HTML table
app.get('/allData', (req, res) => {
  const filePath = path.join(__dirname, 'movie-dataset-a2/movie-dataset-a2.json');

  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      return res.status(500).render('error', {
        layout: 'main',
        title: 'Error',
        message: 'Failed to load movie data'
      });
    }

    let movies = JSON.parse(data);

    // Ensure Actors field is an array for each movie
    // if m.Actors is already an array, then remain it.
    // if it is a string, then split it
    // if it is null, then initialize array to an empty array to make sure template will not broken
    movies = movies.map(m => ({
      Movie_ID: m.Movie_ID,
      Title: m.Title,
      Genre: m.Genre,
      Year: m.Year,
      Director: m.Director,
      Metascore: m.Metascore,
      //Actors: m.Actors ? m.Actors.split(',').map(a => a.trim()) : []
      Actors: Array.isArray(m.Actors)
        ? m.Actors //already an array
        : (typeof m.Actors === 'string' && m.Actors.trim().length > 0
            ? m.Actors.split(',').map(actor => actor.trim())
            : [])
    }));

    res.render('allData', {
      layout: 'main',
      title: 'All movie data',
      //title: 'Filtered movie data',
      movies
    });
  });
});

app.get('/filteredDataPug', (req, res) => {
  const filePath = path.join(__dirname, 'movie-dataset-a2/movie-dataset-a2.json');
  // when user visit /filteredDataPug, express will use pug for res.render(). set pug as the default
  // template engine for my express app.
  // Whenever I call res.render('viewName'), Express will assume I am referring to a .pug file.
  app.set('view engine', 'pug');
  // set the directory where express should look for .pug template files
  // By default, Express uses the /views directory, but here I override it to use 
  // the pugViews directory instead.
  app.set('views', path.join(__dirname, 'pugViews'));

  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      return res.status(500).render('error', {
        layout: false,
        title: 'Error',
        message: 'Failed to load movie data'
      });
    }

    let movies = JSON.parse(data);
    movies = movies.map(m => ({
      Movie_ID: m.Movie_ID,
      Title: m.Title,
      Genre: m.Genre,
      Year: m.Year,
      Director: m.Director,
      Metascore: m.Metascore,
      Actors: Array.isArray(m.Actors)
        ? m.Actors
        : (typeof m.Actors === 'string' && m.Actors.trim().length > 0
            ? m.Actors.split(',').map(actor => actor.trim())
            : [])
    }));

    res.render('filteredData', { 
      layout: false,             // pug doesn't use layout of handlebars
      title: 'Filtered movie data (Pug)',
      movies
    });

    // after render by pug, switch back to handlebars render
    app.set('view engine', 'hbs');
    app.set('views', path.join(__dirname, 'views'));
    
  });
});



/* app.get('*', function(req, res) {
  res.render('error', { title: 'Error', message:'Wrong Route', layout: 'main' });
}); */

// catch-all route for undefined paths
app.use(function(req, res) {
  res.status(404).render('error', {
    title: 'Error',
    message: 'Wrong Route',
    layout: 'main'
  });
});

// start server
module.exports = app;
// in node.js, every file is treated as a separate module.
// By using module.exports = app;, I am exporting the xxpress app object from my current file(app.js)
// , so that other files (such as server.js) can import and use it.

/* app.listen(PORT, () => {
  console.log(`Example app listening at http://${HOST}:${PORT}`)
}) */