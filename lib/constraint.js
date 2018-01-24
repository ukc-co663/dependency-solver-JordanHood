class Constraint {
  constructor (name, version = '', install) {
    this.name = name
    this.version = version
    this.install = install
    this.dependencies = []
  } 
  addDependencies (dependency) {
    this.dependencies.push(dependency)
  }
}

module.exports = Constraint
