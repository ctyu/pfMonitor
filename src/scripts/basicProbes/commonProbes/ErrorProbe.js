require('QClass');
var QClass = window.QClass,
    ns = window.pfMonitor.common;

QClass.define('pfMonitor.Probes.common.ErrorProbe',{
    'extend' : ns.AbstractProbe,

    'initialize' : function(){
        this.parent({
            'once' : true
        });
    },

    'singleton' : true,

    'sourceError' : function(){
        console.log(arguments);
    },

    'catchError' : function(){
        console.log(arguments);
    },

    'run' : function(){
        this.parent();
        var me = this;
        window.sourceError = function(){
            me.sourceError.apply(me,arguments);
        }
        var oriWinOnError = window.onerror;
        window.onerror = function(){
            oriWinOnError && oriWinOnError.apply(window, arguments);
            me.catchError.apply(me, arguments);
        }
    }
});

module.exports = window.pfMonitor.Probes.common.ErrorProbe;