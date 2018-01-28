const Package = require('./package')

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
}

module.exports = Repository
