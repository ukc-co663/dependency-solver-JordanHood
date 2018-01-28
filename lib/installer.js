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
  new Promise(async (resolve, reject) => {
    let commands = []
    for (let constraint in stateObject.dependencyGraph.constraints) {
      constraint = stateObject.dependencyGraph.constraints[constraint]
      if (constraint.dependencies.length !== 0) {
        // we have deps, lets go through and check them for conjunctions and resolve them
        const {dependencies} = constraint
        await Installer.buildDependenciesCommands(dependencies)
      }
      if (constraint.version === '') {
        commands.push(`${(constraint.install ? '+' : '-')}${constraint.name}`)
      } else {
        commands.push(`${(constraint.install ? '+' : '-')}${constraint.name}=${constraint.version}`)
      }
    }
    return resolve(commands)
  })
}

// Installer.buildDependacys things recurse

Installer.buildDependenciesCommands = (dependencies) => {
  new Promise((resolve, reject) => {
    dependencies.map(dep => {
      console.log(dep)
      dep.map(d => {
        console.log(d)
      })
    })
  })
}
