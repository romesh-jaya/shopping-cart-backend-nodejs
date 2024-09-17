// ----------------------------------------------------------------------
// Run this first to provide the required config to other library imports
if (process.env.NODE_ENV === 'production') {
  const dotenv = require('dotenv');
  console.log('Loading dotenv variables');
  dotenv.config();
}
// ----------------------------------------------------------------------

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
//Routes
const productsRoutes = require('./routes/products');
const userRoutes = require('./routes/users');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Following prints queries
mongoose.set('debug', (collectionName, method, query, doc) => {
  const currentTime = new Date();
  console.log(
    `${currentTime.toDateString()} ${currentTime.toLocaleTimeString()} ${collectionName}.${method}`,
    JSON.stringify(query),
    doc
  );
});

mongoose
  .connect(process.env.MONGOENDPOINT)
  .then(() => {
    console.log('Connected to database!');
  })
  .catch(() => {
    console.log('Mongo connection failed, exiting!');
    process.exit(-1);
  });

app.use((_, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE, OPTIONS'
  );
  next();
});

//Introduction message
app.get('/', function (_, res) {
  res.send('Node server is up.');
});

app.use('/products', productsRoutes);
app.use('/users', userRoutes);

module.exports = app;
