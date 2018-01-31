const Repository = require('./lib/repository')
const repository = new Repository(require('./' + process.argv[2]))
const constraints = require('./' + process.argv[4])
const installer = require('./lib/installer')

// read constraints and build up base dependancy tree object
// traverse dependancy tree looking for package conflicts and dependayies
// build and return comands array

console.log(installer.execute({repository, constraints}))