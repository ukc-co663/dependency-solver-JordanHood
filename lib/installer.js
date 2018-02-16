const initial = require('../' + process.argv[3])
const _ = require('lodash')
const comparisonOperators = require('../utils/comparisonOperators')
const utils = require('../utils/utils')
const DependencyGraph = require('./dependencyGraph')
const Installer = module.exports = {}
Installer.execute = (stateObject) => {
  Installer.setup(stateObject)
  Installer.buildDependencyTree(stateObject)
  Installer.buildInstallCommands(stateObject)
  return stateObject
}

Installer.setup = (stateObject) => {
  stateObject.dependencyGraph = new DependencyGraph(stateObject.constraints)
  stateObject.commands = []
  return stateObject
}

Installer.buildDependencyTree = (stateObject) => {
  stateObject.resolvedPackages = []
  // need to check if package to install is in repo
  _.forEach(stateObject.dependencyGraph.constraints, constraint => {
    const packages = stateObject.repository.packages[constraint.name]
    if (constraint.version === '') {
      const selectedPackage = utils.filterDependencies(packages)
      selectedPackage.resolvePackageDependencies(stateObject.repository.packages)
      selectedPackage.constraintData = constraint
      stateObject.resolvedPackages.push(selectedPackage)
    } else {
      const selectedPackage = utils.filterDependenciesOnVersion(constraint, stateObject.repository.packages[constraint.name])
      selectedPackage.resolvePackageDependencies(stateObject.repository.packages)
      selectedPackage.constraintData = constraint
      stateObject.resolvedPackages.push(selectedPackage)
    }
  })
  return stateObject
}

Installer.buildInstallCommands = (stateObject) => {
  const reducedCommands = _.reduce(stateObject.resolvedPackages, (commands, packageToInstall) => {
    _.forEach(packageToInstall.allConflicts, conflict => {
      const conflictPackage = utils.filterDependenciesOnVersion(conflict, stateObject.repository.packages[conflict.name])
      const conflictString = `${conflictPackage.name}=${conflictPackage.version}`
      if(initial.indexOf(conflictString) !== -1) {
        commands.push(`-${conflictString}`)
      }
    })
    _.forEachRight(packageToInstall.allDeps, dep => {
      const depString = `${(packageToInstall.constraintData.install) ? '+' : '-'}${dep}`
      if (initial.indexOf(dep) === -1 && commands.indexOf(depString) === -1) {
        // console.log('adding as sub', depString)
        commands.push(depString)
      }
    })
    const depString = `${(packageToInstall.constraintData.install) ? '+' : '-'}${packageToInstall.name}=${packageToInstall.version}`
    if (commands.indexOf(depString) === -1) {
      // console.log('adding as main', depString)
      commands.push(depString)
    }
    return commands
  }, [])
  stateObject.commands = stateObject.commands.concat(reducedCommands)
  return stateObject
}

// Installer.buildDependenciesCommands = (stateObject) => {
//   const reducedCommands = _.reduce(stateObject.dependencyGraph.constraints, (arrayOne, constraint) => {
//     const {dependencies} = constraint
//     let commandPromises = []
//     _.forEach(dependencies, dep => {
//       _.forEach(dep.dependencies, dependency => {
//         if (dependency.version === '') {
//           let selectedDependency = utils.filterDependencies(stateObject.repository.packages[dependency.name])
//           if (initial.indexOf(`${selectedDependency.name}=${selectedDependency.version}`) === -1) {
//             console.log(`adding 1 ${selectedDependency.name}=${selectedDependency.version} to commands`)
//             commandPromises.push(Q.resolve(`+${selectedDependency.name}=${selectedDependency.version}`))
//           }
//         } else {
//           let selectedDependency = utils.filterDependenciesOnVersion(dependency, stateObject.repository.packages[dependency.name])
//           if (initial.indexOf(`${selectedDependency.name}=${selectedDependency.version}`) === -1) {
//             console.log(`adding 2 ${selectedDependency.name}=${selectedDependency.version} to commands`)
//             commandPromises.push(Q.resolve(`+${selectedDependency.name}=${selectedDependency.version}`))
//           }
//         }
//       })
//     })
//     return arrayOne.concat(commandPromises)
//   }, [])
//   return Q.all(reducedCommands)
//   .then(resolvedCommands => {
//     stateObject.commands = stateObject.commands.concat(_.uniq(resolvedCommands))
//     return stateObject
//   })
// }

// Installer.resolveConjunctions = (dependencies, constraints, repository) => {
// // TODO, or move this to be upfront on inital parse of repo
// }
