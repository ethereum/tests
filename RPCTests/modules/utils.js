const fs = require('fs');
function sleep(ms) {
   return new Promise(resolve => setTimeout(resolve, ms));
 }

module.exports = {

 sleep: function sleep(ms) {
   return new Promise(resolve => setTimeout(resolve, ms));
 },


 mkdir: function mkdir(path, callback, arg) {
  try {
    fs.mkdirSync(path);
  } catch(e) {
    if ( e.code != 'EEXIST' ) throw e;
  }
  callback(arg);
 },

 rmdir: function rmdir(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        rmdir(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
 },

 readFile: function readFile(path, callback) {
    fs.readFile(path, 'utf8',  (err, data) => { callback (err, data) });
 },

 writeFile: function writeFile(path, data) {
   fs.writeFile(path, data, (err) => { if (err) throw err;});
 }
}

