/**
 * Main module of salve-dom.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
import { EName, EventSet, Grammar, ValidationError } from "salve-annos/build/dist/salve.min";
import { Consuming } from "./event_emitter";
export declare const version = "6.0.1";
declare const Node: {
    ELEMENT_NODE: number;
    ATTRIBUTE_NODE: number;
    TEXT_NODE: number;
    CDATA_SECTION_NODE: number;
    PROCESSING_INSTRUCTION_NODE: number;
    COMMENT_NODE: number;
    DOCUMENT_NODE: number;
    DOCUMENT_TYPE_NODE: number;
    DOCUMENT_FRAGMENT_NODE: number;
};
export declare const isAttr: (it: Node) => it is Attr;
export declare enum WorkingState {
    /**
     * The validator is stopped but has not completed a validation pass yet.
     */
    INCOMPLETE = 1,
    /**
     * The validator is working on validating the document.
     */
    WORKING = 2,
    /**
     * The validator is stopped and has found the document invalid. Note that this
     * state happens *only* if the whole document was validated.
     */
    INVALID = 3,
    /**
     * The validator is stopped and has found the document valid. Note that this
     * state happens *only* if the whole document was validated.
     */
    VALID = 4
}
export interface ErrorData {
    error: ValidationError;
    node?: Node | null;
    index?: number;
}
export interface ResetData {
    at: number;
}
export interface WorkingStateData {
    state: WorkingState;
    partDone: number;
}
/**
 * A mapping of event name to event type for the events that [[Validator]]
 * supports. This is used by TypeScript's generics but it is also a nice handy
 * reference.
 */
export interface Events {
    "error": ErrorData;
    "reset-errors": ResetData;
    "state-update": WorkingStateData;
    "possible-due-to-wildcard-change": Node;
}
export interface CustomNodeProperties {
    "EventIndexAfter": number;
    "EventIndexAfterStart": number;
    "EventIndexBeforeAttributes": number;
    "EventIndexAfterAttributes": number;
    "PossibleDueToWildcard": boolean;
    "ErrorId": number;
}
export declare type CustomNodeProperty = keyof CustomNodeProperties;
/**
 * The options accepted by the validator.
 */
export interface Options {
    /**
     * A prefix string to use in front of the expando properties set by the
     * validator.
     */
    prefix?: string;
    /**
     * The timeout between one cycle and the next. This is the number of
     * milliseconds that elapse before the next cycle runs.
     */
    timeout?: number;
    /**
     * The maximum number of milliseconds a cycle may run. A cycle will stop after
     * it has used the number of milliseconds listed here. Setting this to 0 means
     * "run until done" which is not generally recommended.
     */
    maxTimespan?: number;
    /**
     * The distance between walkers under which we skip saving a walker in the
     * cache. This is a setting you should probably not mess with unless you know
     * what you are doing.
     */
    walkerCacheGap?: number;
}
/**
 * A document validator. The validator assumes that the DOM tree it uses for
 * validation is always normalized: that is, there are no empty text nodes and
 * there cannot be two adjacent text nodes.
 *
 * This validator operates by scheduling work cycles. Given the way JavaScript
 * works, if the validator just validated the whole document in one shot, it
 * would take all processing power until done, and everything else would
 * block. Rather than do this, it performs a bit of work, stops, and performs
 * another bit, etc. Each bit of work is called a "cycle". The options passed to
 * the validator at creation determine how long a cycle may last and how much
 * time elapses between cycles. (Yes, using ``Worker``s has been considered as
 * an option but it would complicate the whole deal by quite a bit due to
 * communication costs between a ``Worker`` and the main process.)
 *
 * @param schema A ``Grammar`` object that has already been produced from
 * ``salve``.
 *
 * @param root The root of the DOM tree to validate. This root contains the
 * document to validate but is not part of the document itself.
 *
 * @param options Some options driving how the validator works.
 */
