import { ReasoningDAG, DAGNode, DAGEdge } from '../types';
import {
  layoutNodesAndEdges,
  generateDeterministicClinicalDAG,
  generateDeterministicReReasonDAG,
} from './clinicalReasoningEngine';

export { layoutNodesAndEdges };

// Client fallback DAG synthesizer
export function generateClientFallbackDAG(prompt: string, patientDetails?: any): ReasoningDAG {
  return generateDeterministicClinicalDAG(prompt, patientDetails);
}

// Client fallback Re-Reasoning DAG synthesizer
export function generateClientFallbackReReasonDAG(
  prompt: string,
  intactNodes: DAGNode[],
  intactEdges: DAGEdge[],
  flaggedNode: DAGNode,
  correctionInstructions: string
): ReasoningDAG {
  return generateDeterministicReReasonDAG(
    prompt,
    intactNodes,
    intactEdges,
    flaggedNode,
    correctionInstructions
  );
}

export const reReasonClientFallbackDAG = generateClientFallbackReReasonDAG;
