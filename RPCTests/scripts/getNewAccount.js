sleep = require('./modules/sleep.js');
var result;
web3.personal.newAccount("123", function(err,res){result = res; console.log(res);})
