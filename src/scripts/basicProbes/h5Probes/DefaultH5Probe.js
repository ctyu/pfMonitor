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
    defalutProbeList = (function(){
        var a = [];
        for(var key in probeNames){
            a.push(key);
        }
        return a;
    })(),
    performanceTiming = window.performance && window.performance.timing || {},
    winSize = utils.winSize(window);


function updateDate(imageEl, winSize){
    if(imageEl){
        var imgPos = utils.position(imageEl);
        if(winSize.height > imgPos.top && winSize.width > imgPos.left){
            return Date.now();
        }
    }
}

// updateDate被调用多少次后调用afterFn
updateDate.afterCalled = function(time, afterFn){
    var self = this,
        resultEnd;
    return function(){
        var result = self.apply(self, arguments);
        resultEnd = result || resultEnd;
        if((--time)<=0){
            return afterFn(resultEnd);
        }
        return result;
    }
}

QClass.define('pfMonitor.Probes.H5Probes.DefaultH5Probe',{
    'extend' : ns.AbstractProbe,

    'initialize' : function(opts){
        opts = opts || {};
        this.parent(opts);
        this.probeList = opts.probeList;
        this.probeData = {};
        this.todoChildTask = [];
    },


    /**
     * 获得白屏时间
     * @return {[type]} [description]
     */
    'getFirstPaintTime' : function(){
        var self = this;
        if (typeof window.chrome !== 'undefined') {
            // 支持chrome
            var loadTime = window.chrome.loadTimes();
            var first_paint_secs = loadTime && loadTime.firstPaintTime;
            if( !first_paint_secs ){
                window.requestAnimationFrame(function() {
                    loadTime = window.chrome.loadTime();
                    first_paint_secs = loadTime && loadTime.firstPaintTime;
                    self.probeData.first_paint = first_paint_secs * 1000;
                    self.trigger('firstPaintEnd',self.probeData.first_paint);
                });
            }else{
                self.probeData.first_paint = first_paint_secs * 1000;
                self.trigger('firstPaintEnd',self.probeData.first_paint);
            }
        } else if (window.performance && window.performance.timing && (window.performance.timing.msFirstPaint !== undefined)) {
            window.setTimeout(function() {
                self.probeData.first_paint = window.performance.timing.msFirstPaint;
                self.trigger('firstPaintEnd',self.probeData.first_paint);
            }, 1000);
        } else {
            // 使用全局firstPaintTime
            self.probeData.first_paint = window.firstPaintTime;
            self.trigger('firstPaintEnd',window.firstPaintTime);
        }
    },


    /**
     * 获得onLoad时间
     * @return {[type]} [description]
     */
    'getOnLoadTime' : function(){
        if(this.loadTime) return this.loadTime;
        var self = this;
        var cb = function(){
            self.probeData.loadTime = performanceTiming.loadEventEnd || Date.now();
            self.trigger('onLoadEnd',self.probeData.loadTime);
        };
        window.addEventListener( 'load', cb, false );
    },


    /**
     * 获得首屏时间
     * @return {[type]} [description]
     */
    'getFirstFrameTime' : function(){
        var self = this;
        utils.onDomReady(function(){
            self.updateFirstFrameTime();
        });
        this.getFirstFrameTime = utils.noop;
    },

    'updateFirstFrameTime' : function(){
        var self = this;
        var images = Array.prototype.slice.call(document.getElementsByTagName('img'),0);
        if(images && images.length){
            var updateDateAfter = updateDate.afterCalled(images.length, function(date){
                if(!date) return;
                self.probeData.first_frame_time = date;
                self.trigger('firstFrameEnd',date);
            });
            images.forEach(function(image){
                var imgSrc = image.src;
                if(imgSrc){

                    var handler = function(){
                        updateDateAfter(image,winSize);
                        image.removeEventListener('load',handler);
                        image.removeEventListener('error',handler);
                        fakeImage.onload = undefined;
                        fakeImage.onerror = undefined;
                        fakeImage = undefined;
                    }

                    image.addEventListener('load',handler,false);

                    image.addEventListener('error',handler,false);

                    var fakeImage = new Image();
                    fakeImage.onload = handler;
                    fakeImage.onerror = handler;
                    fakeImage.src = imgSrc;
                }
            });
        }else{
            self.probeData.first_frame_time = window.firstPaintTime || 'no_image';
            self.trigger('firstFrameEnd',self.probeData.first_frame_time);
        }
    },

    /**
     * 获得domReady时间
     * @return {[type]} [description]
     */
    'getDomReadyTime' : function(){
        if(this.domReadyTime) return this.domReadyTime;
        var self = this;
        var cb = function(){
            self.probeData.domReadyTime = Date.now();
            self.trigger('DOMReadyEnd',self.probeData.domReadyTime);
        };
        utils.onDomReady(cb);
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
            self.trigger('netWorkTypeEnd',self.probeData.netWorkType);
            cb && cb(type);
        });
    },

    'run' : function(){
        this.parent();
        if(window.addEventListener){
            loadProbes.call(this,this.probeList);
        }
    },

    'checkChildTask' : function(taskName){
        var index = this.todoChildTask.indexOf(taskName);
        if(index >= 0){
            this.todoChildTask.splice(index,1);
        }
        if (this.todoChildTask.length <= 0){
            this.trigger('workDone',this.probeData);
        }
    }
});

/**
 * [加载探针]
 * @param  {[type]} probeList [description]
 * @return {[type]}           [description]
 */
function loadProbes(probeList){
    var self = this,
        probes = probeList || defalutProbeList;
    if(utils.core_type(probes) === 'array'){
        probes.forEach(function(item){
            self.todoChildTask.push(item);
            self.on(item + 'End',function(){
                self.checkChildTask(item);
            })
        });
        // 分开保证先push后执行
        probes.forEach(function(item){
            probeNames[item] && self[probeNames[item]]();
        });
    }
}


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
        cb && cb(type);
    }
}


module.exports = window.pfMonitor.Probes.H5Probes.DefaultH5Probe;