const Package = require('./package')
const _ = require('lodash')
class Repository {
  constructor (packages) {
    this.packages = {}
    this.buildPackages(packages)
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

  solvePackagesOptionalDependencies(constraints) {
    _.forEach(this.packages, element => {
      _.forEach(element, elm => {
        elm.resolveOptionalDependencies(this.packages, constraints)
      })
    })
  }
}

module.exports = Repository
