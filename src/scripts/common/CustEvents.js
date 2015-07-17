var coreSlice = Array.prototype.slice;

function _once(func) {
    var ran = false,
        memo;
    return function () {
        if (ran) return memo;
        ran = true;
        memo = func.apply(this, arguments);
        func = null;
        return memo;
    };
}

var triggerEvents = function (events, args) {
    var ev,
        i = -1,
        l = events.length,
        ret = 1;
    while (++i < l && ret) {
        ev = events[i];
        ret &= (ev.callback.apply(ev.ctx, args) !== false);
    }
    return !!ret;
};
    
function keys(obj) {
    var ret = [],
        key;
    for (key in obj) {
        ret.push(key);
    }
    return ret;
}

var CustEvent = {
    on: function (name, callback, context) {
        this._events = this._events || {};
        this._events[name] = this._events[name] || [];
        var events = this._events[name];
        events.push({
            callback: callback,
            context: context,
            ctx: context || this
        });
        return this;
    },
    once: function (name, callback, context) {
        var self = this;
        var once = _once(function () {
            self.off(name, once);
            callback.apply(this, arguments);
        });
        once._callback = callback;
        return this.on(name, once, context);
    },
    off: function (name, callback, context) {
        var retain, ev, events, names, i, l, j, k;
        if (!name && !callback && !context) {
            this._events = undefined;
            return this;
        }
        names = name ? [name] : keys(this._events);
        for (i = 0, l = names.length; i < l; i++) {
            name = names[i];
            events = this._events[name];
            if (events) {
                this._events[name] = retain = [];
                if (callback || context) {
                    for (j = 0, k = events.length; j < k; j++) {
                        ev = events[j];
                        if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                            (context && context !== ev.context)) {
                            retain.push(ev);
                        }
                    }
                }
                if (!retain.length) delete this._events[name];
            }
        }
        return this;
    },
    trigger: function (name) {
        if (!this._events) return this;
        var args = coreSlice.call(arguments, 1),
            events = this._events[name],
            allEvents = this._events.all,
            ret = 1;
        if (events) {
            ret &= triggerEvents(events, args);
        }
        if (allEvents && ret) {
            ret &= triggerEvents(allEvents, args);
        }
        return !!ret;
    }
};

module.exports = CustEvent;