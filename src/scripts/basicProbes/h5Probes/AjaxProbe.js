require('QClass');
var QClass = window.QClass,
    ns = window.pfMonitor.common;

QClass.define('pfMonitor.Probes.H5Probes.AjaxProbe',{
    'extend' : ns.AbstractProbe,

    'singleton' : true,

    'initialize' : function(opts){
        this.parent();
        var self = this;
        self.limitTime = opts && opts.limitTime || '10000';//默认10秒的超时预警
        if(window.XMLHttpRequest){
            override(this);
        }
    }

});

function override(probe){
    var origOpen = XMLHttpRequest.prototype.open;
    var origSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function(){
        if( this !== XMLHttpRequest.prototype && this.addEventListener ){
            // call by instance
            this.$pfm_rqUrl = arguments[1];
        }
        origOpen.apply(this, arguments);
    }

    XMLHttpRequest.prototype.send = function(){
        if(this !== XMLHttpRequest.prototype && this.addEventListener && probe.status === 'working'){
            // call by instance & probe is working
            var startTime;
            
            var loadHandler = function(e){
                if(this.readyState === 2){
                    startTime = Date.now();
                }
                if(this.readyState === 4){
                    var timeUsed = Date.now() - startTime;
                    probe.trigger('ajaxLoadSuccess',{
                        'requestUrl' : this.$pfm_rqUrl,
                        'size' : (Math.max(e.total,e.loaded) || this.getResponseHeader('Content-Length')) / 1024,//content size by KB
                        'afterSend' : timeUsed,
                        'xxxSend' : Date.now() - e.timeStamp
                    });
                    if( timeUsed > probe.limitTime){
                        // timeout
                        probe.trigger('ajaxOutLimitTime',{
                            'requestUrl' : this.$pfm_rqUrl,
                            'afterSend' : timeUsed
                        });
                    }
                }
            }

            var abortHandler = function(){
                var timeUsed = Date.now() - startTime;
                probe.trigger('ajaxAborted',{
                    'requestUrl' : this.$pfm_rqUrl,
                    'afterSend' : timeUsed
                });
            }

            var errorHandler = function(){
                probe.trigger('ajaxError',{
                    'requestUrl' : this.$pfm_rqUrl,
                    'status' : this.status
                });
            }

            // fix bug
            // call open & send methods in same XMLHttpRequest instance repeatedly
            this.removeEventListener('readystatechange',loadHandler);
            this.removeEventListener('abort',abortHandler);
            this.removeEventListener('error',errorHandler);
            this.addEventListener('readystatechange',loadHandler,false);
            this.addEventListener('abort',abortHandler,false);
            this.addEventListener('error',errorHandler,false);
        }
        origSend.apply(this, arguments);
    }
}



module.exports = window.pfMonitor.Probes.H5Probes.AjaxProbe;