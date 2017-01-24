function startNode (nodeExec, dataDir, genesisPath, listeningPort) 
{
  var spawn = require('child_process').spawn
  var options = [
    '--private', 'privatechain',
    '-d', dataDir,
    '--config', genesisPath,
    '--ipcpath', dataDir + '/geth.ipc',
    '--ipc',
    '--listen', listeningPort,
    '--test'
  ]
  console.log('starting node')
  console.log(nodeExec + ' ' + options.join(' '))
  var node = spawn(nodeExec, options)
  node.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`)
  })
  node.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`)
  })
  node.on('close', (code) => {
    console.log(`child process exited with code ${code}`)
  })
}

module.exports = startNode
