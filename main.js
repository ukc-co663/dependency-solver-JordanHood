const repository = require('./' + process.argv[2])
const initial = require('./' + process.argv[3])
// const constraints = require('./' + process.argv[4])
const Repository = require('./lib/repository')

const repo = new Repository(repository)

