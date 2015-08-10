require('QClass');
require('../../common/AbstractProbe.js');
var QClass = window.QClass,
    ns = window.pfMonitor.common;

QClass.define('pfMonitor.Probes.H5Probes.WebViewBridgeProbe',{
    'extend' : ns.AbstractProbe,

    'singleton' : true,

    'initialize' : function(opts){
        var self = this;
        this.parent();
        this.limitTime = opts && opts.limitTime;
        if(window.WebViewJavascriptBridge && window.WebViewJavascriptBridge.invoke){
            override.call(self,window.WebViewJavascriptBridge);
        }else{
            document.addEventListener('WebViewJavascriptBridgeReady', function(event) {
                var bridge = event.bridge;
                override.call(self,bridge);
            });
        }
    }
});

function override(bridge){
    var self = this;
    if(bridge && 'function' == typeof bridge.invoke){
        var oriInvoke = bridge.invoke;
        bridge.invoke = function(){
            var called = false,
                orCb,
                bridgeName = arguments[0],
                timer;
            if(arguments.length >= 2 && ('function' == typeof arguments[1])){
                var st = Date.now();
                orCb = arguments[1];
                arguments[1] = function(){
                    timer && clearTimeout(timer);
                    var et = Date.now();
                    orCb.apply(window,arguments);
                    !called && self.trigger('bridgeEnd',{
                        'name' : bridgeName,
                        'time' : et - st
                    });
                    called = true;
                }
            }
            oriInvoke.apply(bridge,arguments);
            if(self.limitTime){
                timer = setTimeout(function(){
                    self.trigger('bridgeTimeout',{
                        'name' : bridgeName
                    });
                },self.limitTime);
            }
        }
    }
}

module.exports = window.pfMonitor.Probes.H5Probes.WebViewBridgeProbe;