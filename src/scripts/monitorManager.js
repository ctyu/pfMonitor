!require('QClass');
var probeManager = require('./probeManager.js'),
    utils = require('./common/utils.js'),
    monitorCache = {},
    monitorDataCache = {};

QClass.define('pfMonitor.MonitorManager',{
    'singleton' : true,

    'addMonitor' : (function(){
        var childMonitor = [];
        return function(monitorName, monitor){
            var self = this;
            childMonitor.push(monitorName);
            monitor.on('measureEnd',function(monitorData){
                self.trigger('monitorMeasureEnd',monitorName);
                monitorDataCache[monitorName] = monitorData;
                var index = childMonitor.indexOf(monitorName);
                if(index >= 0){
                    childMonitor.splice(index,1);
                }
                if(!childMonitor.length){
                    self.trigger('allMeasureEnd',monitorDataCache);
                }
            })
        }
    })(),

    'load' : function(name,monitor){
        if(name && monitor){
            monitorCache[name] = monitor;
            monitor.init(probeManager);
            this.addMonitor(name, monitor);
            return monitor;
        }else if( utils.core_type(name) === 'object' ){
            for(var monitorName in name){
                monitor = name[monitorName];
                this.load(monitorName,monitor);
            }
        }
    },

    'getMonitorData' : function(){
        return monitorDataCache;
    },

    'getStartTime' : function(){
        if(!this.startTime){
            var timing = window.performance && window.performance.timing || {};
            this.startTime = timing.navigationStart || window.startTime;
            this.responseEndTime = timing.responseEnd;
        }
        return this.startTime;
    },

    'getResponseEndTime' : function(){
        if(!this.responseEndTime){
            var timing = window.performance && window.performance.timing || {};
            this.startTime = timing.navigationStart || window.startTime;
            this.responseEndTime = timing.responseEnd;
        }
        return this.responseEndTime;
    },

    'getMonitor' : function(name){
        return monitorCache[name];
    }
});

utils.supportCustEvent(window.pfMonitor.MonitorManager);


module.exports = new window.pfMonitor.MonitorManager();

