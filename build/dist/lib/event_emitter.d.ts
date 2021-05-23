/**
 * A listener class.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
export declare type Listener<T> = (ev: T) => (boolean | void);
export declare type StringKeys<T> = Extract<keyof T, string>;
/**
 * A listener for listening on the "*" event: the ``ev`` parameter accepts the
 * union of all possible event types defined in the ``Events`` map.
 */
export declare type GeneralListener<Events> = (name: string, ev: Events[keyof Events]) => (boolean | void);
/**
 * This is an interface that can be used to hide the ``_emit`` method.
 */
export interface Consuming<Events> {
    addEventListener<T extends StringKeys<Events>>(eventName: T, listener: Listener<Events[T]>): void;
    addEventListener(eventName: "*", listener: GeneralListener<Events>): void;
    addOneTimeEventListener<T extends StringKeys<Events>>(eventName: T, listener: Listener<Events[T]>): any;
    addOneTimeEventListener(eventName: "*", listener: GeneralListener<Events>): any;
    removeEventListener<T extends StringKeys<Events>>(eventName: T, listener: Listener<Events[T]>): void;
    removeEventListener(eventName: "*", listener: GeneralListener<Events>): void;
    removeAllListeners<T extends StringKeys<Events>>(eventName: T | "*"): void;
}
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
export declare class EventEmitter<Events> implements Consuming<Events> {
    private _eventListeners;
    private _generalListeners;
    private _trace;
    /**
     * Adds a listener for an event. The order in which event listeners are
     * added matters. An earlier event listener returning ``false`` will prevent
     * later listeners from being called.
     *
     * @param eventName The name of the event to listen to.
     *
     * @param listener The function that will be called when
     * the event occurs.
     */
    addEventListener<T extends StringKeys<Events>>(eventName: T, listener: Listener<Events[T]>): void;
    addEventListener(eventName: "*", listener: GeneralListener<Events>): void;
    /**
     * Adds a one-time listener for an event. The listener will be called only
     * once. If this method is called more than once with the same listener, the
     * listener will be called for each call made to this method. The order in
     * which event listeners are added matters. An earlier event listener
     * returning ``false`` will prevent later listeners from being called.
     *
     * @param eventName The name of the event to listen to.
     *
     * @param listener The function that will be called when the event occurs.
     *
     * @returns This method returns an opaque identifier which uniquely
     * identifies this addition operation. If the caller ever wants to undo this
     * addition at a later time using [[removeEventListener]], it can pass this
     * return value as the listener to remove. (Client code peeking at the
     * return value and relying on what it finds does so at its own risk. The
     * way the identifier is created could change in future versions of this
     * code.)
     */
    addOneTimeEventListener<T extends StringKeys<Events>>(eventName: T, listener: Listener<Events[T]>): any;
    addOneTimeEventListener(eventName: "*", listener: GeneralListener<Events>): any;
    /**
     * Removes a listener. Calling this method on a listener that is not
     * actually listening to events is a noop.
     *
     * @param eventName The name of the event that was listened to.
     *
     * @param listener The handler to remove.
     */
    removeEventListener<T extends StringKeys<Events>>(eventName: T, listener: Listener<Events[T]>): void;
    removeEventListener(eventName: "*", listener: GeneralListener<Events>): void;
    /**
     * Removes all listeners for a specific event.
     *
     * @param eventName The event whose listeners must all be removed.
     */
    removeAllListeners<T extends StringKeys<Events>>(eventName: "*" | T): void;
    /**
     * This is the function that must be called to indicate that an event has
     * occurred.
     *
     * @param eventName The name of the event to emit.
     *
     * @param ev The event data to provide to handlers. The type can be
     * anything.
     */
    _emit<T extends StringKeys<Events>>(eventName: T, ev: Events[T]): void;
}
