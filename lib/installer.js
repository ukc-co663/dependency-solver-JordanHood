const initial = require('../' + process.argv[3])
const _ = require('lodash')
const comparisonOperators = require('../utils/comparisonOperators')
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
        await Installer.buildDependenciesCommands(dependencies, stateObject.repository)
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

Installer.buildDependenciesCommands = (dependencies, repository) => {
  let commandsTo = []
  new Promise((resolve, reject) => {
    try {
      dependencies.forEach(async dep => {
        if (dep.conjunctions.length !== 0) {
          // await Installer.resolveConjunctions(dependencies.dependencies, dep.conjunctions, repository)
        }
        dep.dependencies.forEach(dependency => {
          if (dependency.version === '') {
            let selectedDependancy = Installer.filterDependencies(repository.packages[dependency.name])
            commandsTo.push(`+${selectedDependancy.name}=${selectedDependancy.version}`)
          } else {
            let selectedDependancy = Installer.filterDependenciesOnVersion(dependency, repository.packages[dependency.name])
            commandsTo.push(`+${selectedDependancy.name}=${selectedDependancy.version}`)
          }
        })
        return resolve(commandsTo)
      })
    } catch (e) {
      return reject(e)
    }
  })
}

Installer.filterDependencies = (dependencies) => {
  return _.reduce(dependencies, (prev, obj, e) => {
    return comparisonOperators['>'](obj.version, prev.version) ? obj : prev
  }, {version: '0'})
}
Installer.filterDependenciesOnVersion = (dependency, repo) => {
  return _.reduce(repo, (e, obj) => {
    return comparisonOperators[dependency.comparator](obj.version, dependency.version) ? obj : e
  }, {version: '0'})
}

Installer.resolveConjunctions = (dependencies, constraints, repository) => {
// TODO, or move this to be upfront on inital parse of repo
}
