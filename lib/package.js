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
    this.depsToSolve.forEach(depCollection => {
      const whichToInstall = depCollection.map(depToSolve => {
        let install = false
        if (repo[depToSolve.name]) {
          let packageToResolve
          if (depToSolve.version === '') {
            packageToResolve = utils.filterDependencies(repo[depToSolve.name])
          } else {
            packageToResolve = utils.filterDependenciesOnVersion(depToSolve, repo[depToSolve.name])
          }
          install = constraints.every(constraint => {
            let constraintPackage
            if (constraint.version === '') {
              constraintPackage = utils.filterDependencies(repo[constraint.name])
            } else {
              constraintPackage = utils.filterDependenciesOnVersion(constraint, repo[constraint.name])
            }
            return constraintPackage.conflicts.every(constraintPackageConflict => {
              const conflictPackage = utils.filterDependenciesOnVersion(constraintPackageConflict, repo[constraintPackageConflict.name])
              return !_.isEqual(packageToResolve, conflictPackage)
            })
          })
          if (!install) {
            return install
          }
          if (!_.isEmpty(this.allDeps)) {
            const depConflict = packageToResolve.conflicts.map(conflict => {
              const conflictPackage = utils.filterDependenciesOnVersion(conflict, repo[conflict.name])
              let a = this.allDeps.every(dep => {
                if (dep.name === conflictPackage.name && dep.version === conflictPackage.version) {
                  return false
                }
                return true
              })
              return a
            })[0]
            if (!depConflict) {
              return false
            }
          }
          install = this.dependencies.every(dependency => {
            let dependencyToSolvePackage
            if (dependency.version === '') {
              dependencyToSolvePackage = utils.filterDependencies(repo[dependency.name])
            } else {
              dependencyToSolvePackage = utils.filterDependenciesOnVersion(dependency, repo[dependency.name])
            }
            if (_.isEmpty(dependencyToSolvePackage.conflicts)) {
              return true
            }
            return dependencyToSolvePackage.conflicts.every(conflict => {
              return !_.isEqual(conflict, depToSolve)
            })
          })
          return install
        } else {
          return install
        }
      })
      console.log('whichToInstall', whichToInstall)
      const found = []
      whichToInstall.forEach((toInstall, index) => {
        if (toInstall) {
          found.push(depCollection[index])
        }
      })
      const a = found.reduce((prev, current) => {
        let pkg = {}
        if(current.version === '') {
          pkg  = utils.filterDependencies(repo[current.name])
        } else {
          pkg = utils.filterDependenciesOnVersion(current, repo[current.name])
        }
        return (prev.size < current.size) ? prev : current
      }, {size: 99999999999})
      this.allDeps.push(a)
    })
  }
}

module.exports = Package
