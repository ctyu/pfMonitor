!require('QClass');
var CustEvent = require('./CustEvent.js'),
    QClass = window.QClass,
    noop = function(){};

QClass.define('pfMonitor.common.AbstractProbe',{
    'mixin' : [CustEvent],
    'initialize' : function(){
        var self = this;
        this.type = 'Probe';
        this.status = 'pending';
        this.probeData = null;
        this.on('probeEnd',function(data){
            self.onProbeEnd(data);
        });
    },

    'run' : function(){
        this.status = 'working';
    },

    'onProbeEnd' : function(){
        this.status = 'done';
    },

    'destroy' : function(){
        this.off();//删除所有事件
        this.status = 'offLine';
        this.run = noop;
    }
})