const Constraint = require('./constraint')
class DependencyGraph {
  constructor (constraints) {
    this.constraints = {}
    this.buildConstraint(constraints)
  }
  buildConstraint (constraints) {
    for (let constraint of constraints) {
      const symbol = constraint.substring(0, 1)
      let install = false
      let version
      let name
      install = (symbol === '+')
      if (constraint.indexOf('=') !== -1) {
        name = constraint.substring(constraint.indexOf(symbol) + 1, constraint.indexOf('='))
        version = constraint.substring(constraint.indexOf('=') + 1)
      } else {
        name = constraint.substring(constraint.indexOf(symbol) + 1)
      }
      this.constraints[name] = (new Constraint(name, version, install))
    }
  }

  addDependencies (name, dependency) {
    this.constraints[name].addDependencies(dependency)
  }
}

module.exports = DependencyGraph
