const _ = require('lodash')
const comparisonOperators = require('./comparisonOperators')
const Utils = module.exports = {}

Utils.filterDependencies = (dependencies) => {
  return _.reduce(dependencies, (prev, obj, e) => {
    return comparisonOperators['>'](obj.version, prev.version) ? obj : prev
  }, {version: '0'})
}

Utils.filterDependenciesOnVersion = (dependency, repo) => {
  return _.reduce(repo, (e, obj) => {
    const objVersion = (obj.version.indexOf('.') === -1 && e.version.indexOf('.') === -1) ? parseInt(obj.version) : obj.version
    const depVersion = (e.version.indexOf('.') === -1 && obj.version.indexOf('.') === -1 ) ? parseInt(e.version) : e.version
    return comparisonOperators[dependency.comparator](objVersion, depVersion) ? obj : e
  }, {version: dependency.version})
}
