import { CONTAINER_TYPE, Tag } from "./constants";
import type { InternalContainer, InternalInstance, InternalTextInstance } from "./reconciler";

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

export function renderContainerToJson(instance: InternalContainer): JsonElement {
  return {
    type: CONTAINER_TYPE,
    props: {},
    children: renderChildrenToJson(instance.children),
    $$typeof: Symbol.for("react.test.json"),
  };
}

export function renderInstanceToJson(instance: InternalInstance): JsonElement | null {
  if (instance.isHidden) {
    return null;
  }

  // We don't include the `children` prop in JSON.
  // Instead, we will include the actual rendered children.
  const { children: _children, ...restProps } = instance.props;

  return {
    type: instance.type,
    props: restProps,
    children: renderChildrenToJson(instance.children),
    $$typeof: Symbol.for("react.test.json"),
  };
}

export function renderTextInstanceToJson(instance: InternalTextInstance): string | null {
  if (instance.isHidden) {
    return null;
  }

  return instance.text;
}

export function renderChildrenToJson(
  children: Array<InternalInstance | InternalTextInstance>,
): JsonNode[] {
  const result = [];

  for (const child of children) {
    if (child.tag === Tag.Instance) {
      const renderedChild = renderInstanceToJson(child);
      if (renderedChild != null) {
        result.push(renderedChild);
      }
    } else {
      const renderedChild = renderTextInstanceToJson(child);
      if (renderedChild != null) {
        result.push(renderedChild);
      }
    }
  }

  return result;
}
