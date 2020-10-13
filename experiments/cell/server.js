const express = require('express');

const fs = require('fs');
const path = require('path');

const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');

const app = express();
const router = express.Router();

const config = require('./webpack.config.js');
const compiler = webpack(config);

// Tell express to use the webpack-dev-middleware and use the webpack.config.js configuration file as a base.
app.use(webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath,
}));

// app.use(express.static(__dirname + '/notebooks'));

app.get('/api/content', (req, res) => {
  fs.readFile(path.resolve(__dirname, 'notebooks', 'hello.ipynb'), (err, json) => {
    const obj = JSON.parse(json);
    res.json(obj);
  });
});

// Serve the files on port 3000.
app.listen(3000, function () {
  console.log('Example app listening on port 3000!\n');
});