export declare class Validator {
    private readonly schema;
    private readonly root;
    private _cycleEntered;
    private _timeout;
    private _maxTimespan;
    private _timeoutId;
    private _resetting;
    private _errors;
    private _errorsSeen;
    private readonly _boundWrapper;
    private _validationEvents;
    private _validationWalker;
    private _workingState;
    private _partDone;
    private _validationStage;
    private _previousChild;
    private _validationStack;
    private _curEl;
    private _walkerCache;
    private _walkerCacheMax;
    private readonly _prefix;
    private _walkerCacheGap;
    private readonly _events;
    readonly events: Consuming<Events>;
    constructor(schema: Grammar, root: Element | Document, options?: Options);
    private makeKey;
    /**
     * Function allowing to get a custom properties set on ``Node`` objects by
     * this class.
     */
    getNodeProperty<T extends CustomNodeProperty>(node: Node, key: T): CustomNodeProperties[T] | undefined;
    /**
     * Function allowing to set a custom properties set on ``Node`` objects by
     * this class.
     */
    private _setNodeProperty;
    private _clearNodeProperties;
    /**
     * Starts the background validation process.
     */
    start(): void;
    /**
     * Get the namespaces defined in the schema passed to the Validator.
     *
     * @returns The namespaces known to the schema.
     */
    getSchemaNamespaces(): string[];
    /**
     * Get the namespaces used in the document. This method does not cache its
     * information and scan the whole document independently of the current
     * validation status.
     *
     * @returns An object whose keys are namespace prefixes and values are lists
     * of namespace URIs.  The values are lists because prefixes can be redefined
     * in a document.
     */
    getDocumentNamespaces(): Record<string, string[]>;
    /**
     * Convenience method. The bound version of this method
     * (``this._boundWrapper``) is what is called by the timeouts to perform the
     * background validation.
     */
    private _workWrapper;
    /**
     * Controller method for the background validation. Keeps the validator
     * running only until done or until the maximum time span for one run
     * of the validator is reached.
     *
     * @returns False if there is no more work to do. True otherwise.
     */
    private _work;
    /**
     * Performs one cycle of validation. "One cycle" is an arbitrarily small unit
     * of work.
     *
     * @returns False if there is no more work to be done. True otherwise.
     *
     * @throws {Error} When there is an internal error.
     */
    private _cycle;
    /**
     * Stops background validation.
     */
    stop(): void;
    /**
     * This private method takes an argument that allows setting the working state
     * to a specific value. This is useful to reduce the number of
     * ``state-update`` events emitted when some internal operations are
     * performed. The alternative would be to perform a state change before or
     * after the call to ``stop``, which would result in more events being
     * emitted.
     *
     * If the parameter is unused, then the logic is that if we were not yet in a
     * VALID or INVALID state, the stopping now leads to the INCOMPLETE state.
     *
     * @param state The state with which to stop.
     */
    private _stop;
    /**
     * Run document-level validation that cannot be modeled by Relax NG.  The
     * default implementation does nothing. Deriving classes may override it to
     * call [[_processError]].
     */
    protected _runDocumentValidation(): void;
    /**
     * Restarts validation from a specific point. After the call returns, the
     * background validation will be in effect. (So calling it on a stopped
     * validator has the side effect of starting it.)
     *
     * @param node The element to start validation from.
     */
    restartAt(node: Node): void;
    /**
     * Reset validation to continue from a certain point.
     *
     * @param node The element to start validation from.
     */
    resetTo(node: Node): void;
    private _erase;
    /**
     * Resets validation to continue from a specific point. Any further work done
     * by the validator will start from the point specified.
     *
     * @param node The element to start validation from.
     *
     * @emits module:validator~Validator#reset-errors
     */
    private _resetTo;
    /**
     * Sets the working state of the validator. Emits a "state-update" event if
     * the state has changed.
     *
     * @param newState The new state of the validator.
     *
     * @param newDone The new portion of work done.
     *
     * @emits module:validator~Validator#state-update
     */
    private _setWorkingState;
    /**
     * Gets the validator working state.
     *
     * @returns The working state
     */
    getWorkingState(): WorkingStateData;
    /**
     * The current set of errors.
     */
    get errors(): ErrorData[];
    /**
     * Processes the result of firing a tag event. It will emit an "error"
     * event for each error.
     *
     * @param results The results of the walker's ``fireEvent`` call.
     *
     * @param node The data node to which the result belongs.
     *
     * @param index The index into ``node`` to which the result belongs.
     *
     * @emits module:validator~Validator#error
     */
    private _processEventResult;
    /**
     * This method should be called whenever a new error is detected. It
     * records the error and emits the corresponding event.
     *
     * @param error The error found.
     *
     * @emits module:validator~Validator#error
     */
    protected _processError(error: ErrorData): void;
    private _fireContextEvents;
    /**
     * Fires all the attribute events for a given element.
     */
    private _fireAttributeEvents;
    /**
     * Fires an attributeName event. If the attribute name is in a namespace and
     * cannot be resolved, the event is not fired.
     *
     * @returns True if the event was actually fired, false if not.
     */
    private _fireAttributeNameEvent;
    private _enterContextWithMapping;
    private _leaveContext;
    /**
     * Convenience method to fire events.
     *
     * @param walker The walker on which to fire events.
     *
     * @param name The name of the event to fire.
     *
     * @param params The event's parameters.
     *
     * @param el The DOM node associated with this event. Both ``el`` and ``ix``
     * can be undefined for events that have no location associated with them.
     *
     * @param ix The index into ``el`` associated with this event, or a ``Node``
     * which must be a child of ``el``. The index will be computed from the
     * location of the child passed as this parameter in ``el``.
     */
    private _fireAndProcessEvent;
    /**
     * Force an immediate validation which is guaranteed to go at least up to the
     * point specified by ``container, index``, exclusively. These parameters are
     * interpreted in the same way a DOM caret is.
     *
     * If the validation has not yet reached the location specified, validation
     * will immediately be performed to reach the point. If the validation has
     * already reached this point, then this call is a no-op.
     *
     * There is one exception in the way the ``container, index`` pair is
     * interpreted. If the container is the ``root`` that was passed when
     * constructing the Validator, then setting ``index`` to a negative value will
     * result in the validation validating all elements **and** considering the
     * document complete. So unclosed tags or missing elements will be
     * reported. Otherwise, the validation goes up the ``index`` but considers the
     * document incomplete, and won't report the errors that are normally reported
     * at the end of a document. For instance, unclosed elements won't be
     * reported.
     *
     * @param container The location up to where to validate.
     *
     * @param index The location up to where to validate.
     *
     * @param attributes Whether we are interested to validate up to and including
     * the attribute events of the node pointed to by ``container, index``. The
     * validation ends before leaving the start tag.
     *
     * @throws {Error} If ``container`` is not of element or text type.
     */
    private _validateUpTo;
    /**
     * Gets the walker which would represent the state of parsing at the point
     * expressed by the parameters. See [[Validator.validateUpTo]] for the details
     * of how these parameters are interpreted.
     *
     * **The walker returned by this function is not guaranteed to be a new
     *   instance. Callers should not modify the walker returned but instead clone
     *   it.**
     *
     * @param container
     *
     * @param index
     *
     * @param attributes Whether we are interested to validate up to but not
     * including the attribute events of the node pointed to by ``container,
     * index``. If ``true`` the walker returned will have all events fired on it
     * up to, and including, those attribute events on the element pointed to by
     * ``container, index``.
     *
     * @returns The walker.
     *
     * @throws {EventIndexException} If it runs out of events or computes an event
     * index that makes no sense.
     */
    private _getWalkerAt;
    private readyWalker;
    /**
     * Returns the set of possible events for the location specified by the
     * parameters.
     *
     * @param container Together with ``index`` this parameter is interpreted to
     * form a location.
     *
     * @param index Together with ``container`` this parameter is interpreted to
     * form a location.
     *
     * @param attributes
     *
     * @returns A set of possible events.
     */
    possibleAt(container: Node, index: number, attributes?: boolean): EventSet;
    /**
     * Finds the locations in a node where a certain validation event is
     * possible.
     *
     * @param container A node.
     *
     * @param name The name of the event to search for.
     *
     * @param params The parameters of the event to search for. The the same data
     * as would be passed to ``fireEvent``.
     *
     * @returns The locations in ``container`` where the event is possible.
     */
    possibleWhere(container: Node, name: string, ...params: string[]): number[];
    /**
     * Validate a DOM fragment as if it were present at the point specified in the
     * parameters in the DOM tree being validated.
     *
     * WARNING: This method will not catch unclosed elements. This is because the
     * fragment is not considered to be a "complete" document. Unclosed elements
     * or fragments that are not well-formed must be caught by other means.
     *
     * @param container The location in the tree to start at.
     *
     * @param index The location in the tree to start at.
     *
     * @param toParse The fragment to parse.
     *
     * @returns Returns an array of errors if there is an error. Otherwise returns
     * false.
     */
    speculativelyValidate(container: Node, index: number, toParse: Node | Node[]): ErrorData[] | false;
    /**
     * Validate a DOM fragment as if it were present at the point specified in the
     * parameters in the DOM tree being validated.
     *
     * WARNING: This method will not catch unclosed elements. This is because the
     * fragment is not considered to be a "complete" document. Unclosed elements
     * or fragments that are not well-formed must be caught by other means.
     *
     * @param container The location in the tree to start at.
     *
     * @param index The location in the tree to start at.
     *
     * @param toParse The fragment to parse. See above.
     *
     * @returns Returns an array of errors if there is an error. Otherwise returns
     * false.
     */
    speculativelyValidateFragment(container: Node, index: number, toParse: Element): ErrorData[] | false;
    /**
     * Obtain the validation errors that belong to a specific node.
     *
     * The term "that belong to" has a specific meaning here:
     *
     * - An error in the contents of an element belongs to the element whose
     *   contents are incorrect. For instance if in the sequence
     *   ``<foo><blip/></foo>`` the tag ``<blip/>`` is out of place, then the
     *   error belongs to the node for the element ``foo``, not the node for the
     *   element ``blip``.
     *
     * - Attribute errors belong to the element node to which the attributes
     *   belong.
     *
     * @param node The node whose errors we want to get.
     *
     * @returns The errors.
     */
    getErrorsFor(node: Node): ErrorData[];
    /**
     * Sets a flag indicating whether a node is possible only due to a name
     * pattern wildcard, and emits an event if setting the flag is a change from
     * the previous value of the flag. It does this by inspecting the event that
     * would be fired when ``node`` is validated. The parameters ``eventName``,
     * ``ns`` and ``name`` are used to determine what we are looking for among
     * possible events.
     *
     * @param node The node we want to check.
     *
     * @param walker A walker whose last fired event is the one just before the
     * event that would be fired when validating ``node``.
     *
     * @param eventName The event name we are interested in.
     *
     * @param ns The namespace to use with the event.
     *
     * @param name The name to use with the event.
     *
     * @emits module:validator~Validator#event:possible-due-to-wildcard-change
     *
     */
    private _setPossibleDueToWildcard;
    /**
     * Resolve a qualified name to an expanded name. See
     * ``"salve".NameResolver.resolveName`` for what resolving means.  This method
     * takes into account namespaces defined on parent nodes.
     *
     * @param container Where to perform the operation.
     *
     * @param index Where to perform the operation.
     *
     * @param name The name to rresolve.
     *
     * @param attributes Whether the name is an attribute's name.
     *
     * @return The resolved name.
     */
    resolveNameAt(container: Node, index: number, name: string, attribute?: boolean): EName | undefined;
    /**
     * Unresolve an expanded name to a qualified name. See
     * ``"salve".NameResolver.unresolveName`` for what unresolving means. This
     * method takes into account namespaces defined on parent nodes.
     *
     * @param container Where to perform the operation.
     *
     * @param index Where to perform the operation.
     *
     * @param uri The URI to unresolve.
     *
     * @param name The name to unresolve.
     *
     * @return The unresolved name.
     */
    unresolveNameAt(container: Node, index: number, uri: string, name: string): string | undefined;
}
/**
 * Exception to be raised if we cannot parse a string as an XML document.
 */
export declare class ParsingError extends Error {
    readonly xmlErrors: string;
    /**
     * @param xmlErrors A string that contains the errors reported. The library
     * here simply serializes the error document produced by the parser.
     */
    constructor(xmlErrors: string);
}
/**
 * A utility function that detects whether the parsing fails and throws an error
 * in such case.
 *
 * Note that if you pass a well-formed and correctly structured error document
 * to this function, the result will look like an error, even though it was
 * parsed properly. Given the way ``DOMParser`` reports errors, this cannot be
 * helped.
 *
 * @param source The XML to parse.
 *
 * @param win The window from which to create a ``DOMParser``.
 *
 * @returns The parsed document.
 *
 * @throws {ParsingError} If the source cannot be parsed.
 */
export declare function safeParse(source: string, win?: Window): Document;
export {};
