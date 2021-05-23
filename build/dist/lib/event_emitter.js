"use strict";
/**
 * A listener class.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventEmitter = void 0;
/**
 * The ``Event`` parameter passed to the class must be an interface that maps
 * event names to the type of data that the event subscribers will get.
 *
 *     interface Events {
 *       "foo": FooData,
 *       "bar": BarData,
 *     }
 *
 * The code that wishes to emit an event calls ``_emit`` to emit events. For
 * instance, if ``_emit("foo", {beep: 3})`` is called, this will result in all
 * listeners on event ``"foo"`` being called and passed the object ``{beep:
 * 3}``. Any listener returning the value ``false`` ends the processing of the
 * event.
 *
 * This class also supports listening on events in a generic way, by listening
 * to the event named "\*". Listeners on such events have the signature
 * ``listener(name, ev)``. When the ``_emit`` call above is executed such
 * listener will be called with ``name`` set to ``"foo"`` and ``ev`` set to
 * ``{beep: 3}``. Listeners on "\*" are executed before the other
 * listeners. Therefore, if they return the value ``false``, they prevent the
 * other listeners from executing.
 */
class EventEmitter {
    constructor() {
        this._eventListeners = Object.create(null);
        this._generalListeners = [];
        this._trace = false;
    }
    addEventListener(eventName, listener) {
        if (eventName === "*") {
            this._generalListeners.push(listener);
        }
        else {
            let listeners = this._eventListeners[eventName];
            if (listeners === undefined) {
                listeners = this._eventListeners[eventName] = [];
            }
            listeners.push(listener);
        }
    }
    addOneTimeEventListener(eventName, listener) {
        // We perform casts as any here to indicate to TypeScript that it is
        // safe to pass this stub.
        const me = (...args) => {
            this.removeEventListener(eventName, me);
            return listener.apply(this, args);
        };
        this.addEventListener(eventName, me);
        return me;
    }
    removeEventListener(eventName, listener) {
        const listeners = (eventName === "*") ?
            this._generalListeners :
            this._eventListeners[eventName];
        if (listeners === undefined) {
            return;
        }
        const index = listeners.lastIndexOf(listener);
        if (index !== -1) {
            listeners.splice(index, 1);
        }
    }
    /**
     * Removes all listeners for a specific event.
     *
     * @param eventName The event whose listeners must all be removed.
     */
    removeAllListeners(eventName) {
        if (eventName === "*") {
            this._generalListeners = [];
        }
        else {
            this._eventListeners[eventName] = [];
        }
    }
    /**
     * This is the function that must be called to indicate that an event has
     * occurred.
     *
     * @param eventName The name of the event to emit.
     *
     * @param ev The event data to provide to handlers. The type can be
     * anything.
     */
    _emit(eventName, ev) {
        if (this._trace) {
            // tslint:disable-next-line: no-console
            console.log("simple_event_emitter emitting:", eventName, "with:", ev);
        }
        {
            let listeners = this._generalListeners;
            if (listeners.length > 0) {
                // We take a copy so that if any of the handlers add or remove
                // listeners, they don't disturb our work here.
                listeners = listeners.slice();
                for (const listener of listeners) {
                    const ret = listener.call(undefined, eventName, ev);
                    if (ret === false) {
                        return;
                    }
                }
            }
        }
        {
            let listeners = this._eventListeners[eventName];
            if (listeners !== undefined && listeners.length > 0) {
                // We take a copy so that if any of the handlers add or remove
                // listeners, they don't disturb our work here.
                listeners = listeners.slice();
                for (const listener of listeners) {
                    const ret = listener.call(undefined, ev);
                    if (ret === false) {
                        return;
                    }
                }
            }
        }
    }
}
exports.EventEmitter = EventEmitter;
//  LocalWords:  Mangalam MPL Dubeau noop ev
//# sourceMappingURL=event_emitter.js.map