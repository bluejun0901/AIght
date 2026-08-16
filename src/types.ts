export type NodeType =
  | 'OBSERVATION'
  | 'HYPOTHESIS'
  | 'DIFFERENTIAL'
  | 'CLINICAL_RULE'
  | 'CONTRAINDICATION'
  | 'ACTION'
  | 'PROPOSED_ACTION'
  | 'RX_INSTRUCTION'
  | 'OUTCOME_PREDICTION';

export interface DAGNode {
  id: string;
  type: NodeType;
  title: string;
  summary: string;
  detail: string;
  confidence: number; // 0 to 100
  computeTime?: string; // e.g. "0.4s compute"
  evidence: string[];
  references?: Array<{
    title: string;
    source: string;
    doiOrUrl?: string;
  }>;
  clinicalMetrics?: Record<string, string | number>;
  flaggedIncorrect?: boolean;
  flagReason?: string;
  x?: number;
  y?: number;
  isNewOrRegenerated?: boolean;
  /** Transient client state while a node is arriving from the model stream. */
  isStreaming?: boolean;
  streamIndex?: number;
}

export interface DAGEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  confidence?: number;
  isFlaggedPath?: boolean;
}

export interface ReasoningDAG {
  generationSource?: 'vllm' | 'fallback';
  nodes: DAGNode[];
  edges: DAGEdge[];
  summaryDiagnosis: string;
  treatmentPlan: string;
  prescriptions: Array<{
    drug: string;
    dosage: string;
    route: string;
    frequency: string;
    duration: string;
    rationale: string;
  }>;
  contraindicationsChecked: string[];
  followUpInstructions: string;
  generatedAt: string;
  prompt: string;
}

/**
 * A local-only case attachment. The object URL is used exclusively for visual
 * reference in the browser and is never included in a reasoning request.
 */
export interface CaseReferenceFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface SavedSession {
  id: string;
  title: string;
  patientNameEncrypted: string;
  patientAgeGenderEncrypted: string;
  patientPromptEncrypted: string;
  previewSummary: string;
  dagData: ReasoningDAG;
  folderId?: string;
  createdAt: string;
  updatedAt: string;
  doctorEmail: string;
  doctorName: string;
  overriddenNodesCount: number;
}

export interface Folder {
  id: string;
  name: string;
  color?: string;
  description?: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  specialty: string;
  licenseNumber: string;
  avatarUrl?: string;
  hospitalAffiliation: string;
}
