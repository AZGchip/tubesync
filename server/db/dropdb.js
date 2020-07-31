const db = require('./config/connection');
db.db.dropCollection('users', function(err, result) {
    if (err){console.log(err)}
    else{ console.log("user data wiped successfully",result)}
});