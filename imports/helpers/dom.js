
export function closest (node, nodeName) {
  while (node && node.nodeName.toLowerCase() !== nodeName) {
    node = node.parentNode;
  }
  return node;
}
