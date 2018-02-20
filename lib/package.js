const Dependency = require('./dependency')
const utils = require('../utils/utils')
const _ = require('lodash')
class Package {
  constructor (name, version, size, dependencies = [], conflicts = []) {
    this.name = name
    this.version = version
    this.size = size
    this.dependencies = []
    this.depsToSolve = []
    this.allDeps = []
    this.allConflicts = []
    this.buildConflicts(conflicts)
    this.buildDependencies(dependencies)
  }

  buildDependencies (dependencies) {
    dependencies.map(dependency => {
      if (dependency.length === 1) {
        const {
          name,
          version,
          comparator
        } = this.parseDependency(dependency[0])
        this.dependencies.push(new Dependency(name, version, comparator))
      } else {
        const depsToSolve = []
        for (let dep of dependency) {
          const {
            name,
            version,
            comparator
          } = this.parseDependency(dep)
          depsToSolve.push(new Dependency(name, version, comparator))
        }
        this.depsToSolve.push(depsToSolve)
      }
    })
  }

  buildConflicts (conflicts) {
    this.conflicts = conflicts.map(conflict => {
      const {
        name,
        version,
        comparator
      } = this.parseDependency(conflict)
      return new Dependency(name, version, comparator)
    })
  }

  parseDependency (dependency) {
    // can this be reduced down?? (probally)
    let comparator, version, name
    if (dependency.indexOf('>=') !== -1) {
      const index = dependency.indexOf('>=')
      comparator = dependency.substring(index, index + 2)
      name = dependency.substring(0, index)
      version = dependency.substring(index + 2)
      return {
        name,
        version,
        comparator
      }
    } else if (dependency.indexOf('<=') !== -1) {
      const index = dependency.indexOf('<=')
      comparator = dependency.substring(index, index + 2)
      name = dependency.substring(0, index)
      version = dependency.substring(index + 2)
      return {
        name,
        version,
        comparator
      }
    } else if (dependency.indexOf('=') !== -1) {
      const index = dependency.indexOf('=')
      comparator = dependency.substring(index, index + 1)
      name = dependency.substring(0, index)
      version = dependency.substring(index + 1)
      return {
        name,
        version,
        comparator
      }
    } else if (dependency.indexOf('>') !== -1) {
      const index = dependency.indexOf('>')
      comparator = dependency.substring(index, index + 1)
      name = dependency.substring(0, index)
      version = dependency.substring(index + 1)
      return {
        name,
        version,
        comparator
      }
    } else if (dependency.indexOf('<') !== -1) {
      const index = dependency.indexOf('<')
      comparator = dependency.substring(index, index + 1)
      name = dependency.substring(0, index)
      version = dependency.substring(index + 1)
      return {
        name,
        version,
        comparator
      }
    } else {
      return {
        name: dependency,
        version,
        comparator
      }
    }
  }

  addDeps (dep) {
    this.allDeps = this.allDeps.concat(dep)
  }
  addConflicts (conflicts) {
    this.allConflicts = this.allConflicts.concat(conflicts)
  }

  resolvePackageDependencies (repo) {
    const commands = []
    this.dependencies.forEach(dep => {
      this.resolveDependencies(dep, repo, commands)
      this.resolveDependenciesConflicts(dep, repo)
    })
    this.addDeps(commands)
  }

  resolveDependenciesConflicts (dependency, packages) {
    let dependencyToResolve
    if (dependency.version === '') {
      dependencyToResolve = utils.filterDependencies(packages[dependency.name])
    } else {
      dependencyToResolve = utils.filterDependenciesOnVersion(dependency, packages[dependency.name])
    }
    if (dependencyToResolve.conflicts.some(r => this.allConflicts.indexOf(r) === -1)) {
      if (dependencyToResolve.conflicts && dependencyToResolve.conflicts.length !== 0) {
        this.allConflicts = this.allConflicts.concat(dependencyToResolve.conflicts)
      }
      dependencyToResolve.dependencies.forEach(dep => {
        return this.resolveDependenciesConflicts(dep, packages)
      })
    }
  }

  resolveDependencies (dependency, packages, commands = []) {
    let dependencyToResolve
    if (dependency.version === '') {
      dependencyToResolve = utils.filterDependencies(packages[dependency.name])
    } else {
      dependencyToResolve = utils.filterDependenciesOnVersion(dependency, packages[dependency.name])
    }
    if (commands.indexOf(`${dependencyToResolve.name}=${dependencyToResolve.version}`) === -1) {
      commands.push(`${dependencyToResolve.name}=${dependencyToResolve.version}`)
      dependencyToResolve.dependencies.forEach(dep => {
        return this.resolveDependencies(dep, packages, commands)
      })
    }
    return commands
  }

  resolveOptionalDependencies (repo, constraints) {
    /**
     * so for each of the depsToSolve get the package of the repo
     * check if the package is in the repo
     * if the package has no conflicts mark as safe to install
     * if the package has conflicts see if they will conflict with any other package and dep being installed
     * if more than 1 are marked as safe, choose one with the smallest overall size
     * else install the one marked as safe
     * push selected one to this.allDeps
     */
    this.depsToSolve.forEach(depCollection => {
      const whichToInstall = depCollection.map(depToSolve => {
        let install = false
        if(repo[depToSolve.name]) {
          let packageToResolve
          if (depToSolve.version === '') {
            packageToResolve = utils.filterDependencies(repo[depToSolve.name])
          } else {
            packageToResolve = utils.filterDependenciesOnVersion(depToSolve, repo[depToSolve.name])
          }
          install = constraints.every(constraint => {
            const constraintPackage = utils.filterDependenciesOnVersion(constraint, repo[constraint.name])
            return constraintPackage.conflicts.every(constraintPackageConflict => {
              const conflictPackage = utils.filterDependenciesOnVersion(constraintPackageConflict, repo[constraintPackageConflict.name])
              console.log(`got conf res on ${packageToResolve.name}`)
              return !_.isEqual(packageToResolve, conflictPackage)
            })
          })
          console.log(`install`, install)
          // console.log('packageToResolve', packageToResolve)
          //if yes return false imadiloty, no point carring on the check,
          debugger
          // if ( _.isEmpty(packageToResolve.allConflicts)) {
          //   // we have no conflicts, we can install
          //   install = true
          // }

          // so we have conflicts, lets inspect them
          // allConflicts is array of deps
          return install
        } else {
          return install
        }
      })
      console.log('whichToInstall', whichToInstall)
    })
    // console.log('depsto solve', this.depsToSolve)
  }
}

module.exports = Package
