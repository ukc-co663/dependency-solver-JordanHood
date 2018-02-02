const initial = require('../' + process.argv[3])
const _ = require('lodash')
const comparisonOperators = require('../utils/comparisonOperators')
const DependencyGraph = require('./dependencyGraph')
const Q = require('q')
const Installer = module.exports = {}
Installer.execute = async (stateObject) => {
  try {
    Installer.setup(stateObject)
    Installer.buildDependencyTree(stateObject)
    await Installer.buildDependenciesCommands(stateObject)
    return Installer.buildInstallCommands(stateObject)
  } catch(e) {
    throw e
  }
}

Installer.setup = (stateObject) => {
  stateObject.dependencyGraph = new DependencyGraph(stateObject.constraints)
  stateObject.commands = []
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
  let commandPromises = []
  const reducedCommands = _.reduce(stateObject.dependencyGraph.constraints, async (moreComs, constraint) => {
    if(_.get(stateObject, `repository.packages[${constraint.name}]`)) {
      if(initial.indexOf(`${constraint.name}=${constraint.version}`) === -1 && stateObject.commands.indexOf(`${(constraint.install ? '+' : '-')}${constraint.name}=${constraint.version}`) === -1) {
        if (constraint.version === '') {
          let selectedPackage = Installer.filterDependencies(stateObject.repository.packages[constraint.name])
          commandPromises.push(Q.resolve(`${(constraint.install ? '+' : '-')}${constraint.name}=${selectedPackage.version}`))
        } else {
          commandPromises.push(Q.resolve(`${(constraint.install ? '+' : '-')}${constraint.name}=${constraint.version}`))
        }
      }
    }
    return commandPromises
  }, [])
  return Q.all(reducedCommands)
  .then(resolvedCommands => {
    stateObject.commands = stateObject.commands.concat(resolvedCommands)
    return stateObject
  })
}

Installer.buildDependenciesCommands = (stateObject) => {
  const reducedCommands = _.reduce(stateObject.dependencyGraph.constraints, (arrayOne, constraint) => {
    const {dependencies} = constraint
    let commandPromises = []
    _.forEach(dependencies, dep => {
      _.forEach(dep.dependencies, dependency => {
        if (dependency.version === '') {
          let selectedDependency = Installer.filterDependencies(stateObject.repository.packages[dependency.name])
          if (initial.indexOf(`${selectedDependency.name}=${selectedDependency.version}`) === -1 ) {
            commandPromises.push(Q.resolve(`+${selectedDependency.name}=${selectedDependency.version}`))
          }
        } else {
          let selectedDependency = Installer.filterDependenciesOnVersion(dependency, stateObject.repository.packages[dependency.name])
          if (initial.indexOf(`${selectedDependency.name}=${selectedDependency.version}`) === -1 ) {
            commandPromises.push(Q.resolve(`+${selectedDependency.name}=${selectedDependency.version}`))
          }
        }
      })
    })
    return arrayOne.concat(commandPromises)
  }, [])
  return Q.all(reducedCommands)
  .then(resolvedCommands => {
    stateObject.commands = stateObject.commands.concat(_.uniq(resolvedCommands))
    return stateObject
  })
}

Installer.filterDependencies = (dependencies) => {
  return _.reduce(dependencies, (prev, obj, e) => {
    return comparisonOperators['>'](obj.version, prev.version) ? obj : prev
  }, {version: '0'})
}
Installer.filterDependenciesOnVersion = (dependency, repo) => {
  return _.reduce(repo, (e, obj) => {
    const objVersion = (obj.version.indexOf('.') === -1) ? parseInt(obj.version): obj.version
    const depVersion = (dependency.version.indexOf('.') === -1) ? parseInt(dependency.version): dependency.version
    return comparisonOperators[dependency.comparator](objVersion, depVersion) ? obj : e
  }, {version: dependency.version})
}

Installer.resolveConjunctions = (dependencies, constraints, repository) => {
// TODO, or move this to be upfront on inital parse of repo
}
