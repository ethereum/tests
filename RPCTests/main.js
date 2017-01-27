//requires installed node v6
//requires ETHEREUM_TEST_PATH env variable set  (for full path to the ipc sockets)
//requires ethereum eth path

var async = require("./modules/async");
var utils = require('./modules/utils.js');
var testutils = require('./modules/testutils.js');
var ethconsole = require('./modules/ethconsole.js');

var ethpath = '/home/wins/Ethereum/cpp-ethereum/build/eth/eth';
var testdir = process.env.ETHEREUM_TEST_PATH + "/RPCTests/dynamic";

var dynamic = {};

function cb(){}
function main()
{

testutils.readTestsInFolder("./scripts");
async.series([
function(cb) {
	utils.setDebug(false);
	ethconsole.startNode(ethpath, testdir + "/ethnode1", testdir + "/genesis.json", 30305, cb);
},
function(cb) {
	prepareDynamicVars(cb);
},
function(cb) {
	ethconsole.stopNode(testdir + "/ethnode1", cb);
},
function(cb) {
	ethconsole.startNode(ethpath, testdir + "/ethnode1", testdir + "/genesis.json", 30305, cb);
	dynamic["node1_port"] = "30305";
},
function(cb) {
	ethconsole.startNode(ethpath, testdir + "/ethnode2", testdir + "/genesis.json", 30306, cb);
	dynamic["node2_port"] = "30306";
},
function(cb) {
	runAllTests(cb);	
},
function(cb) {
	ethconsole.stopNode(testdir + "/ethnode1", cb);
	ethconsole.stopNode(testdir + "/ethnode2", cb);
}
], function() { 
	utils.rmdir(testdir); }
)
}//main



function prepareDynamicVars(finished)
{
  async.series([
	function(cb) {
		ethconsole.runScriptOnNode(testdir + "/ethnode1", "./scripts/testNewAccount.js", {}, cb);
	},
	function(cb) {
		dynamic["account"] = ethconsole.getLastResponse();
		utils.mkdir(testdir);
		testutils.generateCustomGenesis(testdir + '/genesis.json', "./scripts/genesis.json", dynamic["account"], cb);
	},
	function(cb) {
		ethconsole.runScriptOnNode(testdir + "/ethnode1", "./scripts/getNodeInfo.js", {}, cb);
	},
	function(cb) {
		dynamic["node1_ID"] = ethconsole.getLastResponse().id;
		cb();
	}
  ], function() { finished(); })
}

function runAllTests(finished)
{
	var currentTest = -1;
	var updateDynamic = function(){};

	function nextTest()
	{
	   currentTest++;
	   if (currentTest == testutils.getTestCount())
		finished();
	   else
	   {
		var testObject = testutils.getTestNumber(currentTest);
		var nodepath;
		if (testObject.node == '01')
			nodepath = testdir + "/ethnode1";
		if (testObject.node == '02')
			nodepath = testdir + "/ethnode2";

		ethconsole.runScriptOnNode(nodepath, testObject.file, dynamic, updateDynamic);
	   }
	}

	updateDynamic = function updateDynamic()
	{
		async.series([
			function(cb) {
				ethconsole.runScriptOnNode(testdir + "/ethnode1", "./scripts/getLastBlock.js", {}, cb);
			},
			function(cb) {
				dynamic["node1_lastblock"] = ethconsole.getLastResponse();
				cb();
			},
			function(cb) {
				ethconsole.runScriptOnNode(testdir + "/ethnode2", "./scripts/getLastBlock.js", {}, cb);
			},
			function(cb) {
				dynamic["node2_lastblock"] = ethconsole.getLastResponse();
				cb();
			}
	    	], function() { nextTest(); });
	}
	nextTest();
}

main();
