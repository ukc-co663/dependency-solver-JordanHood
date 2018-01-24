class Constraint {
  constructor (name, version = '', install) {
    this.name = name
    this.version = version
    this.install = install
    this.dependacies = []
  } 
  addDependencies (dependency) {
    this.dependacies.push(dependency)
  }
}

module.exports = Constraint
