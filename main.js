const Repository = require('./lib/repository')
const repository = new Repository(require('./' + process.argv[2]))
const constraints = require('./' + process.argv[4])
const installer = require('./lib/installer')

// check that the dep exists In the repo, as well as the version 
// get competitors working on constraints
// build and check the initial json for what is installed and alter as such

// and test like hell

// and deal with conflict managment

// c.f. man, on init if conflicts go through each package deps and pick out conflicts, compare to main pkg deps and resolve

// cyclic deps need to lookino
console.log(installer.execute({repository, constraints}))

