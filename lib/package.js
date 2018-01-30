const Dependency = require('./dependency')
class Package {
  constructor (name, version, size, dependencies = [], conflicts = []) {
    this.name = name
    this.version = version
    this.size = size
    this.dependencies = []
    this.conjunctions = []
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
}

module.exports = Package
