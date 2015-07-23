require('QClass');
var utils = require('../../common/utils.js');
var QClass = window.QClass,
    ns = window.pfMonitor.common,
    probeNames = {
        'firstPaint' : 'getFirstPaintTime',
        'firstFrame' : 'getFirstFrameTime',
        'netWorkType' : 'checkNetWorkType',
        'DOMReady' : 'getDomReadyTime',
        'onLoad' : 'getOnLoadTime'
    }

QClass.define('pfMonitor.Probes.H5Probes.DefaultH5Probe',{
    'extend' : ns.AbstractProbe,

    'initialize' : function(opts){
        this.parent(opts);
        if(window.addEventListener){
            this.loadProbes(opts.probeList);
        }
        this.probeData = {};
    },

    'getFirstPaintTime' : function(){
        
    },

    'getOnLoadTime' : function(){
        window.addEventListener( "load", function(){
            this.loadTime = Date.now();
        }, false );
    },

    'getFirstFrameTime' : function(){

    },

    'getDomReadyTime' : function(){
        utils.onDomReady(function(){
            this.domReadyTime = Date.now();
        })
    },

    'checkNetWorkType' : function(cb){
        var self = this;
        var connectionInfo = window.navigator.connection || window.navigator.mozConnection || window.navigator.webkitConnection;
        checkNetInfo(connectionInfo,function(type){
            self.probeData.netWorkType = type;
            cb && cb(type);
        });
    },

    'loadProbes' : function(probeList){
        var self = this;
        if(probeList === undefined){
            this.getFirstPaintTime();
            this.getFirstFrameTime();
            this.checkNetWorkType();
        }
        if(utils.core_type(probeList) === 'array'){
            probeList.forEach(function(item){
                probeNames[item] && self[probeNames[item]]();
            });
        }
    }
});

function checkNetInfo(connectionInfo,cb){
    var type = connectionInfo && connectionInfo.type
    if(type){
        // 可以拿到navigator.connection
        if( Number.isNaN(parseInt(type)) ){
            cb && cb(type);
        }else{
            for(var key in connectionInfo){
                if(type === connectionInfo[key]){
                    type = key;
                    break;
                }
            }
            cb && cb(type);
        }
    }else{
        // 通过请求时间推测网络类型
        
    }
}

module.exports = window.pfMonitor.Probes.H5Probes.DefaultH5Probe;