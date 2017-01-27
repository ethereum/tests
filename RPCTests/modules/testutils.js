const fs = require('fs');
var utils = require('./utils.js');
var tests = {};
var testCount = 0;

module.exports = {

generateCustomGenesis: function generateCustomGenesis(path, originalPath, accountName, finished)
{
	var onFileRead = function (err, data) {};
	fs.readFile(originalPath, 'utf8',  (err, data) => { onFileRead (err,data) });

	onFileRead = function (err, data)
	{
	  if (err) 
		throw err;

	  data = data.replace("[ADDRESS]", accountName);
	  fs.writeFile(path, data, (err) => { 
				   if (err) 
					throw err;
				    finished();
				});
	}
},

readTestsInFolder: function readTestsInFolder(path)
{
	var res = utils.listFiles(path);
	res.forEach(function(file) {
		var testn = file.indexOf("test");
		var slashn = file.indexOf("_");
		if (testn != -1 && slashn != -1)
		{
			testNumber = parseInt(file.substring(testn + 4, slashn));
			var noden = file.indexOf("node");
			var slashn = file.indexOf("_", slashn+1);
			var tmpFile = file.indexOf("~");
			if (noden != -1 && slashn != -1 && tmpFile == -1)
			{
				if (tests[testNumber])
					console.log("Error: dublicate test found " + file);
				else
				{
					var testObject = {};
					testObject.file = file;
					testObject.node = file.substring(noden + 4, slashn);
					tests[testNumber] = testObject;
					testCount++;
				}
			}
		}
	});
},

getTestCount: function getTestCount()
{
	return testCount;
},

getTestNumber: function getTestNumber(n)
{
	if(n < testCount);
		return tests[n];
}


}//modules

