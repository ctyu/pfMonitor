var probeManager = require('./probeManager.js'),
    utils = require('./common/utils.js'),
    monitorCache = {};

var addMonitor = (function(){
    var childMonitor = [];
    return function(monitorName, monitor){
        var index = childMonitor.length;
        childMonitor.push(monitorName);
        monitor.on('measureEnd',function(){
            childMonitor.splice(index,1);
        })
    }
})()

function load(monitors){
    if( utils.core_type(monitors) === 'object' ){
        for(var monitorName in monitors){
            var monitorFn = monitors[monitorName];
            var monitor = monitorCache[monitorName] = monitorFn(probeManager);
            addMonitor(monitorName, monitor);
            return monitor;
        }
    }
}

module.exports = {
    'load' : load
}

