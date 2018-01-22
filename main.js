const repository = require('./' + process.argv[2])
// const initial = require('./' + process.argv[3])
// const constraints = require('./' + process.argv[4])

class Dependency {
  constructor (name) {
    this.name = name
  }
}

class Package {
  constructor (name, version, size, dependencies, conflicts){
    this.name = name
    this.version = version
    this.size = size
    this.conflicts = conflicts
    this.buildDependencies(dependencies)
  }

  buildDependencies (dependencies) {
    this.dependencies = dependencies.map(dependency => {
      const deps = []
      for (let dep of dependency) {
        deps.push(new Dependency(dep))
      }
      return deps
    })
  }
}

class Repository {
  constructor (packages) {
    this.packages = {}
    this.buildPackages(packages)
    }

    buildPackages (packages){
      for(let pkg of packages) {
        const {
           name,
           version,
           size,
           depends = [],
           conflicts = []
         } = pkg
         let pkgs = new Package(name, version, size, depends, conflicts)
         this.packages[pkgs.name + '@' + pkgs.version] = pkgs
    }
  }
}

const repo = new Repository(repository)

console.log(repo.packages)