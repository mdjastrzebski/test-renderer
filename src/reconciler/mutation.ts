import type { Fiber } from "react-reconciler";

import { mark } from "../performance";
import {
  appendChild as appendChildToParent,
  formatInstanceType,
  insertBefore as insertBeforeChild,
  removeChild as removeChildFromParent,
} from "./instance-tree";
import type { Container, Instance, Props, TestHostConfig, TextInstance, Type } from "./types";

/**
 * Host config methods mutating the committed tree: insertions, removals, updates and
 * hiding/unhiding driven by Suspense.
 */
export const mutationHostConfig = {
  /**
   * The reconciler has two modes: mutation mode and persistent mode. You must specify one of them.
   *
   * If your target platform is similar to the DOM and has methods similar to `appendChild`, `removeChild`,
   * and so on, you'll want to use the **mutation mode**. This is the same mode used by React DOM, React ART,
   * and the classic React Native renderer.
   *
   * ```js
   * const HostConfig = {
   *   // ...
   *   supportsMutation: true,
   *   // ...
   * }
   * ```
   *
   * Depending on the mode, the reconciler will call different methods on your host config.
   * If you're not sure which one you want, you likely need the mutation mode.
   */
  supportsMutation: true,

  /**
   * The reconciler has two modes: mutation mode and persistent mode. You must specify one of them.
   *
   * If your target platform has immutable trees, you'll want the **persistent mode** instead. In that mode,
   * existing nodes are never mutated, and instead every change clones the parent tree and then replaces
   * the whole parent tree at the root. This is the node used by the new React Native renderer, codenamed "Fabric".
   *
   * ```js
   * const HostConfig = {
   *   // ...
   *   supportsPersistence: true,
   *   // ...
   * }
   * ```
   *
   * Depending on the mode, the reconciler will call different methods on your host config.
   * If you're not sure which one you want, you likely need the mutation mode.
   */
  supportsPersistence: false,

  /**
   * #### `appendChild(parentInstance, child)`
   *
   * This method should mutate the `parentInstance` and add the child to its list of children. For example,
   * in the DOM this would translate to a `parentInstance.appendChild(child)` call.
   *
   * Although this method currently runs in the commit phase, you still should not mutate any other nodes
   * in it. If you need to do some additional work when a node is definitely connected to the visible tree, look at `commitMount`.
   */
  appendChild(parentInstance: Instance, child: Instance | TextInstance): void {
    if (globalThis.TEST_RENDERER_ENABLE_PROFILING) {
      mark("reconciler/appendChild", {
        parentType: parentInstance.type,
        childType: formatInstanceType(child),
      });
    }

    appendChildToParent(parentInstance, child);
  },

  /**
   * #### `appendChildToContainer(container, child)`
   *
   * Same as `appendChild`, but for when a node is attached to the root container. This is useful if attaching
   * to the root has a slightly different implementation, or if the root container nodes are of a different
   * type than the rest of the tree.
   */
  appendChildToContainer(container: Container, child: Instance | TextInstance): void {
    if (globalThis.TEST_RENDERER_ENABLE_PROFILING) {
      mark("reconciler/appendChildToContainer", {
        childType: formatInstanceType(child),
      });
    }

    appendChildToParent(container, child);
  },

  /**
   * #### `insertBefore(parentInstance, child, beforeChild)`
   *
   * This method should mutate the `parentInstance` and place the `child` before `beforeChild` in the list of
   * its children. For example, in the DOM this would translate to a `parentInstance.insertBefore(child, beforeChild)` call.
   *
   * Note that React uses this method both for insertions and for reordering nodes. Similar to DOM, it is expected
   * that you can call `insertBefore` to reposition an existing child. Do not mutate any other parts of the tree from it.
   */
  insertBefore(
    parentInstance: Instance,
    child: Instance | TextInstance,
    beforeChild: Instance | TextInstance,
  ): void {
    if (globalThis.TEST_RENDERER_ENABLE_PROFILING) {
      mark("reconciler/insertBefore", {
        parentType: parentInstance.type,
        childType: formatInstanceType(child),
        beforeChildType: formatInstanceType(beforeChild),
      });
    }
    insertBeforeChild(parentInstance, child, beforeChild);
  },

  /**
   * #### `insertInContainerBefore(container, child, beforeChild)
   *
   * Same as `insertBefore`, but for when a node is attached to the root container. This is useful if attaching
   * to the root has a slightly different implementation, or if the root container nodes are of a different type
   * than the rest of the tree.
   */
  insertInContainerBefore(
    container: Container,
    child: Instance | TextInstance,
    beforeChild: Instance | TextInstance,
  ): void {
    if (globalThis.TEST_RENDERER_ENABLE_PROFILING) {
      mark("reconciler/insertInContainerBefore", {
        childType: formatInstanceType(child),
        beforeChildType: formatInstanceType(beforeChild),
      });
    }
    insertBeforeChild(container, child, beforeChild);
  },

  /**
   * #### `removeChild(parentInstance, child)`
   *
   * This method should mutate the `parentInstance` to remove the `child` from the list of its children.
   *
   * React will only call it for the top-level node that is being removed. It is expected that garbage collection
   * would take care of the whole subtree. You are not expected to traverse the child tree in it.
   */
  removeChild(parentInstance: Instance, child: Instance | TextInstance): void {
    if (globalThis.TEST_RENDERER_ENABLE_PROFILING) {
      mark("reconciler/removeChild", {
        parentType: parentInstance.type,
        childType: formatInstanceType(child),
      });
    }
    removeChildFromParent(parentInstance, child);
  },

  /**
   * #### `removeChildFromContainer(container, child)`
   *
   * Same as `removeChild`, but for when a node is detached from the root container. This is useful if attaching
   * to the root has a slightly different implementation, or if the root container nodes are of a different type
   * than the rest of the tree.
   */
  removeChildFromContainer(container: Container, child: Instance | TextInstance): void {
    if (globalThis.TEST_RENDERER_ENABLE_PROFILING) {
      mark("reconciler/removeChildFromContainer", {
        childType: formatInstanceType(child),
      });
    }
    removeChildFromParent(container, child);
  },

  /**
   * #### `resetTextContent(instance)`
   *
   * If you returned `true` from `shouldSetTextContent` for the previous props, but returned `false` from
   * `shouldSetTextContent` for the next props, React will call this method so that you can clear the text
   * content you were managing manually. For example, in the DOM you could set `node.textContent = ''`.
   *
   * If you never return `true` from `shouldSetTextContent`, you can leave it empty.
   */
  resetTextContent(instance: Instance): void {
    mark("reconciler/resetTextContent", { type: instance.type });
  },

  /**
   * #### `commitTextUpdate(textInstance, prevText, nextText)`
   *
   * This method should mutate the `textInstance` and update its text content to `nextText`.
   *
   * Here, `textInstance` is a node created by `createTextInstance`.
   */
  commitTextUpdate(textInstance: TextInstance, oldText: string, newText: string): void {
    mark("reconciler/commitTextUpdate", { oldText, newText });

    textInstance.text = newText;
  },

  /**
   * #### `commitMount(instance, type, props, internalHandle)`
   *
   * This method is only called if you returned `true` from `finalizeInitialChildren` for this instance.
   *
   * It lets you do some additional work after the node is actually attached to the tree on the screen for
   * the first time. For example, the DOM renderer uses it to trigger focus on nodes with the `autoFocus` attribute.
   *
   * Note that `commitMount` does not mirror `removeChild` one to one because `removeChild` is only called for
   * the top-level removed node. This is why ideally `commitMount` should not mutate any nodes other than the
   * `instance` itself. For example, if it registers some events on some node above, it will be your responsibility
   * to traverse the tree in `removeChild` and clean them up, which is not ideal.
   *
   * The `internalHandle` data structure is meant to be opaque. If you bend the rules and rely on its internal
   * fields, be aware that it may change significantly between versions. You're taking on additional maintenance
   * risk by reading from it, and giving up all guarantees if you write something to it.
   *
   * If you never return `true` from `finalizeInitialChildren`, you can leave it empty.
   */
  commitMount(_instance: Instance, type: Type, _props: Props, _internalHandle: Fiber): void {
    mark("reconciler/commitMount", { type });
  },

  /**
   * #### `commitUpdate(instance, type, prevProps, nextProps, internalHandle)`
   *
   * This method should mutate the `instance` according to the set of changes in `updatePayload`. Here, `updatePayload`
   *  is the object that you've returned from `prepareUpdate` and has an arbitrary structure that makes sense for your
   * renderer. For example, the DOM renderer returns an update payload like `[prop1, value1, prop2, value2, ...]` from
   * `prepareUpdate`, and that structure gets passed into `commitUpdate`. Ideally, all the diffing and calculation
   * should happen inside `prepareUpdate` so that `commitUpdate` can be fast and straightforward.
   *
   * The `internalHandle` data structure is meant to be opaque. If you bend the rules and rely on its internal fields,
   *  be aware that it may change significantly between versions. You're taking on additional maintenance risk by
   * reading from it, and giving up all guarantees if you write something to it.
   */
  commitUpdate(
    instance: Instance,
    type: Type,
    _prevProps: Props,
    nextProps: Props,
    internalHandle: Fiber,
  ): void {
    mark("reconciler/commitUpdate", { type });

    instance.type = type;
    if (instance.isHidden && instance.rootContainer.config.transformHiddenInstanceProps != null) {
      instance.propsBeforeHiding = nextProps;
      instance.props = instance.rootContainer.config.transformHiddenInstanceProps({
        props: nextProps,
        type: instance.type,
      });
    } else {
      instance.props = nextProps;
      instance.propsBeforeHiding = null;
    }
    instance.unstable_fiber = internalHandle;
  },

  /**
   * #### `hideInstance(instance)`
   *
   * This method should make the `instance` invisible without removing it from the tree. For example, it can apply
   * visual styling to hide it. It is used by Suspense to hide the tree while the fallback is visible.
   */
  hideInstance(instance: Instance): void {
    mark("reconciler/hideInstance", { type: instance.type });

    if (instance.isHidden) {
      return;
    }

    instance.isHidden = true;
    instance.propsBeforeHiding = instance.props;

    const transformHiddenInstanceProps = instance.rootContainer.config.transformHiddenInstanceProps;
    if (transformHiddenInstanceProps) {
      const { props, type } = instance;
      instance.props = transformHiddenInstanceProps({ props, type });
    }
  },

  /**
   * #### `hideTextInstance(textInstance)`
   *
   * Same as `hideInstance`, but for nodes created by `createTextInstance`.
   */
  hideTextInstance(textInstance: TextInstance): void {
    mark("reconciler/hideTextInstance", { text: textInstance.text });

    textInstance.isHidden = true;
  },

  /**
   * #### `unhideInstance(instance, props)`
   *
   * This method should make the `instance` visible, undoing what `hideInstance` did.
   */
  unhideInstance(instance: Instance, _props: Props): void {
    mark("reconciler/unhideInstance", { type: instance.type });

    instance.isHidden = false;

    const transformHiddenInstanceProps = instance.rootContainer.config.transformHiddenInstanceProps;
    if (transformHiddenInstanceProps && instance.propsBeforeHiding) {
      instance.props = instance.propsBeforeHiding;
      instance.propsBeforeHiding = null;
    }
  },

  /**
   * #### `unhideTextInstance(textInstance, text)`
   *
   * Same as `unhideInstance`, but for nodes created by `createTextInstance`.
   */
  unhideTextInstance(textInstance: TextInstance, _text: string): void {
    mark("reconciler/unhideTextInstance", { text: textInstance.text });

    textInstance.isHidden = false;
  },

  /**
   * #### `clearContainer(container)`
   *
   * This method should mutate the `container` root node and remove all children from it.
   */
  clearContainer(container: Container): void {
    mark("reconciler/clearContainer");

    container.children.forEach((child) => {
      child.parent = null;
    });

    container.children.splice(0);
  },
} satisfies Partial<TestHostConfig>;
