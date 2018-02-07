const initial = require('../' + process.argv[3])
const _ = require('lodash')
const comparisonOperators = require('../utils/comparisonOperators')
const utils = require('../utils/utils')
const DependencyGraph = require('./dependencyGraph')
const Installer = module.exports = {}
Installer.execute = (stateObject) => {
  Installer.setup(stateObject)
  Installer.buildDependencyTree(stateObject)
  // await Installer.buildDependenciesCommands(stateObject)
  // return Installer.buildInstallCommands(stateObject)
}

Installer.setup = (stateObject) => {
  stateObject.dependencyGraph = new DependencyGraph(stateObject.constraints)
  stateObject.commands = []
  return stateObject
}

Installer.buildDependencyTree = (stateObject) => {
  _.forEach(stateObject.dependencyGraph.constraints, constraint => {
    const packages = stateObject.repository.packages[constraint.name]
    if (constraint.version === '') {
      // console.log('no version on constraint, lets get the higest version')
      // console.log('packages', packages)
      // find the highest version of the constraint in the repo then resolve deps
      // const selectedPackage = utils.filterDependencies(packages)
      // got the package we want to install
      // console.log('selectedPackage', selectedPackage)
      // for (let pkg in packages) {
        //   stateObject.dependencyGraph.parseAndResolveConstraintPackages(pkg, stateObject.repository)
        // }
    } else {
      // now we have the right package to install, lets set up the deps for it on the selectedPackage object
      // then where to store the selected pkg
      const selectedPackage = utils.filterDependenciesOnVersion(constraint, stateObject.repository.packages[constraint.name])
      selectedPackage.resolvePackageDependencies(stateObject.repository.packages)
      // save selectedPackage some where???
    }
  })
  console.log('dep graph', stateObject.dependencyGraph)
  return stateObject
}

// Installer.buildInstallCommands = (stateObject) => {
//   let commandPromises = []
//   const reducedCommands = _.reduce(stateObject.dependencyGraph.constraints, async (moreComs, constraint) => {
//     if (_.get(stateObject, `repository.packages[${constraint.name}]`)) {
//       if (initial.indexOf(`${constraint.name}=${constraint.version}`) === -1 && stateObject.commands.indexOf(`${(constraint.install ? '+' : '-')}${constraint.name}=${constraint.version}`) === -1) {
//         if (constraint.version === '') {
//           let selectedPackage = utils.filterDependencies(stateObject.repository.packages[constraint.name])
//           commandPromises.push(Q.resolve(`${(constraint.install ? '+' : '-')}${constraint.name}=${selectedPackage.version}`))
//           console.log(`adding 3 ${constraint.name}=${selectedPackage.version} to commands`)
//         } else {
//           commandPromises.push(Q.resolve(`${(constraint.install ? '+' : '-')}${constraint.name}=${constraint.version}`))
//           console.log(`adding 4 ${constraint.name}=${constraint.version} to commands`)
//         }
//       }
//     }
//     return commandPromises
//   }, [])
//   return Q.all(reducedCommands)
//   .then(resolvedCommands => {
//     stateObject.commands = stateObject.commands.concat(resolvedCommands)
//     return stateObject
//   })
// }

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
