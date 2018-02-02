const initial = require('../' + process.argv[3])
const _ = require('lodash')
const comparisonOperators = require('../utils/comparisonOperators')
const DependencyGraph = require('./dependencyGraph')
const Installer = module.exports = {}
Installer.execute = (stateObject) => {
  try {
    Installer.setup(stateObject)
    Installer.buildDependencyTree(stateObject)
    return Installer.buildInstallCommands(stateObject)
  } catch(e) {
    throw e
  }
}

Installer.setup = (stateObject) => {
  stateObject.dependencyGraph = new DependencyGraph(stateObject.constraints)
  return stateObject
}

Installer.buildDependencyTree = (stateObject) => {
  _.forEach(stateObject.dependencyGraph.constraints, dependency => {
    const packages = stateObject.repository.packages[dependency.name]
    if (dependency.version === '') {
      for (let pkg in packages) {
        stateObject.dependencyGraph.addDependencies(dependency.name, packages[pkg])
      }
    } else {
      const pkg = packages[dependency.version]
      stateObject.dependencyGraph.addDependencies(dependency.name, pkg)
    }
  })
  return stateObject
}

Installer.buildInstallCommands = (stateObject) => {
  let commands = []
  _.forEach(stateObject.dependencyGraph.constraints, constraint => {
    if(_.get(stateObject, `repository.packages[${constraint.name}]`)) {
      if (constraint.dependencies.length !== 0 && initial.indexOf(`${constraint.name}=${constraint.version}`) === -1 && commands.indexOf(`${(constraint.install ? '+' : '-')}${constraint.name}=${constraint.version}`) === -1) {
        // we have deps, lets go through and check them for conjunctions and resolve them
        const {dependencies} = constraint
        console.log('getting deps')
        // RACE CONTITION HERE 
        commands = commands.concat(Installer.buildDependenciesCommands(dependencies, stateObject.repository))
        // need to wait for the above to finish to be able to carry on!!!
        // use the async package? or promises 
      }
      if(initial.indexOf(`${constraint.name}=${constraint.version}`) === -1 && commands.indexOf(`${(constraint.install ? '+' : '-')}${constraint.name}=${constraint.version}`) === -1) {
        console.log('getting constraints')
        if (constraint.version === '') {
          let selectedPackage = Installer.filterDependencies(stateObject.repository.packages[constraint.name])
          console.log('3rd add point adding  ', `${constraint.name}=${constraint.version}`)
          return commands.push(`${(constraint.install ? '+' : '-')}${constraint.name}=${selectedPackage.version}`)
        } else {
          console.log('4th add point adding  ', `${constraint.name}=${constraint.version}`)
          return commands.push(`${(constraint.install ? '+' : '-')}${constraint.name}=${constraint.version}`)
        }
      }
    }
    return commands
  })
  return commands
}

Installer.buildDependenciesCommands = (dependencies, repository) => {
  let commandsTo = []
  console.log('in deps get')
  _.forEach(dependencies, dep => {
    if (dep.conjunctions.length !== 0) {
      // await Installer.resolveConjunctions(dependencies.dependencies, dep.conjunctions, repository)
    }
    // need to add in the case for removing of packages
    dep.dependencies.forEach(dependency => {
      if (dependency.version === '') {
        let selectedDependancy = Installer.filterDependencies(repository.packages[dependency.name])
        if (initial.indexOf(`${selectedDependancy.name}=${selectedDependancy.version}`) === -1 ) {
          console.log('1st add point adding  ', `${selectedDependancy.name}=${selectedDependancy.version}`)
          commandsTo.push(`+${selectedDependancy.name}=${selectedDependancy.version}`)
        }
      } else {
        let selectedDependancy = Installer.filterDependenciesOnVersion(dependency, repository.packages[dependency.name])
        if (initial.indexOf(`${selectedDependancy.name}=${selectedDependancy.version}`) === -1 ) {
          console.log('2nd add point adding  ', `${selectedDependancy.name}=${selectedDependancy.version}`)
          commandsTo.push(`+${selectedDependancy.name}=${selectedDependancy.version}`)
        }
      }
    })
  })
  return commandsTo
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
