class Dependency {
  constructor (name, version, comparator) {
    this.name = name
    this.version = version
    this.comparator = comparator
  }
}

module.exports = Dependency