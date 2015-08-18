/**
 * 仅支持Android4.4+和ios6.0+
 */
require('QClass');
require('../../common/AbstractProbe.js');
var QClass = window.QClass,
    ns = window.pfMonitor.common,
    MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver,
    mutationObserverSupport = !!MutationObserver;

QClass.define('pfMonitor.Probes.H5Probes.AjaxProbe',{
    'extend' : ns.AbstractProbe,

    'singleton' : true,

    'run' : function(){
        this.parent();
        observe(this);
    },

    'stop' : function(){
        this.observer && this.observer.disconnect && this.observer.disconnect()
    }
});

function observe(probe){
    var headEl = document.getElementsByTagName('head')[0];
    if(!headEl) return;
    if(mutationObserverSupport){
        probe.observer = new MutationObserver(function(mutationRecord){
            var addedNodes,addedScriptNodes = [],st = Date.now();
            for(var i = 0; i < mutationRecord.length; i++){
                if(mutationRecord[i].addedNodes.length){
                    addedNodes = mutationRecord[i].addedNodes;
                    for(var _i = 0;_i < addedNodes.length; _i++){
                        if(addedNodes[_i].tagName.toLowerCase() === 'script') addedScriptNodes.push(addedNodes[_i]);
                    }
                }
            }
            setProbe.call(probe,addedScriptNodes,st)
        });

        probe.observer.observe(headEl,{
            'childList' : true
        })
    }
    // do not use mutation event because of performance problems
    // http://jsperf.com/domnodeinserted-performance/2
    // else{
    //     headEl.addEventListener('DOMNodeInserted',function(e){

    //     })
    // }
}

function setProbe(addedScriptNodes,st){
    var scriptNode,
        self = this;
    if(addedScriptNodes && addedScriptNodes.length){
        for(var i = 0;i < addedScriptNodes.length;i++){
            scriptNode = addedScriptNodes[i];
            scriptNode.addEventListener('load',function(){
                self.trigger('loaded',{
                    'src' : this.src,
                    'time' : Date.now() - st
                })
            });
            scriptNode.addEventListener('error',function(){
                self.trigger('error',{
                    'src' : this.src,
                    'time' : Date.now() - st
                })
            });
        }
    }
}


