

export function Log() {

  this.log = function(identifier, msg='') {
    this.debug && console.log(`BLE:（${identifier}）:` , msg);
  }

  this.loginfo = function(identifier,msg) {
    this.debug && console.info(`BLE:（${identifier}）:` ,msg);
  }

  this.logwarn = function (identifier, msg) {
    this.debug && console.warn(`BLE:（${identifier}）:`, msg);
  }

  this.logerror = function (identifier, msg) {
    this.debug && console.error(`BLE:（${identifier}）:`, msg);
  }

}
