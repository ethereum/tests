var exec = require('child_process').exec;

var utils = require('./modules/utils.js');
var startNode = require('./modules/startnode.js');

var ethpath = '/home/wins/Ethereum/cpp-ethereum/build/eth/eth';
var testdir = process.env.ETHEREUM_TEST_PATH + "/RPCTests/dynamic";

var async = require("./modules/async");

function cb(err, data)
{
console.log(data);
}

function main(goto, args)
{

async.series([
function(cb) { utils.readFile('./scripts/genesis.json', cb); },
function(cb) { cb(); console.log("as2"); },
function(cb) { cb(); console.log("as3"); }
], function() { console.log("as4") })

/*utils.sleep(2000).then(() => {
     console.log('Result: ');
});*/

/*switch(goto)
{
case 1:	utils.mkdir('./dynamic', main, 2); break;
case 2:	utils.readFile('./scripts/genesis.json', main, 3); break;
case 3:	console.log(args); break;
}*/


//utils.writeFile('./dynamic/genesis.json', data, (err) => { if (err) throw err;});
//startNode(ethpath, testdir + "/ethnode1", testdir + "/genesis.json", 30305);
}

/*var callback1 = function (err, data) {};
fs.readFile('./scripts/genesis.json', 'utf8',  (err, data) => { callback1 (err,data) });
startNode = require('./modules/startnode.js');



callback1 = function (err, data)
{
  if (err) throw err;
  data = data.replace("[ADDRESS]", "0x112233445566778899");
  mkdir('./dynamic');
  fs.writeFile('./dynamic/genesis.json', data, (err) => { if (err) throw err;});


   exec('pwd', function callback(error, stdout, stderr){  
	dir = stdout; 
	startNode(ethpath, 'privatechain', testdir + "/ethnode1", 30305);
   });
  
  //rmdir('./dynamic');
}*/


main(1);


