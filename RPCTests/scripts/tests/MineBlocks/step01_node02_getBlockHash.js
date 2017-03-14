process.stdout.write("TEST_getBlockHashOnNode2 ");

var onResult = {};
web3.eth.getBlock("latest", function(err, res){  onResult(err, res); })

onResult = function (err,res) 
{
	if (res.hash == args["node1_lastblock"].hash)	
		console.log("OK");
	   else
		console.log("FAILED");
	callback(err, res);
}

