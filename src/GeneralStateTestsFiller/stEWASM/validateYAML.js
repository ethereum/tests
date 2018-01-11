const YamlValidator = require("yaml-validator")
const glob = require("glob")
const process = require("process")
 
// Default options 
const options = {
  log: false,
  structure: false,
  yaml: false,
  writeJson: false
};
 
glob("**.*yml", (err, files) => {
  if (err) {
    console.log(err)
    process.exit(-1)
  }
   
  const validator = new YamlValidator(options);
  validator.validate(files);
  validator.report();
})
