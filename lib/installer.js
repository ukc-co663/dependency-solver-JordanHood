const initial = require('../' + process.argv[3])
const DependencyGraph = require('./DependencyGraph')
const Installer = module.exports = {}
Installer.execute = async (stateObject) => {
  await Installer.setup(stateObject)
  await Installer.buildDependencyTree(stateObject)
  return Installer.buildInstallCommands(stateObject)
}

Installer.setup = (stateObject) => {
  new Promise((resolve, reject) => {
    stateObject.dependencyGraph = new DependencyGraph(stateObject.constraints)
    return resolve(stateObject)
  })
}

Installer.buildDependencyTree = (stateObject) => {
  new Promise((resolve, reject) => {
    for (let dependency in stateObject.dependencyGraph.constraints) {
      const packages = stateObject.repository.packages[dependency]
      if (stateObject.dependencyGraph.constraints[dependency].version === '') {
        for (let pkg in packages) {
          stateObject.dependencyGraph.addDependencies(dependency, packages[pkg])
        }
      } else {
        const pkg = packages[stateObject.dependencyGraph.constraints[dependency].version]
        stateObject.dependencyGraph.addDependencies(dependency, pkg)
      }
    }
    return resolve(stateObject)
  })
}

Installer.buildInstallCommands = (stateObject) => {
  new Promise(async (resolve, reject) => {
    let commands = []
    for (let constraint in stateObject.dependencyGraph.constraints) {
      constraint = stateObject.dependencyGraph.constraints[constraint]
      if (constraint.dependencies.length !== 0) {
        // we have deps, lets go through and check them for conjunctions and resolve them
        const {dependencies} = constraint
        await Installer.buildDependenciesCommands(dependencies, stateObject.repository)
      }
      if (constraint.version === '') {
        commands.push(`${(constraint.install ? '+' : '-')}${constraint.name}`)
      } else {
        commands.push(`${(constraint.install ? '+' : '-')}${constraint.name}=${constraint.version}`)
      }
    }
    return resolve(commands)
  })
}

// Installer.buildDependacys things recurse

Installer.buildDependenciesCommands = (dependencies, repository) => {
  let commandsTo = []
  new Promise((resolve, reject) => {
    try {
      dependencies.forEach(async dep => {
        if (dep.conjunctions.length !== 0) {
          // await Installer.resolveConjunctions(dependencies.dependencies, dep.conjunctions, repository)
        }
        dep.dependencies.forEach(dependency => {
          if (dependency.version === '') {
            // break into function
            let selectedDependancy = {
              version: ''
            }
            for (let dep in repository.packages[dependency.name]) {
              selectedDependancy = (repository.packages[dependency.name][dep].version > selectedDependancy.version) ? repository.packages[dependency.name][dep] : selectedDependancy
            }
            commandsTo.push(`+${selectedDependancy.name}=${selectedDependancy.version}`)
            // console.log('comand', commandsTo)
          } else {
            let selectedDependancy
            switch (dependency.comparator) {
              // see if this can be reduced into a lambda
              case '<':
                // version greater than
                for (let dep in repository.packages[dependency.name]) {
                  selectedDependancy = (repository.packages[dependency.name][dep].version < dependency.version) ? repository.packages[dependency.name][dep] : selectedDependancy
                }
                commandsTo.push(`+${selectedDependancy.name}=${selectedDependancy.version}`)
                break
              case '>':
                // version less than
                for (let dep in repository.packages[dependency.name]) {
                  selectedDependancy = (repository.packages[dependency.name][dep].version > dependency.version) ? repository.packages[dependency.name][dep] : selectedDependancy
                }
                commandsTo.push(`+${selectedDependancy.name}=${selectedDependancy.version}`)
                break
              case '=':
                // version equal than
                for (let dep in repository.packages[dependency.name]) {
                  selectedDependancy = (repository.packages[dependency.name][dep].version = dependency.version) ? repository.packages[dependency.name][dep] : selectedDependancy
                }
                commandsTo.push(`+${selectedDependancy.name}=${selectedDependancy.version}`)
                break
              case '>=':
                console.log('case  >=:')
                // version greater equal than
                for (let dep in repository.packages[dependency.name]) {
                  selectedDependancy = (repository.packages[dependency.name][dep].version >= dependency.version) ? repository.packages[dependency.name][dep] : selectedDependancy
                }
                commandsTo.push(`+${selectedDependancy.name}=${selectedDependancy.version}`)
                break
              case '<=':
                console.log('case  <=:')
                // version less equal than
                for (let dep in repository.packages[dependency.name]) {
                  selectedDependancy = (repository.packages[dependency.name][dep].version <= dependency.version) ? repository.packages[dependency.name][dep] : selectedDependancy
                }
                commandsTo.push(`+${selectedDependancy.name}=${selectedDependancy.version}`)
                break
            }
            // check dependency comparitor to see which version to get
            // switch on comparitor
          }
          // console.log('repo', repository.packages[dependency.name])
        })
        return resolve()
      })
    } catch (e) {
      return reject(e)
    }
  })
}

Installer.resolveConjunctions = (dependencies, constraints, repository) => {

}
