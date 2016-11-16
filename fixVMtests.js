const fs = require('fs')
const path = require('path')
const ethUtil = require('ethereumjs-util')
const BN = ethUtil.BN

const paths = [
  path.join(__dirname, '/VMTests/'),
  path.join(__dirname, '/VMTests/RandomTests/')
]

for (const path of paths) {
  processesPath(path)
}

function processesPath (filepath) {
  const files = fs.readdirSync(filepath).filter((file) => file.endsWith('.json'))
  for (const file of files) {
    processFile(path.join(filepath, file))
  }
}

function processFile (fileLoc) {
  const json = require(fileLoc)
  for (const testKey in json) {
    const test = json[testKey]

    if (!test.post) {
      test.post = {}
    }

    const gas = test.exec.gas
    if (gas.slice(0, 2) !== '0x') {
      test.exec.gas = '0x' + ethUtil.padToEven((new BN(gas)).toString(16))
    }

    const gasPrice = test.exec.gasPrice
    if (gasPrice.slice(0, 2) !== '0x') {
      test.exec.gasPrice = '0x' + ethUtil.padToEven((new BN(gasPrice)).toString(16))
    }

    if (test.gas && test.gas.slice(0, 2) !== '0x') {
      test.gas = '0x' + ethUtil.padToEven((new BN(test.gas)).toString(16))
    }

    const number = test.env.currentNumber
    if (number.slice(0, 2) !== '0x') {
      test.env.currentNumber = '0x' + ethUtil.padToEven((new BN(number)).toString(16))
    }

    const diff = test.env.currentDifficulty
    if (diff.slice(0, 2) !== '0x') {
      test.env.currentDifficulty = '0x' + ethUtil.padToEven((new BN(diff)).toString(16))
    }

    const gasLimit = test.env.currentGasLimit
    if (gasLimit.slice(0, 2) !== '0x') {
      test.env.currentGasLimit = '0x' + ethUtil.padToEven((new BN(gasLimit)).toString(16))
    }

    const timestamp = test.env.currentTimestamp
    if (timestamp.slice(0, 2) !== '0x') {
      test.env.currentTimestamp = '0x' + ethUtil.padToEven((new BN(timestamp)).toString(16))
    }

    test.exec.caller = ethUtil.addHexPrefix(test.exec.caller)
    test.exec.origin = ethUtil.addHexPrefix(test.exec.origin)
    test.exec.address = ethUtil.addHexPrefix(test.exec.address)

    for (let address in test.post) {
      const account = test.post[address]
      const storage = account.storage
      for (let key in storage) {
        let val = ethUtil.setLengthLeft(storage[key], 32)
        let updatedKey = ethUtil.setLengthLeft(key, 32)
          // console.log(`${updatedKey.toString('hex')}: ${val.toString('hex')}`)
          // console.log(json[testKey].post[account].storage[key])
        delete storage[key]
        storage['0x' + updatedKey.toString('hex')] = '0x' + val.toString('hex')
          // console.log(json[testKey].post[account].storage[key])
      }
      delete test.post[address]
      test.post[ethUtil.addHexPrefix(address)] = account
    }

    for (let address in test.pre) {
      const account = test.pre[address]
      const storage = account.storage

      const balance = account.balance
      if (balance.slice(0, 2) !== '0x') {
        account.balance = '0x' + ethUtil.padToEven((new BN(balance)).toString(16))
      }

      for (let key in storage) {
        let val = ethUtil.setLengthLeft(storage[key], 32)
        let updatedKey = ethUtil.setLengthLeft(key, 32)
          // console.log(`${updatedKey.toString('hex')}: ${val.toString('hex')}`)
          // console.log(json[testKey].post[account].storage[key])
        delete storage[key]
        storage['0x' + updatedKey.toString('hex')] = '0x' + val.toString('hex')
          // console.log(json[testKey].post[account].storage[key])
      }
      delete test.pre[address]
      test.pre[ethUtil.addHexPrefix(address)] = account
    }
  }
  console.log(fileLoc)
  fs.writeFileSync(fileLoc, JSON.stringify(json, null, 2))
}
