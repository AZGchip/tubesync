const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://<TestUser>:<pizapang00s>@ds243717.mlab.com:43717/heroku_wq0gmp8f', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: true,
});

module.exports = mongoose.connection;
//  
// 'mongodb://localhost/googlebooks'