const initial = require('../' + process.argv[3])
const DependencyGraph = require('./DependencyGraph')
const Installer = module.exports = {}
Installer.execute = async (stateObject) => {
  await Installer.setup(stateObject)
  await Installer.buildDependencyTree(stateObject)
  return Installer.buildInstallCommands(stateObject)
}

Installer.setup = (stateObject) => {
  new Promise((resolve, reject) => {
    stateObject.dependencyGraph = new DependencyGraph(stateObject.constraints)
    return resolve(stateObject)
  })
}

Installer.buildDependencyTree = (stateObject) => {
  new Promise((resolve, reject) => {
    for (let dependency in stateObject.dependencyGraph.constraints) {
      const packages = stateObject.repository.packages[dependency]
      if (stateObject.dependencyGraph.constraints[dependency].version === '') {
        for (let pkg in packages) {
          stateObject.dependencyGraph.addDependencies(dependency, packages[pkg])
        }
      } else {
        const pkg = packages[stateObject.dependencyGraph.constraints[dependency].version]
        stateObject.dependencyGraph.addDependencies(dependency, pkg)
      }
    }
    return resolve(stateObject)
  })
}

Installer.buildInstallCommands = (stateObject) => {
  new Promise((resolve, reject) => {
    let commands = []
    for (let constraint in stateObject.dependencyGraph.constraints) {
      constraint = stateObject.dependencyGraph.constraints[constraint]
      if (constraint.dependencies.length !== 0) {
        const {dependencies} = constraint
        console.log('dependencies', dependencies[0].dependencies)
      }
      if (constraint.version === '') {
        commands.push(`+${constraint.name}`)
        console.log('commands', commands)
      } else {
        commands.push(`${(constraint.install ? '+' : '-')}${constraint.name}=${constraint.version}`)
        console.log('commands', commands)
      }
    }
    return resolve(commands)
  })
}

// Installer.buildDependacys things recurse

Installer.resolvePackageConflicts = (stateObject) => {

}
