!require('QClass');
var probeManager = require('./probeManager.js'),
    utils = require('./common/utils.js'),
    childMonitor = {},
    monitorDataCache = {},
    childMonitorName = [];

var addMonitor = (function(){
    var addedMonitor = [];
    return function(monitorName, monitor){
        var self = this;
        addedMonitor.push(monitorName);
        childMonitor[monitorName] = monitor;
        monitor.on('measureEnd',function(monitorData){
            monitorDataCache[monitorName] = monitorData;
            var index = addedMonitor.indexOf(monitorName);
            if(index >= 0){
                addedMonitor.splice(index,1);
            }
            if(!addedMonitor.length){
                self.trigger('allMeasureEnd',monitorDataCache);
            }
            // 广播
            broadcast(monitorName,'measureEnd',monitorData);
        });
        monitor.on('measureProcess',function(data){
            // 需要广播
            broadcast(monitorName,'measureProcess',data);
        });
        if(!this.monitorId) return;
        monitor.config(self.monitorId);
        monitor.init(probeManager);
    }
})();

QClass.define('pfMonitor.MonitorManager',{
    'singleton' : true,

    'initialize' : function(opts){
        this.parent();
        this.config(opts);
    },

    'load' : function(name,monitor){
        if(name && monitor){
            childMonitorName.push(name);
            addMonitor.call(this,name, monitor);
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

    'getMonitor' : function(name){
        return childMonitor[name];
    },

    'config' : function(opts){
        var self = this;
        opts = opts || {};
        if(!this.monitorId && opts.monitorId){
            this.monitorId = opts.monitorId;
            childMonitorName.forEach(function(name){
                childMonitor[name].config(self.monitorId);
                childMonitor[name].init(probeManager);
            })
        }else{
            this.monitorId = opts.monitorId;
        }
    }
});

function broadcast(monitorName, type ,data){
    childMonitorName.forEach(function(name){
        if(name !== monitorName){
            childMonitor[name]['onOtherMonitor' + type] && childMonitor[name]['onOtherMonitor' + type](data);
        }
    })
}

utils.supportCustEvent(window.pfMonitor.MonitorManager);

module.exports = window.pfMonitor.MonitorManager;

