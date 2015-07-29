var probeManager = require('./probeManager.js'),
    utils = require('./common/utils.js'),
    QClass = require('QClass'),
    CustEvent = require('./common/CustEvents.js'),
    monitorCache = {},
    monitorDataCache = {};

QClass.define('pfMonitor.MonitorManager',{
    'mixin' : [CustEvent],

    'singleton' : true,

    'addMonitor' : (function(){
        var childMonitor = [],
            self = this;
        return function(monitorName, monitor){
            childMonitor.push(monitorName);
            monitor.on('measureEnd',function(monitorData){
                self.trigger('monitorMeasureEnd',monitorName);
                monitorDataCache[monitorName] = monitorData;
                var index = childMonitor.indexOf(monitorName);
                childMonitor.splice(index,1);
                self.trigger('allMeasureEnd',monitorDataCache);
            })
        }
    })(),

    'load' : function(monitors){
        if( utils.core_type(monitors) === 'object' ){
            for(var monitorName in monitors){
                var monitor = monitors[monitorName];
                monitorCache[monitorName] = monitor.init(probeManager);
                this.addMonitor(monitorName, monitor);
                return monitor;
            }
        }
    },

    'getMonitorData' : function(){
        return this.monitorDataCache;
    }
});

window.monitorManager = new window.pfMonitor.MonitorManager();

module.exports = window.monitorManager;

