import { CONTAINER_TYPE, Tag } from "./constants";
import type { Container, Instance, TextInstance } from "./reconciler";

/** A node in the JSON representation - either a JsonElement or a text string. */
export type JsonNode = JsonElement | string;

/**
 * JSON representation of a rendered element, compatible with react-test-renderer format.
 */
export type JsonElement = {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: Record<string, any>;
  children: JsonNode[];
  $$typeof: symbol;
};

export function containerToJson(container: Container): JsonElement {
  return {
    type: CONTAINER_TYPE,
    props: {},
    children: childrenToJson(container.children),
    $$typeof: Symbol.for("react.test.json"),
  };
}

export function instanceToJson(instance: Instance): JsonElement | null {
  const shouldExcludeHidden = instance.rootContainer.config.transformHiddenInstanceProps == null;
  if (instance.isHidden && shouldExcludeHidden) {
    return null;
  }

  // We don't include the `children` prop in JSON.
  // Instead, we will include the actual rendered children.
  const { children: _children, ...restProps } = instance.props;

  return {
    type: instance.type,
    props: restProps,
    children: childrenToJson(instance.children),
    $$typeof: Symbol.for("react.test.json"),
  };
}

export function textInstanceToJson(instance: TextInstance): string | null {
  const shouldExcludeHidden = instance.rootContainer.config.transformHiddenInstanceProps == null;
  if (instance.isHidden && shouldExcludeHidden) {
    return null;
  }

  return instance.text;
}

export function childrenToJson(children: Array<Instance | TextInstance>): JsonNode[] {
  const result = [];

  for (const child of children) {
    if (child.tag === Tag.Instance) {
      const renderedChild = instanceToJson(child);
      if (renderedChild != null) {
        result.push(renderedChild);
      }
    } else {
      const renderedChild = textInstanceToJson(child);
      if (renderedChild != null) {
        result.push(renderedChild);
      }
    }
  }

  return result;
}
