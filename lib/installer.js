const initial = require('../' + process.argv[3])
const DependencyGraph = require('./DependencyGraph')
const Installer = module.exports = {}

Installer.execute = (stateObject) => {
  Installer.setup(stateObject)
  Installer.buildDependencyTree(stateObject)
}

Installer.setup = (stateObject) => {
  stateObject.dependencyGraph = new DependencyGraph(stateObject.constraints)
  return stateObject
}

Installer.buildDependencyTree = (stateObject) => {

  for(let dependency in stateObject.dependencyGraph.constraints) {
    const packages = stateObject.repository.packages[dependency]
    if(stateObject.dependencyGraph.constraints[dependency].version === '' ) {
      for(let package in packages) {
        stateObject.dependencyGraph.addDependencies(dependency, packages[package])
      }
    } else {
      const package = packages[stateObject.dependencyGraph.constraints[dependency].version]
      stateObject.dependencyGraph.addDependencies(dependency, package)
    }
  } 
  debugger
  console.log('stateObject.dependencyGraph', stateObject.dependencyGraph)
}