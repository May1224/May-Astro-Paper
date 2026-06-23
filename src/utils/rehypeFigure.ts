type HastNode = {
  type?: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

export default function rehypeFigure() {
  return (tree: HastNode) => {
    const visit = (node: HastNode) => {
      if (!node.children) return;

      node.children = node.children.map(child => {
        if (
          child.tagName === "p" &&
          child.children?.length === 1 &&
          child.children[0].tagName === "img"
        ) {
          const image = child.children[0];
          const title = image.properties?.title;

          if (typeof title === "string" && title.trim()) {
            delete image.properties?.title;
            return {
              type: "element",
              tagName: "figure",
              properties: {},
              children: [
                image,
                {
                  type: "element",
                  tagName: "figcaption",
                  properties: {},
                  children: [{ type: "text", value: title.trim() }],
                },
              ],
            };
          }
        }

        visit(child);
        return child;
      });
    };

    visit(tree);
  };
}
