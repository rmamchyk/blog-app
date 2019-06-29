const express = require('express');

const app = express();

app.post('/track-data', (req, res) => {
  //Here we can store the data to a real database
  //because this is an Express server where we can write any server-side logic
  console.log('Tracking data:', req.body.data);
  res.status(200).json({message: 'Success!'});
});

module.exports = {
  path: '/api',
  handler: app
};

