import type { Fiber } from "react-reconciler";

import { Tag } from "../constants";
import { mark, measureEnd, measureStart } from "../performance";
import { TestInstance } from "../test-instance";
import { formatComponentList } from "../utils";
import type {
  Container,
  HostContext,
  Instance,
  Props,
  PublicInstance,
  TestHostConfig,
  TextInstance,
  Type,
} from "./types";
import { appendChildToParent, formatInstanceType, nodeToInstanceMap } from "./utils";

/**
 * Renderer-wide host config: feature flags, commit lifecycle hooks, node/scope lookups, and the
 * render-phase methods for instance creation, host context and public instances.
 */
export const coreHostConfig = {
  /**
   * #### `isPrimaryRenderer`
   *
   * This is a property (not a function) that should be set to `true` if your renderer is the main one on the
   * page. For example, if you're writing a renderer for the Terminal, it makes sense to set it to `true`, but
   * if your renderer is used *on top of* React DOM or some other existing renderer, set it to `false`.
   */
  isPrimaryRenderer: true,

  /**
   * Whether the renderer shouldn't trigger missing `act()` warnings
   */
  warnsIfNotActing: true,

  // -------------------
  // Hydration Methods
  //    (optional)
  // You can optionally implement hydration to "attach" to the existing tree during the initial render instead
  // of creating it from scratch. For example, the DOM renderer uses this to attach to an HTML markup.
  //
  // To support hydration, you need to declare `supportsHydration: true` and then implement the methods in
  // the "Hydration" section [listed in this file](https://github.com/facebook/react/blob/master/packages/react-reconciler/src/forks/ReactFiberHostConfig.custom.js).
  // File an issue if you need help.
  // -------------------
  supportsHydration: false,

  /**
   * #### `createInstance(type, props, rootContainer, hostContext, internalHandle)`
   *
   * This method should return a newly created node. For example, the DOM renderer would call
   * `document.createElement(type)` here and then set the properties from `props`.
   *
   * You can use `rootContainer` to access the root container associated with that tree. For example,
   * in the DOM renderer, this is useful to get the correct `document` reference that the root belongs to.
   *
   * The `hostContext` parameter lets you keep track of some information about your current place in
   * the tree. To learn more about it, see `getChildHostContext` below.
   *
   * The `internalHandle` data structure is meant to be opaque. If you bend the rules and rely on its
   * internal fields, be aware that it may change significantly between versions. You're taking on additional
   * maintenance risk by reading from it, and giving up all guarantees if you write something to it.
   *
   * This method happens **in the render phase**. It can (and usually should) mutate the node it has
   * just created before returning it, but it must not modify any other nodes. It must not register
   * any event handlers on the parent tree. This is because an instance being created doesn't guarantee
   * it would be placed in the tree — it could be left unused and later collected by GC. If you need to do
   * something when an instance is definitely in the tree, look at `commitMount` instead.
   */
  createInstance(
    type: Type,
    props: Props,
    rootContainer: Container,
    _hostContext: HostContext,
    internalHandle: Fiber,
  ) {
    mark("reconciler/createInstance", { type });

    return {
      tag: Tag.Instance,
      type,
      props,
      propsBeforeHiding: null,
      isHidden: false,
      children: [],
      parent: null,
      rootContainer,
      unstable_fiber: internalHandle,
    };
  },

  /**
   * #### `createTextInstance(text, rootContainer, hostContext, internalHandle)`
   *
   * Same as `createInstance`, but for text nodes. If your renderer doesn't support text nodes, you can
   * throw here.
   */
  createTextInstance(
    text: string,
    rootContainer: Container,
    hostContext: HostContext,
    _internalHandle: Fiber,
  ): TextInstance {
    mark("reconciler/createTextInstance", { text });

    if (rootContainer.config.textComponentTypes && !hostContext.isInsideText) {
      const componentTypes =
        rootContainer.config.publicTextComponentTypes ?? rootContainer.config.textComponentTypes;

      throw new Error(
        `Invariant Violation: Text strings must be rendered within a ${formatComponentList(
          componentTypes,
        )} component. Detected attempt to render "${text}" string within a <${
          hostContext.type
        }> component.`,
      );
    }

    return {
      tag: Tag.Text,
      text,
      parent: null,
      rootContainer,
      isHidden: false,
    };
  },

  /**
   * #### `appendInitialChild(parentInstance, child)`
   *
   * This method should mutate the `parentInstance` and add the child to its list of children.
   * For example, in the DOM this would translate to a `parentInstance.appendChild(child)` call.
   *
   * This method happens **in the render phase**. It can mutate `parentInstance` and `child`, but it
   * must not modify any other nodes. It's called while the tree is still being built up and not connected
   * to the actual tree on the screen.
   */
  appendInitialChild(parentInstance: Instance, child: Instance | TextInstance): void {
    if (globalThis.TEST_RENDERER_ENABLE_PROFILING) {
      mark("reconciler/appendInitialChild", {
        parentType: parentInstance.type,
        childType: formatInstanceType(child),
      });
    }

    appendChildToParent(parentInstance, child);
  },

  /**
   * #### `finalizeInitialChildren(instance, type, props, rootContainer, hostContext)`
   *
   * In this method, you can perform some final mutations on the `instance`. Unlike with `createInstance`,
   * by the time `finalizeInitialChildren` is called, all the initial children have already been added to
   * the `instance`, but the instance itself has not yet been connected to the tree on the screen.
   *
   * This method happens **in the render phase**. It can mutate `instance`, but it must not modify any other
   * nodes. It's called while the tree is still being built up and not connected to the actual tree on the screen.
   *
   * There is a second purpose to this method. It lets you specify whether there is some work that needs to
   * happen when the node is connected to the tree on the screen. If you return `true`, the instance will
   * receive a `commitMount` call later. See its documentation below.
   *
   * If you don't want to do anything here, you should return `false`.
   */
  finalizeInitialChildren(
    instance: Instance,
    _type: Type,
    _props: Props,
    _rootContainer: Container,
    _hostContext: HostContext,
  ): boolean {
    mark("reconciler/finalizeInitialChildren", { type: instance.type });

    return false;
  },

  /**
   * #### `shouldSetTextContent(type, props)`
   *
   * Some target platforms support setting an instance's text content without manually creating a text node.
   * For example, in the DOM, you can set `node.textContent` instead of creating a text node and appending it.
   *
   * If you return `true` from this method, React will assume that this node's children are text, and will
   * not create nodes for them. It will instead rely on you to have filled that text during `createInstance`.
   * This is a performance optimization. For example, the DOM renderer returns `true` only if `type` is a
   * known text-only parent (like `'textarea'`) or if `props.children` has a `'string'` type. If you return `true`,
   *  you will need to implement `resetTextContent` too.
   *
   * If you don't want to do anything here, you should return `false`.
   * This method happens **in the render phase**. Do not mutate the tree from it.
   */
  shouldSetTextContent(type: Type, _props: Props): boolean {
    mark("reconciler/shouldSetTextContent", { type, result: false });

    return false;
  },

  /**
   * #### `getRootHostContext(rootContainer)`
   *
   * This method lets you return the initial host context from the root of the tree. See `getChildHostContext`
   * for the explanation of host context.
   *
   * If you don't intend to use host context, you can return `null`.
   * This method happens **in the render phase**. Do not mutate the tree from it.
   */
  getRootHostContext(rootContainer: Container): HostContext | null {
    mark("reconciler/getRootHostContext");

    return {
      type: "ROOT",
      config: rootContainer.config,
      isInsideText: false,
    };
  },

  /**
   * #### `getChildHostContext(parentHostContext, type, rootContainer)`
   *
   * Host context lets you track some information about where you are in the tree so that it's available
   * inside `createInstance` as the `hostContext` parameter. For example, the DOM renderer uses it to track
   * whether it's inside an HTML or an SVG tree, because `createInstance` implementation needs to be
   * different for them.
   *
   * If the node of this `type` does not influence the context you want to pass down, you can return
   * `parentHostContext`. Alternatively, you can return any custom object representing the information
   * you want to pass down.
   *
   * If you don't want to do anything here, return `parentHostContext`.
   *
   * This method happens **in the render phase**. Do not mutate the tree from it.
   */
  getChildHostContext(parentHostContext: HostContext, type: Type): HostContext {
    mark("reconciler/getChildHostContext", { type });

    const isInsideText = Boolean(parentHostContext.config.textComponentTypes?.includes(type));
    return { ...parentHostContext, type: type, isInsideText };
  },

  /**
   * #### `getPublicInstance(instance)`
   *
   * Determines what object gets exposed as a ref. You'll likely want to return the `instance` itself. But
   * in some cases it might make sense to only expose some part of it.
   *
   * If you don't want to do anything here, return `instance`.
   */
  getPublicInstance(instance: Instance | TextInstance): PublicInstance {
    if (globalThis.TEST_RENDERER_ENABLE_PROFILING) {
      mark("reconciler/getPublicInstance", {
        type: formatInstanceType(instance),
      });
    }

    switch (instance.tag) {
      case Tag.Instance: {
        const testInstance = TestInstance.fromInstance(instance);
        nodeToInstanceMap.set(testInstance, instance);
        return testInstance;
      }

      default:
        return null;
    }
  },

  /**
   * #### `prepareForCommit(containerInfo)`
   *
   * This method lets you store some information before React starts making changes to the tree on
   * the screen. For example, the DOM renderer stores the current text selection so that it can later
   * restore it. This method is mirrored by `resetAfterCommit`.
   *
   * Even if you don't want to do anything here, you need to return `null` from it.
   */
  prepareForCommit(_containerInfo: Container) {
    mark("reconciler/prepareForCommit");
    measureStart("react/commit");

    return null; // noop
  },

  /**
   * #### `resetAfterCommit(containerInfo)`
   *
   * This method is called right after React has performed the tree mutations. You can use it to restore
   * something you've stored in `prepareForCommit` — for example, text selection.
   *
   * You can leave it empty.
   */
  resetAfterCommit(_containerInfo: Container): void {
    measureEnd("react/commit");
    mark("reconciler/resetAfterCommit");
  },

  /**
   * #### `preparePortalMount(containerInfo)`
   *
   * This method is called for a container that's used as a portal target. Usually you can leave it empty.
   */
  preparePortalMount(_containerInfo: Container): void {
    mark("reconciler/preparePortalMount");
  },

  getInstanceFromNode(node: object): Fiber | null | undefined {
    mark("reconciler/getInstanceFromNode");

    const instance = nodeToInstanceMap.get(node);
    if (instance !== undefined) {
      return instance.unstable_fiber;
    }

    return null;
  },

  beforeActiveInstanceBlur(): void {
    mark("reconciler/beforeActiveInstanceBlur");
  },

  afterActiveInstanceBlur(): void {
    mark("reconciler/afterActiveInstanceBlur");
  },

  prepareScopeUpdate(scopeInstance: object, instance: Instance): void {
    mark("reconciler/prepareScopeUpdate");

    nodeToInstanceMap.set(scopeInstance, instance);
  },

  getInstanceFromScope(scopeInstance: object): Instance | null {
    mark("reconciler/getInstanceFromScope");

    return nodeToInstanceMap.get(scopeInstance) ?? null;
  },

  detachDeletedInstance(_node: Instance): void {
    mark("reconciler/detachDeletedInstance");
  },
} satisfies Partial<TestHostConfig>;
