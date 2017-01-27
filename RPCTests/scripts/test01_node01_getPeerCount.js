process.stdout.write("TEST_getPeerCountOnNode1 ");
var onResult = {};
web3.net.getPeerCount(function(err, res){ onResult(err, res); })
onResult = function (err,res) 
{
   if (res == 1)
	console.log("OK");
   else
	console.log("FAILED");
   callback(err, res);
}
