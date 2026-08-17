import type { DAGEdge, DAGNode } from '../types.js';

const START_X = 80;
const START_Y = 140;
const LAYER_GAP = 300;
const ROW_GAP = 145;
const NODE_WIDTH = 220;
const NODE_HEIGHT = 105;

const hasPosition = (node: DAGNode) =>
  Number.isFinite(node.x) && Number.isFinite(node.y);

const overlaps = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  a.x < b.x + NODE_WIDTH + 24 &&
  a.x + NODE_WIDTH + 24 > b.x &&
  a.y < b.y + NODE_HEIGHT + 24 &&
  a.y + NODE_HEIGHT + 24 > b.y;

/**
 * Lays out a DAG from its actual edges. When movableNodeIds is supplied, nodes
 * outside that set keep their user-controlled positions and only newly streamed
 * nodes are fitted around them.
 */
export function layoutDAGByConnections(
  nodes: DAGNode[],
  edges: DAGEdge[],
  movableNodeIds?: ReadonlySet<string>,
): DAGNode[] {
  if (nodes.length === 0) return nodes;

  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const indexById = new Map(nodes.map((node, index) => [node.id, index]));
  const incoming = new Map(nodes.map((node) => [node.id, [] as string[]]));
  const outgoing = new Map(nodes.map((node) => [node.id, [] as string[]]));
  const inDegree = new Map(nodes.map((node) => [node.id, 0]));

  edges.forEach((edge) => {
    if (!nodeById.has(edge.source) || !nodeById.has(edge.target)) return;
    outgoing.get(edge.source)!.push(edge.target);
    incoming.get(edge.target)!.push(edge.source);
    inDegree.set(edge.target, inDegree.get(edge.target)! + 1);
  });

  const layer = new Map(nodes.map((node) => [node.id, 0]));
  const queue = nodes
    .filter((node) => inDegree.get(node.id) === 0)
    .map((node) => node.id);
  const processed = new Set<string>();

  while (queue.length > 0) {
    const id = queue.shift()!;
    processed.add(id);
    outgoing.get(id)!.forEach((targetId) => {
      layer.set(targetId, Math.max(layer.get(targetId)!, layer.get(id)! + 1));
      const remaining = inDegree.get(targetId)! - 1;
      inDegree.set(targetId, remaining);
      if (remaining === 0) queue.push(targetId);
    });
  }

  // Keep malformed/cyclic data usable instead of stacking every node together.
  nodes.forEach((node) => {
    if (processed.has(node.id)) return;
    const parentLayers = incoming.get(node.id)!
      .map((id) => layer.get(id) ?? 0);
    layer.set(node.id, parentLayers.length ? Math.max(...parentLayers) + 1 : 0);
  });

  const layers = new Map<number, DAGNode[]>();
  nodes.forEach((node) => {
    const nodeLayer = layer.get(node.id)!;
    const group = layers.get(nodeLayer) || [];
    group.push(node);
    layers.set(nodeLayer, group);
  });

  const ideal = new Map<string, { x: number; y: number }>();
  [...layers.entries()]
    .sort(([a], [b]) => a - b)
    .forEach(([nodeLayer, group]) => {
      group.sort((a, b) => {
        const connectedOrder = (node: DAGNode) => {
          const neighbors = [...incoming.get(node.id)!, ...outgoing.get(node.id)!];
          if (neighbors.length === 0) return indexById.get(node.id)!;
          return neighbors.reduce((sum, id) => sum + indexById.get(id)!, 0) / neighbors.length;
        };
        return connectedOrder(a) - connectedOrder(b) || indexById.get(a.id)! - indexById.get(b.id)!;
      });

      const layerStartY = START_Y + Math.max(0, (3 - group.length) * 40);
      group.forEach((node, row) => {
        ideal.set(node.id, {
          x: START_X + nodeLayer * LAYER_GAP,
          y: layerStartY + row * ROW_GAP,
        });
      });
    });

  const positions = new Map<string, { x: number; y: number }>();
  nodes.forEach((node) => {
    if (movableNodeIds && !movableNodeIds.has(node.id) && hasPosition(node)) {
      positions.set(node.id, { x: node.x!, y: node.y! });
    }
  });

  const movableNodes = nodes
    .filter((node) => !positions.has(node.id))
    .sort((a, b) => layer.get(a.id)! - layer.get(b.id)! || indexById.get(a.id)! - indexById.get(b.id)!);

  movableNodes.forEach((node) => {
    const parents = incoming.get(node.id)!
      .map((id) => positions.get(id))
      .filter((position): position is { x: number; y: number } => Boolean(position));
    const children = outgoing.get(node.id)!
      .map((id) => positions.get(id))
      .filter((position): position is { x: number; y: number } => Boolean(position));
    const fallback = ideal.get(node.id)!;
    let candidate = { ...fallback };

    if (parents.length > 0) {
      candidate = {
        x: Math.max(...parents.map((position) => position.x)) + LAYER_GAP,
        y: parents.reduce((sum, position) => sum + position.y, 0) / parents.length,
      };
    } else if (children.length > 0) {
      candidate = {
        x: Math.min(...children.map((position) => position.x)) - LAYER_GAP,
        y: children.reduce((sum, position) => sum + position.y, 0) / children.length,
      };
    }

    while ([...positions.values()].some((position) => overlaps(candidate, position))) {
      candidate.y += ROW_GAP;
    }
    positions.set(node.id, candidate);
  });

  return nodes.map((node) => ({ ...node, ...positions.get(node.id)! }));
}

export function getNextStreamingNodePosition(nodes: DAGNode[], edges: DAGEdge[]) {
  if (nodes.length === 0) return { x: START_X, y: START_Y };
  const sourceIds = new Set(edges.map((edge) => edge.source));
  const sinks = nodes.filter((node) => !sourceIds.has(node.id) && hasPosition(node));
  const anchors = sinks.length > 0 ? sinks : nodes.filter(hasPosition);
  const anchor = anchors.reduce((rightmost, node) =>
    (node.x ?? 0) > (rightmost.x ?? 0) ? node : rightmost
  );
  let candidate = { x: (anchor.x ?? START_X) + LAYER_GAP, y: anchor.y ?? START_Y };
  while (nodes.some((node) => hasPosition(node) && overlaps(candidate, { x: node.x!, y: node.y! }))) {
    candidate.y += ROW_GAP;
  }
  return candidate;
}
