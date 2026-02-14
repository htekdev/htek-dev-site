import { visit } from 'unist-util-visit';

/** Wraps <table> elements in a scrollable div for responsive tables */
export default function rehypeWrapTables() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName === 'table' && parent && index != null) {
        const wrapper = {
          type: 'element',
          tagName: 'div',
          properties: { className: ['table-wrapper'] },
          children: [node],
        };
        parent.children[index] = wrapper;
      }
    });
  };
}
