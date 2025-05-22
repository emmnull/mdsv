/** @param {import('mdast').Root} tree */
export function meta(tree) {
  if (!tree.data) {
    tree.data = {};
  }
  if (!tree.data.metadata) {
    tree.data.metadata = {};
  }
  return tree.data.metadata;
}

/**
 * @param {import('mdast').Root} tree
 * @param {import('mdast').RootContent} node
 */
export function remove(tree, node) {
  tree.children.splice(tree.children.indexOf(node), 1);
}
