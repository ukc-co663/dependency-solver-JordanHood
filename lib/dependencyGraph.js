const Constraint = require('./constraint')
class DependencyGraph {
  constructor (constraints) {
    this.constraints = []
    this.buildConstraint(constraints)
  }

  buildConstraint (constraints) {
    for (let constraint of constraints) {
      const symbol = constraint.substring(0, 1)
      let install = false
      install = (symbol === '+')
      const {
        name,
        version,
        comparator
      } = this.parseConstraint(constraint)
      this.constraints.push(new Constraint(name, version, comparator, install))
    }
  }

  parseConstraint (constraint) {
    // can this be reduced down?? (probally)
    let comparator, version, name
    const symbol = constraint.substring(0, 1)
    if (constraint.indexOf('>=') !== -1) {
      const index = constraint.indexOf('>=')
      comparator = constraint.substring(index, index + 2)
      name = constraint.substring(constraint.indexOf(symbol) + 1, index)
      version = constraint.substring(index + 2)
      return {
        name,
        version,
        comparator
      }
    } else if (constraint.indexOf('<=') !== -1) {
      const index = constraint.indexOf('<=')
      comparator = constraint.substring(index, index + 2)
      name = constraint.substring(constraint.indexOf(symbol) + 1, index)
      version = constraint.substring(index + 2)
      return {
        name,
        version,
        comparator
      }
    } else if (constraint.indexOf('=') !== -1) {
      const index = constraint.indexOf('=')
      comparator = constraint.substring(index, index + 1)
      name = constraint.substring(constraint.indexOf(symbol) + 1, index)
      version = constraint.substring(index + 1)
      return {
        name,
        version,
        comparator
      }
    } else if (constraint.indexOf('>') !== -1) {
      const index = constraint.indexOf('>')
      comparator = constraint.substring(index, index + 1)
      name = constraint.substring(constraint.indexOf(symbol) + 1, index)
      version = constraint.substring(index + 1)
      return {
        name,
        version,
        comparator
      }
    } else if (constraint.indexOf('<') !== -1) {
      const index = constraint.indexOf('<')
      comparator = constraint.substring(index, index + 1)
      name = constraint.substring(constraint.indexOf(symbol) + 1, index)
      version = constraint.substring(index + 1)
      return {
        name,
        version,
        comparator
      }
    } else {
      return {
        name: constraint.substring(constraint.indexOf(symbol) + 1, constraint.length),
        version,
        comparator
      }
    }
  }

  addDependencies (name, dependency) {
    this.constraints[name].addDependencies(dependency)
  }
}

module.exports = DependencyGraph
