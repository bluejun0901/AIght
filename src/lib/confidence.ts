import { DAGNode, ReasoningDAG } from '../types';

const MIN_CONFIDENCE = 90;
const MAX_CONFIDENCE = 100;

export function createRandomConfidence(): number {
  return Math.floor(Math.random() * (MAX_CONFIDENCE - MIN_CONFIDENCE + 1)) + MIN_CONFIDENCE;
}

export function randomizeNodeConfidence<T extends DAGNode>(node: T): T {
  return {
    ...node,
    confidence: createRandomConfidence(),
  };
}

export function randomizeDAGConfidence(dag: ReasoningDAG): ReasoningDAG {
  return {
    ...dag,
    nodes: dag.nodes.map(randomizeNodeConfidence),
  };
}
