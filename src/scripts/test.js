var basicH5Monitor = require('./monitors/BasicH5Monitor.js');
var monitorManager = require('./index.js');

monitorManager.load('basicH5Monitor',basicH5Monitor)
window.monitorManager = monitorManager;