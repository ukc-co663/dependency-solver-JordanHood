const Package = require('./package')
const _ = require('lodash')
const utils = require('../utils/utils')
class Repository {
  constructor (packages) {
    this.packages = {}
    this.buildPackages(packages)
    this.parseAndResolvePackages(this.packages)
  }
  // need to do the same for conflicts and options deps
  parseAndResolvePackages (packages) {
    _.forEach(packages, version => {
      _.forEach(version, pkg => {
        pkg.dependencies.forEach(dep => {
          const allDeps = this.resolvePackageDependencies(dep, packages)
          pkg.addDeps(allDeps)
          const allConflicts = this.resolveDependenciesConflicts(dep, packages)
          pkg.addConflicts(allConflicts)
        })
      })
    })
  }

  resolveDependenciesConflicts (dependency, packages, conflicts = []) { 
    let dependencyToResolve
    if (dependency.version === '') {
      dependencyToResolve = utils.filterDependencies(packages[dependency.name])
    } else  {
      dependencyToResolve = utils.filterDependenciesOnVersion(dependency, packages[dependency.name])
    }
    dependencyToResolve.conflicts.forEach(conflict => {
      conflicts.push(conflict)
    })
    return conflicts
  }

  resolvePackageDependencies (dependency, packages, commands = []) { 
    let dependencyToResolve
    if (dependency.version === '') {
      dependencyToResolve = utils.filterDependencies(packages[dependency.name])
    } else  {
      dependencyToResolve = utils.filterDependenciesOnVersion(dependency, packages[dependency.name])
    }
    commands.push(`${dependencyToResolve.name}=${dependencyToResolve.version}`)
    dependencyToResolve.dependencies.forEach(dep => {
      return this.resolvePackageDependencies(dep, packages, commands)
    })
    return commands
  }

  buildPackages (packages) {
    for (let pkg of packages) {
      const {
          name,
          version,
          size,
          depends = [],
          conflicts = []
        } = pkg
      let pkgs = new Package(name, version, size, depends, conflicts)
      if (!this.packages[pkgs.name]) {
        this.packages[pkgs.name] = {
          [pkgs.version]: pkgs
        }
      } else {
        this.packages[pkgs.name][pkgs.version] = pkgs
      }
    }
  }

  
}

module.exports = Repository
