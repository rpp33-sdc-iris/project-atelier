const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const port = 3000;
const { API_URL, API_KEY, SDC_URL } = require('./config.js');

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../client/dist')));

app.all('*', (req, res, next) => {
  // res.header('Access-Control-Allow-Origin", "http://localhost:3000');
  // res.header('Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE');
  // res.header('Content-Type: application/json');
  next();
});

app.all('/*', (req, res) => {

  const apiPaths = ['/products', '/reviews', '/cart', '/interactions'];
  let isApiPath = apiPaths.some(apiPath => req.url.startsWith(apiPath));

  if (req.url.startsWith('/qa')) {
    axios({
      headers: { 'Authorization': API_KEY },
      baseURL: SDC_URL,
      url: req.url,
      method: req.method,
      data: req.body
    })
      .then((apiResponse) => {
        console.log('inside the API response', apiResponse);
        res.send({
          data: apiResponse.data,
          status: apiResponse.status
        });
      })
      .catch((err) => {
        console.log('error in questions', err);
        res.status(err.response.status).send('API request error.');
      });
  }

  if (isApiPath) {
    axios({
      headers: { 'Authorization': API_KEY },
      baseURL: API_URL,
      url: req.url,
      method: req.method,
      data: req.body
    })
      .then((apiResponse) => {
        res.send({
          data: apiResponse.data,
          status: apiResponse.status
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(err.response.status).send('API request error.');
      });

  } else {
    axios({
      headers: { 'Authorization': API_KEY },
      baseURL: API_URL,
      url: `/products${req.url}`,
      method: req.method,
    })
      .then(() => {
        let productID = req.url.substring(1);
        res.redirect(`/?${productID}`);
      })
      .catch((err) => {
        console.log(err);
        // res.redirect('/');
      });
  }
});

app.listen(port, ()=> {
  console.log(`Listening at localhost:${port}`);
});