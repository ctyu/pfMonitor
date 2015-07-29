!require('QClass');
var CustEvent = require('./CustEvents.js'),
    QClass = window.QClass,
    noop = function(){},
    statusValue = {
        'pending' : 0,
        'working' : 1,
        'done' : 2,
        'offLine' : 3
    };

function changeStatus(instance, status){
    if(statusValue[instance.status] < statusValue[status]){
        instance && (instance.status = status)
        instance.trigger('statusChange',instance.probeData);
    }
}

QClass.define('pfMonitor.common.AbstractProbe',{
    'mixin' : [CustEvent],
    'initialize' : function(opts){
        this.type = 'Probe';
        this.status = 'pending';
        this.probeData = null;
        opts && opts.once && (this.__once = true);
    },

    'run' : function(){
        changeStatus(this,'working');
        this.__once && this.disable();
    },

    '__bindEvents' : function(){
        var self = this;
        this.on('workDone',function(data){
            self.onProbeEnd(data);
        });
    },

    'onProbeEnd' : function(){
        changeStatus(this, 'done');
    },

    'destroy' : function(){
        this.run = noop;
        this.off();//删除所有事件
        changeStatus(this,'offLine');
    },

    'disable' : function(){
        this.run = noop;
        changeStatus(this,'offLine');
    }
})