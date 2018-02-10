const Dependency = require('./dependency')
const utils = require('../utils/utils')
class Package {
  constructor (name, version, size, dependencies = [], conflicts = []) {
    this.name = name
    this.version = version
    this.size = size
    this.dependencies = []
    this.conjunctions = []
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
        for (let dep of dependency) {
          const {
            name,
            version,
            comparator
          } = this.parseDependency(dep)
          this.conjunctions.push(new Dependency(name, version, comparator))
        }
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
    this.dependencies.forEach(dep => {
      console.log('call1')
      const commands = this.resolveDependencies(dep, repo)
      this.addDeps(commands)
      this.resolveDependenciesConflicts(dep, repo)
    })
  }

  resolveDependenciesConflicts (dependency, packages) {
    console.log('call2', dependency.name)
    let dependencyToResolve
    if (dependency.version === '') {
      dependencyToResolve = utils.filterDependencies(packages[dependency.name])
    } else {
      dependencyToResolve = utils.filterDependenciesOnVersion(dependency, packages[dependency.name])
    }
    if (dependencyToResolve.conflicts && dependencyToResolve.conflicts.length !== 0) {
      this.allConflicts = this.allConflicts.concat(dependencyToResolve.conflicts)
    }
    dependencyToResolve.dependencies.forEach(dep => {
      return this.resolveDependenciesConflicts(dep, packages)
    })
  }

  resolveDependencies (dependency, packages, commands = []) {
    let dependencyToResolve
    if (dependency.version === '') {
      dependencyToResolve = utils.filterDependencies(packages[dependency.name])
    } else {
      dependencyToResolve = utils.filterDependenciesOnVersion(dependency, packages[dependency.name])
    }
    if(commands.indexOf(`${dependencyToResolve.name}=${dependencyToResolve.version}`) === -1) {
      commands.push(`${dependencyToResolve.name}=${dependencyToResolve.version}`)
      dependencyToResolve.dependencies.forEach(dep => {
        return this.resolveDependencies(dep, packages, commands)
      })
    }
    return commands
  }
}

module.exports = Package
