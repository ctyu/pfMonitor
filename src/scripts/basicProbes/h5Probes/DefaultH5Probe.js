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
    },
    domReadyCallbackList,
    onLoadCallbackList;

QClass.define('pfMonitor.Probes.H5Probes.DefaultH5Probe',{
    'extend' : ns.AbstractProbe,

    'initialize' : function(opts){
        this.parent(opts);
        if(window.addEventListener){
            this.loadProbes(opts.probeList);
        }
        this.probeData = {};
    },


    /**
     * 获得白屏时间
     * @return {[type]} [description]
     */
    'getFirstPaintTime' : function(){
        
    },


    /**
     * 获得onLoad时间
     * @return {[type]} [description]
     */
    'getOnLoadTime' : function(){
        if(this.loadTime) return this.loadTime;
        var self = this;
        var cb = function(){
            self.loadTime = Date.now();
        };
        onLoadCallbackList ? onLoadCallbackList.push(cb) : (onLoadCallbackList = [cb]);
        window.addEventListener( 'load', onLoadHandler, false );
    },


    /**
     * 获得首屏时间
     * @return {[type]} [description]
     */
    'getFirstFrameTime' : function(){

    },

    /**
     * 获得domReady时间
     * @return {[type]} [description]
     */
    'getDomReadyTime' : function(){
        if(this.domReadyTime) return this.domReadyTime;
        var self = this;
        var cb = function(){
            self.domReadyTime = Date.now();
        };
        domReadyCallbackList ? domReadyCallbackList.push(cb) : (domReadyCallbackList = [cb]);
        utils.onDomReady(domReady);
    },

    /**
     * 获取网络类型
     * @param  {Function} cb [description]
     * @return {[type]}      [description]
     */
    'checkNetWorkType' : function(cb){
        var self = this;
        var connectionInfo = window.navigator.connection || window.navigator.mozConnection || window.navigator.webkitConnection;
        checkNetInfo(connectionInfo,function(type){
            self.probeData.netWorkType = type;
            cb && cb(type);
        });
    },

    /**
     * [加载探针]
     * @param  {[type]} probeList [description]
     * @return {[type]}           [description]
     */
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

/**
 * 获得网络信息
 * @param  {[type]}   connectionInfo [description]
 * @param  {Function} cb             [回调]
 * @return {[type]}                  [description]
 */
function checkNetInfo(connectionInfo,cb){
    var type = connectionInfo && connectionInfo.type
    if(type){
        // 可以拿到navigator.connection
        if( !Number.isNaN(parseInt(type)) ){
            for(var key in connectionInfo){
                if(type === connectionInfo[key]){
                    type = key;
                    break;
                }
            }
        }
        cb && cb(type);
    }else{
        // 通过请求时间推测网络类型
        
    }
}

function domReady(){
    if( domReadyCallbackList && domReadyCallbackList.length ){
        domReadyCallbackList.forEach(function(cb){
            cb();
        })
    }
    document.removeEventListener( "DOMContentLoaded", domReady, false );
}

function onLoadHandler(){
    if( onLoadCallbackList && onLoadCallbackList.length ){
        onLoadCallbackList.forEach(function(cb){
            cb();
        })
    }
    window.removeEventListener( "load", onLoadHandler, false );
}

module.exports = window.pfMonitor.Probes.H5Probes.DefaultH5Probe;