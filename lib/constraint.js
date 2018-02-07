class Constraint {
  constructor (name, version = '', comparator, install) {
    this.name = name
    this.version = version
    this.install = install
    this.comparator = comparator
    this.dependencies = []
  }
  addDependencies (dependency) {
    this.dependencies.push(dependency)
  }
}

module.exports = Constraint
