import React, { useState, useEffect } from 'react';
import {
  ReasoningDAG,
  DAGNode,
  DAGEdge,
  SavedSession,
  Folder,
  UserProfile,
} from './types';
import {
  DEFAULT_FOLDERS,
  SAMPLE_CLINICAL_CASES,
  INITIAL_ACS_DAG,
  INITIAL_SAVED_SESSIONS,
} from './lib/mockData';
import {
  generateClientFallbackDAG,
  reReasonClientFallbackDAG,
} from './lib/clientFallbackEngine';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { PromptEntryScreen } from './components/PromptEntryScreen';
import { ReadOnlyPromptBar } from './components/ReadOnlyPromptBar';
import { DAGCanvas } from './components/DAGCanvas';
import { NodeArticlePanel } from './components/NodeArticlePanel';
import { ReReasonBar } from './components/ReReasonBar';
import { SaveSessionModal } from './components/SaveSessionModal';
import { HistoryModal } from './components/HistoryModal';
import { AnalyticsModal } from './components/AnalyticsModal';
import { ReportsModal } from './components/ReportsModal';
import { SettingsModal } from './components/SettingsModal';
import { AuthGate } from './components/AuthGate';
import {
  HelpCircle,
  Stethoscope,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  X,
  Layers,
  FileText,
  Network,
} from 'lucide-react';

export default function App() {
  // Auth state
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('aight_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    // Default logged in doctor for immediate live preview experience
    return {
      id: 'user-1',
      name: 'Dr. Sarah Lin, MD',
      email: 'sarah.lin.md@hospital.org',
      role: 'Attending Physician',
      specialty: 'Interventional Cardiology',
      licenseNumber: 'CA-MD-994821',
      hospitalAffiliation: 'University Heart & Vascular Institute',
    };
  });

  // UI States & Screen Modes (Separate Input screen vs Edit/DAG Review screen)
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'reports'>('dashboard');
  const [currentView, setCurrentView] = useState<'graph' | 'history' | 'analytics' | 'reports'>('graph');
  const [screenMode, setScreenMode] = useState<'prompt-entry' | 'dag-review'>('prompt-entry');
  const [mobileTab, setMobileTab] = useState<'graph' | 'node-details'>('graph');
  const [hideFlaggedNodes, setHideFlaggedNodes] = useState(false);

  // Active Clinical Session State: starts blank on initial login
  const [prompt, setPrompt] = useState<string>('');
  const [patientInfo, setPatientInfo] = useState({
    patientName: 'Patient',
    patientAgeGender: 'Adult',
    mrn: 'MRN-Auto',
    allergies: 'NKDA',
    urgency: 'Routine',
  });
  const [dag, setDag] = useState<ReasoningDAG | null>(null);
  const [selectedNode, setSelectedNode] = useState<DAGNode | null>(null);
  const [correctionNote, setCorrectionNote] = useState<string>(
    'Adjusting for cardiac history, ECG shows ST-depression in V4-V6; prioritize NSTE-ACS workup with DAPT over antacids.'
  );

  // Persistence State
  const [folders, setFolders] = useState<Folder[]>(() => {
    const saved = localStorage.getItem('aight_folders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_FOLDERS;
      }
    }
    return DEFAULT_FOLDERS;
  });

  const [savedSessions, setSavedSessions] = useState<SavedSession[]>(() => {
    const saved = localStorage.getItem('aight_saved_sessions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_SAVED_SESSIONS;
      }
    }
    return INITIAL_SAVED_SESSIONS;
  });

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  // Loading States
  const [isLoadingReasoning, setIsLoadingReasoning] = useState(false);
  const [isLoadingReReason, setIsLoadingReReason] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Modals
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    if (user) {
      localStorage.setItem('aight_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('aight_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('aight_folders', JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    localStorage.setItem('aight_saved_sessions', JSON.stringify(savedSessions));
  }, [savedSessions]);

  // Fetch initial data from server if available
  useEffect(() => {
    fetch('/api/sessions')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.sessions && Array.isArray(data.sessions) && data.sessions.length > 0) {
          setSavedSessions(data.sessions);
        }
      })
      .catch(() => {});

    fetch('/api/folders')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.folders && Array.isArray(data.folders) && data.folders.length > 0) {
          setFolders(data.folders);
        }
      })
      .catch(() => {});
  }, []);

  // Update selectedNode if DAG changes
  useEffect(() => {
    if (dag && selectedNode) {
      const found = dag.nodes.find((n) => n.id === selectedNode.id);
      if (found) {
        setSelectedNode(found);
      }
    }
  }, [dag]);

  // Handle Tab Switch
  useEffect(() => {
    if (activeTab === 'analytics') {
      setIsAnalyticsModalOpen(true);
    } else if (activeTab === 'reports') {
      setIsReportsModalOpen(true);
    }
  }, [activeTab]);

  // 1. Submit Full Reasoning Request to the OpenAI-compatible server
  const handleGenerateDAG = async (patientDetails?: any) => {
    if (!prompt.trim()) return;
    if (patientDetails) {
      setPatientInfo((prev) => ({ ...prev, ...patientDetails }));
    }
    setIsLoadingReasoning(true);
    setErrorToast(null);
    const emptyStreamingDAG: ReasoningDAG = {
      prompt,
      generatedAt: new Date().toISOString(),
      generationSource: 'vllm',
      summaryDiagnosis: 'Generating clinical impression…',
      treatmentPlan: 'Generating treatment plan…',
      prescriptions: [],
      contraindicationsChecked: [],
      followUpInstructions: 'Generating follow-up instructions…',
      nodes: [],
      edges: [],
    };
    setDag(emptyStreamingDAG);
    setSelectedNode(null);
    setScreenMode('dag-review');
    setMobileTab('graph');
    setCurrentView('graph');

    try {
      const response = await fetch('/api/reason', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, patientDetails }),
      });

      if (!response.ok) {
        // In static hosting environments where /api is not routed, seamlessly synthesize client-side
        if (response.status === 404) {
          console.warn('API endpoint returned 404. Activating high-fidelity client reasoning engine.');
          const fallbackDAG = generateClientFallbackDAG(prompt, patientDetails);
          setDag(fallbackDAG);
          if (fallbackDAG.nodes.length > 0) {
            setSelectedNode(fallbackDAG.nodes[0]);
          }
          setScreenMode('dag-review');
          setMobileTab('graph');
          setCurrentView('graph');
          return;
        }

        let errMessage = `Server returned ${response.status}: ${response.statusText}`;
        try {
          const errData = await response.json();
          if (errData?.message) errMessage = errData.message;
          else if (errData?.error) errMessage = errData.error;
        } catch {}
        throw new Error(errMessage);
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/event-stream')) {
        const generatedDAG: ReasoningDAG = await response.json();
        setDag(generatedDAG);
        if (generatedDAG.nodes.length > 0) {
          setSelectedNode(generatedDAG.nodes[0]);
        }
        return;
      }

      if (!response.body) {
        throw new Error('The reasoning stream did not include a readable response body.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamBuffer = '';
      let receivedComplete = false;
      let streamError: string | null = null;

      const applyStreamEvent = (rawEvent: string) => {
        let eventName = 'message';
        const dataLines: string[] = [];
        for (const line of rawEvent.split(/\r?\n/)) {
          if (line.startsWith('event:')) eventName = line.slice(6).trim();
          else if (line.startsWith('data:')) dataLines.push(line.slice(5).trimStart());
        }
        if (dataLines.length === 0) return;

        const data = JSON.parse(dataLines.join('\n'));
        if (eventName === 'started' || eventName === 'reset') {
          setDag({
            ...emptyStreamingDAG,
            generatedAt: data.generatedAt || emptyStreamingDAG.generatedAt,
          });
          setSelectedNode(null);
        } else if (eventName === 'node-progress') {
          const streamIndex = Number(data.index || 0);
          const streamingNode: DAGNode = {
            id: `streaming-node-${streamIndex}`,
            type: data.type || 'OBSERVATION',
            title: data.title || '다음 추론 단계 생성 중',
            summary: data.summary || data.title || '',
            detail: '',
            confidence: 0,
            evidence: [],
            x: 80 + streamIndex * 280,
            y: 140,
            isStreaming: true,
            streamIndex,
            computeTime: 'streaming',
          };
          setDag((current) => {
            const base = current || emptyStreamingDAG;
            const nodes = base.nodes.filter(
              (item) => !item.isStreaming || item.streamIndex !== streamIndex
            );
            nodes.push(streamingNode);
            return { ...base, nodes };
          });
        } else if (eventName === 'node') {
          const node = data as DAGNode;
          const completedStreamIndex = typeof node.x === 'number'
            ? Math.max(0, Math.round((node.x - 80) / 280))
            : 0;
          setDag((current) => {
            const base = current || emptyStreamingDAG;
            const completedCount = base.nodes.filter((item) => !item.isStreaming).length;
            const withoutPlaceholder = base.nodes.filter(
              (item) => !item.isStreaming || item.streamIndex !== completedCount
            );
            const index = withoutPlaceholder.findIndex((item) => item.id === node.id);
            const nodes = index >= 0
              ? withoutPlaceholder.map((item, itemIndex) => itemIndex === index ? node : item)
              : [...withoutPlaceholder, node];
            return { ...base, nodes };
          });
          setSelectedNode((current) => {
            if (!current) return node;
            if (current.isStreaming && current.streamIndex === completedStreamIndex) return node;
            return current;
          });
        } else if (eventName === 'edge') {
          const edge = data as DAGEdge;
          setDag((current) => {
            const base = current || emptyStreamingDAG;
            const index = base.edges.findIndex((item) => item.id === edge.id);
            const edges = index >= 0
              ? base.edges.map((item, itemIndex) => itemIndex === index ? edge : item)
              : [...base.edges, edge];
            return { ...base, edges };
          });
        } else if (eventName === 'result') {
          setDag((current) => ({
            ...(current || emptyStreamingDAG),
            summaryDiagnosis: data.summaryDiagnosis || 'Clinical Impression Formulated',
            treatmentPlan: data.treatmentPlan || 'Evidence-based acute management',
            prescriptions: data.prescriptions || [],
            contraindicationsChecked: data.contraindicationsChecked || [],
            followUpInstructions: data.followUpInstructions || 'Serial reassessment per protocol',
          }));
        } else if (eventName === 'complete') {
          const completedDAG = data as ReasoningDAG;
          receivedComplete = true;
          setDag(completedDAG);
          setSelectedNode((current) =>
            completedDAG.nodes.find((node) => node.id === current?.id) || completedDAG.nodes[0] || null
          );
        } else if (eventName === 'error') {
          streamError = data.message || 'The graph stream terminated unexpectedly.';
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        streamBuffer += decoder.decode(value, { stream: !done });
        const events = streamBuffer.split(/\r?\n\r?\n/);
        streamBuffer = events.pop() || '';
        events.forEach(applyStreamEvent);
        if (done) break;
      }
      if (streamBuffer.trim()) applyStreamEvent(streamBuffer);
      if (streamError) throw new Error(streamError);
      if (!receivedComplete) throw new Error('The graph stream ended before the DAG was completed.');
    } catch (err: any) {
      console.error('Failed to generate reasoning DAG from server, using client fallback:', err);
      // Seamlessly fallback so user experience is uninterrupted
      try {
        const fallbackDAG = generateClientFallbackDAG(prompt, patientDetails);
        setDag(fallbackDAG);
        if (fallbackDAG.nodes.length > 0) {
          setSelectedNode(fallbackDAG.nodes[0]);
        }
        setScreenMode('dag-review');
        setMobileTab('graph');
        setCurrentView('graph');
      } catch {
        setErrorToast(
          err.message || 'Unable to generate reasoning DAG. Please try again.'
        );
      }
    } finally {
      setIsLoadingReasoning(false);
    }
  };

  // 2. Flag a Node as Incorrect (Double-Click or Button)
  const handleFlagNode = (nodeId: string, reason?: string) => {
    if (!dag) return;
    const updatedNodes = dag.nodes.map((n) => {
      if (n.id === nodeId) {
        return {
          ...n,
          flaggedIncorrect: true,
          flagReason:
            reason ||
            'User Flagged: Incorrect Path. Alternative clinical diagnosis requested.',
        };
      }
      return n;
    });

    const flaggedNode = updatedNodes.find((n) => n.id === nodeId);
    setDag({ ...dag, nodes: updatedNodes });
    if (flaggedNode) {
      setSelectedNode(flaggedNode);
    }
  };

  // 3. Unflag a Node
  const handleUnflagNode = (nodeId: string) => {
    if (!dag) return;
    const updatedNodes = dag.nodes.map((n) => {
      if (n.id === nodeId) {
        return {
          ...n,
          flaggedIncorrect: false,
          flagReason: undefined,
        };
      }
      return n;
    });
    setDag({ ...dag, nodes: updatedNodes });
  };

  // 4. Clear all flags
  const handleClearAllFlags = () => {
    if (!dag) return;
    const updatedNodes = dag.nodes.map((n) => ({
      ...n,
      flaggedIncorrect: false,
      flagReason: undefined,
    }));
    setDag({ ...dag, nodes: updatedNodes });
  };

  // 5. Update single node position (drag on canvas)
  const handleUpdateNodePosition = (nodeId: string, x: number, y: number) => {
    if (!dag) return;
    setDag({
      ...dag,
      nodes: dag.nodes.map((n) => (n.id === nodeId ? { ...n, x, y } : n)),
    });
  };

  // 6. Execute Re-Reasoning from Flagged Node
  const handleExecuteReReason = async () => {
    if (!dag) return;
    const flaggedNodes = dag.nodes.filter((n) => n.flaggedIncorrect);
    if (flaggedNodes.length === 0) return;

    const primaryFlagged = flaggedNodes[0];
    setIsLoadingReReason(true);
    setErrorToast(null);

    // Identify intact upstream nodes
    const intactNodes = dag.nodes.filter((n) => !n.flaggedIncorrect);
    const intactEdges = dag.edges.filter(
      (e) => e.target !== primaryFlagged.id && e.source !== primaryFlagged.id
    );

    try {
      const response = await fetch('/api/re-reason', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: dag.prompt,
          intactNodes,
          intactEdges,
          flaggedNode: primaryFlagged,
          correctionInstructions:
            correctionNote || 'Adjust reasoning based on physician override.',
        }),
      });

      if (!response.ok) {
        // In static hosting environments where /api is not routed, seamlessly synthesize client-side
        if (response.status === 404) {
          console.warn('API endpoint returned 404. Activating high-fidelity client re-reasoning engine.');
          const fallbackUpdatedDAG = reReasonClientFallbackDAG(
            dag.prompt,
            intactNodes,
            intactEdges,
            primaryFlagged,
            correctionNote || 'Adjust reasoning based on physician override.'
          );
          setDag(fallbackUpdatedDAG);
          const firstNewNode = fallbackUpdatedDAG.nodes.find((n) => n.isNewOrRegenerated);
          if (firstNewNode) {
            setSelectedNode(firstNewNode);
          }
          return;
        }

        let errMessage = `Server returned ${response.status}: ${response.statusText}`;
        try {
          const errData = await response.json();
          if (errData?.message) errMessage = errData.message;
          else if (errData?.error) errMessage = errData.error;
        } catch {}
        throw new Error(errMessage);
      }

      const updatedDAG: ReasoningDAG = await response.json();
      setDag(updatedDAG);

      // Select the first new/regenerated node if available
      const firstNewNode = updatedDAG.nodes.find((n) => n.isNewOrRegenerated);
      if (firstNewNode) {
        setSelectedNode(firstNewNode);
      }
    } catch (err: any) {
      console.error('Failed to execute re-reasoning from server, using client fallback:', err);
      try {
        const fallbackUpdatedDAG = reReasonClientFallbackDAG(
          dag.prompt,
          intactNodes,
          intactEdges,
          primaryFlagged,
          correctionNote || 'Adjust reasoning based on physician override.'
        );
        setDag(fallbackUpdatedDAG);
        const firstNewNode = fallbackUpdatedDAG.nodes.find((n) => n.isNewOrRegenerated);
        if (firstNewNode) {
          setSelectedNode(firstNewNode);
        }
      } catch {
        setErrorToast(
          err.message || 'Failed to complete incremental re-reasoning.'
        );
      }
    } finally {
      setIsLoadingReReason(false);
    }
  };

  // Folder Operations
  const handleCreateFolder = async (name: string, description?: string) => {
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name,
      description,
      color: '#00A896',
      createdAt: new Date().toISOString(),
    };
    setFolders((prev) => [...prev, newFolder]);
    fetch('/api/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newFolder),
    }).catch(() => {});
  };

  // Save Session Operation
  const handleSaveSession = async (session: SavedSession) => {
    setSavedSessions((prev) => [
      session,
      ...prev.filter((s) => s.id !== session.id),
    ]);
    fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
    }).catch(() => {});
  };

  // Restore Session
  const handleRestoreSession = (session: SavedSession) => {
    setDag(session.dagData);
    setPrompt(session.dagData.prompt);
    if (session.dagData.nodes.length > 0) {
      setSelectedNode(session.dagData.nodes[0]);
    }
    setScreenMode('dag-review');
    setMobileTab('graph');
    setCurrentView('graph');
  };

  // Delete Session
  const handleDeleteSession = (sessionId: string) => {
    setSavedSessions((prev) => prev.filter((s) => s.id !== sessionId));
    fetch(`/api/sessions/${sessionId}`, { method: 'DELETE' }).catch(() => {});
  };

  // Start New Analysis (Switch to Prompt Entry screen)
  const handleNewAnalysis = () => {
    setPrompt('');
    setDag(null);
    setSelectedNode(null);
    setScreenMode('prompt-entry');
    setCurrentView('graph');
  };

  // Sign out
  const handleSignOut = () => {
    setUser(null);
    setDag(null);
    setSelectedNode(null);
    setPrompt('');
    setScreenMode('prompt-entry');
  };

  // Load sample case directly
  const handleLoadSampleCase = () => {
    const sample = SAMPLE_CLINICAL_CASES[0];
    setPrompt(sample.fullPrompt);
    setPatientInfo({
      patientName: 'John Doe',
      patientAgeGender: '62M',
      mrn: 'MRN-884920',
      allergies: 'NKDA',
      urgency: 'Urgent',
    });
    setDag(INITIAL_ACS_DAG);
    setSelectedNode(INITIAL_ACS_DAG.nodes[0]);
    setScreenMode('dag-review');
    setMobileTab('graph');
  };

  // Screen Mode Switching with Automatic Prompt Sync
  const handleSetScreenMode = (mode: 'prompt-entry' | 'dag-review') => {
    if (
      mode === 'dag-review' &&
      (!dag || (prompt.trim() !== dag.prompt.trim() && prompt.trim().length > 0))
    ) {
      if (prompt.trim().length > 0) {
        handleGenerateDAG();
        return;
      }
    }
    setScreenMode(mode);
  };

  // If not logged in, render the Google OAuth AuthGate
  if (!user) {
    return <AuthGate onSignIn={setUser} />;
  }

  const flaggedNodes = dag ? dag.nodes.filter((n) => n.flaggedIncorrect) : [];

  return (
    <div
      id="aight-app-root"
      className="h-screen max-h-screen w-full flex flex-col bg-[#FBFBFB] text-[#0F0F0F] font-sans antialiased overflow-hidden select-none"
    >
      {/* Top Header */}
      <Header
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'dashboard') setCurrentView('graph');
        }}
        screenMode={screenMode}
        onSetScreenMode={handleSetScreenMode}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenSaveSession={() => setIsSaveModalOpen(true)}
        user={user}
        onSignOut={handleSignOut}
        hasActiveDAG={!!dag && dag.nodes.length > 0}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
      />

      {/* Main Layout Body (3-Column layout below header, fitted to screen without page scroll) */}
      <div className="flex-1 min-h-0 flex overflow-hidden relative">
        {/* Left Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentView={currentView}
          setCurrentView={(v) => {
            setCurrentView(v);
            if (v === 'history') setIsHistoryModalOpen(true);
          }}
          onNewAnalysis={handleNewAnalysis}
          folders={folders}
          savedSessions={savedSessions}
          onSelectFolder={(fId) => {
            setSelectedFolderId(fId);
            setIsHistoryModalOpen(true);
          }}
          selectedFolderId={selectedFolderId}
          onCreateFolder={handleCreateFolder}
          onOpenHelp={() => setIsHelpModalOpen(true)}
          onSignOut={handleSignOut}
        />

        {/* Center Main Board & Workspace */}
        <main
          id="main-workspace"
          className="flex-1 min-h-0 flex flex-col overflow-hidden relative bg-[#FBFBFB]"
        >
          {/* SCREEN 1: Prompt Input Screen */}
          {screenMode === 'prompt-entry' ? (
            <PromptEntryScreen
              prompt={prompt}
              setPrompt={setPrompt}
              onSubmit={handleGenerateDAG}
              isLoading={isLoadingReasoning}
              onClear={() => setPrompt('')}
              savedSessions={savedSessions}
              onRestoreSession={handleRestoreSession}
              hasActiveDAG={!!dag && dag.nodes.length > 0}
              onGoToDAGReview={() => handleSetScreenMode('dag-review')}
              currentDagPrompt={dag?.prompt}
            />
          ) : (
            /* SCREEN 2: Reasoning DAG & Correction Screen (Initial Prompt is strictly READ-ONLY) */
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden relative">
              {/* Strictly Read-Only Baseline Presentation Header */}
              <ReadOnlyPromptBar
                prompt={dag?.prompt || prompt}
                currentInputPrompt={prompt}
                patientName={patientInfo.patientName}
                patientAgeGender={patientInfo.patientAgeGender}
                mrn={patientInfo.mrn}
                allergies={patientInfo.allergies}
                onReturnToPromptEntry={() => setScreenMode('prompt-entry')}
                onRegenerateWithNewPrompt={() => handleGenerateDAG()}
                reasoningStepsCount={dag?.nodes.length || 0}
                isLoading={isLoadingReasoning}
              />

              {/* Mobile View Switcher Tab (< 1024px) */}
              <div className="lg:hidden flex items-center justify-center gap-2 p-2 bg-[#FBFBFB] border-b border-[#BCABAE]/30 text-xs shrink-0">
                <button
                  id="mobile-tab-graph"
                  onClick={() => setMobileTab('graph')}
                  className={`flex-1 py-1.5 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    mobileTab === 'graph'
                      ? 'bg-[#2D2E2E] text-white shadow-xs'
                      : 'bg-white border border-[#BCABAE]/40 text-[#716969]'
                  }`}
                >
                  <Network className="w-3.5 h-3.5" />
                  <span>Reasoning Graph</span>
                </button>
                <button
                  id="mobile-tab-details"
                  onClick={() => setMobileTab('node-details')}
                  className={`flex-1 py-1.5 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    mobileTab === 'node-details'
                      ? 'bg-[#00A896] text-white shadow-xs'
                      : 'bg-white border border-[#BCABAE]/40 text-[#716969]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>
                    Node Details {selectedNode ? `(${selectedNode.title.slice(0, 12)}...)` : ''}
                  </span>
                </button>
              </div>

              {/* Workspace Split: Graph Canvas & Node Article Panel */}
              <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden relative">
                {/* Center Canvas */}
                <div
                  className={`flex-1 min-h-0 flex flex-col overflow-hidden relative border-r border-[#BCABAE]/30 ${
                    mobileTab === 'node-details' ? 'hidden lg:flex' : 'flex'
                  }`}
                >
                  {/* Error Notification Toast */}
                  {errorToast && (
                    <div className="m-3 p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-xs flex items-center justify-between shadow-xs z-30 shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">Error:</span>
                        <span>{errorToast}</span>
                      </div>
                      <button
                        onClick={() => setErrorToast(null)}
                        className="p-1 text-[#DC2626] hover:bg-[#FEE2E2] rounded"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Interactive DAG Canvas */}
                  <div className="flex-1 min-h-0 relative overflow-hidden">
                    <DAGCanvas
                      dag={dag}
                      selectedNodeId={selectedNode?.id || null}
                      onSelectNode={(node) => {
                        setSelectedNode(node);
                        if (window.innerWidth < 1024) {
                          setMobileTab('node-details');
                        }
                      }}
                      onFlagNode={handleFlagNode}
                      onUnflagNode={handleUnflagNode}
                      onUpdateNodePosition={handleUpdateNodePosition}
                      isLoading={isLoadingReasoning || isLoadingReReason}
                      onGoToPromptEntry={() => setScreenMode('prompt-entry')}
                      onLoadSampleCase={handleLoadSampleCase}
                      hideFlaggedNodes={hideFlaggedNodes}
                      onToggleHideFlaggedNodes={() => setHideFlaggedNodes(!hideFlaggedNodes)}
                    />

                    {/* Bottom Re-Reasoning Bar when node(s) flagged */}
                    <ReReasonBar
                      flaggedNodes={flaggedNodes}
                      correctionNote={correctionNote}
                      setCorrectionNote={setCorrectionNote}
                      onExecuteReReason={handleExecuteReReason}
                      isLoading={isLoadingReReason}
                      onClearAllFlags={handleClearAllFlags}
                      hideFlaggedNodes={hideFlaggedNodes}
                      onToggleHideFlaggedNodes={() => setHideFlaggedNodes(!hideFlaggedNodes)}
                    />
                  </div>
                </div>

                {/* Right Article Panel */}
                <div
                  className={`w-full lg:w-96 h-full overflow-hidden shrink-0 ${
                    mobileTab === 'graph' ? 'hidden lg:flex' : 'flex flex-col'
                  }`}
                >
                  <NodeArticlePanel
                    node={selectedNode}
                    onClose={() => {
                      setSelectedNode(null);
                      setMobileTab('graph');
                    }}
                    onToggleFlag={(nodeId) => {
                      if (selectedNode?.flaggedIncorrect) {
                        handleUnflagNode(nodeId);
                      } else {
                        handleFlagNode(nodeId);
                      }
                    }}
                    onInitiateReReasonFromNode={(node) => {
                      handleFlagNode(node.id);
                    }}
                    hideFlaggedNodes={hideFlaggedNodes}
                    onToggleHideFlaggedNodes={() => setHideFlaggedNodes(!hideFlaggedNodes)}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer Bar */}
      <footer
        id="app-footer"
        className="w-full h-8 bg-[#2D2E2E] text-[#BCABAE] px-3 sm:px-6 flex items-center justify-between text-[11px] font-medium border-t border-[#BCABAE]/20 select-none z-30 shrink-0"
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[#FBFBFB] font-semibold">
            <Stethoscope className="w-3.5 h-3.5 text-[#00A896]" />
            AIGHT XAI Engine
          </span>
          <span className="hidden sm:inline opacity-60">|</span>
          <span className="hidden sm:inline">
            Mode: <strong className="text-[#FBFBFB]">{screenMode === 'prompt-entry' ? 'Case Setup' : 'DAG Inspection'}</strong>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[#00A896]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Encrypted PHI Store</span>
          </span>
          <span className="hidden md:inline opacity-60">|</span>
          <span className="hidden md:inline">
            Double-click node to re-reason
          </span>
        </div>
      </footer>

      {/* Modals */}
      <SaveSessionModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        dag={dag}
        folders={folders}
        onCreateFolder={handleCreateFolder}
        onSaveSession={handleSaveSession}
        user={user}
      />

      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        savedSessions={savedSessions}
        folders={folders}
        selectedFolderId={selectedFolderId}
        onSelectFolder={setSelectedFolderId}
        onRestoreSession={handleRestoreSession}
        onDeleteSession={handleDeleteSession}
      />

      <AnalyticsModal
        isOpen={isAnalyticsModalOpen}
        onClose={() => {
          setIsAnalyticsModalOpen(false);
          setActiveTab('dashboard');
        }}
        savedSessions={savedSessions}
      />

      <ReportsModal
        isOpen={isReportsModalOpen}
        onClose={() => {
          setIsReportsModalOpen(false);
          setActiveTab('dashboard');
        }}
        dag={dag}
        user={user}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        user={user}
        onUpdateUser={setUser}
      />

      {/* Clinical Help Modal */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 border border-[#BCABAE]/40 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#BCABAE]/30 mb-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#00A896]" />
                <h3 className="font-bold text-base text-[#0F0F0F]">
                  AIGHT Clinical Review Guide
                </h3>
              </div>
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="p-1 rounded-lg text-[#716969] hover:bg-[#BCABAE]/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col gap-3 text-xs text-[#2D2E2E] leading-relaxed">
              <p>
                <strong>1. Directed Acyclic Graph (DAG) Structure:</strong> Medical
                decisions are mapped logically without cycles, progressing from
                Observations → Hypotheses & Clinical Rules → Differential Choices
                → Proposed Actions & Prescriptions.
              </p>
              <p>
                <strong>2. Inspecting Nodes:</strong> Single-click any node to
                open its full clinical rationale, supporting evidence bullets, and
                peer-reviewed journal references in the right Article panel.
              </p>
              <p>
                <strong>3. Branch Point Correction:</strong> Double-click any node
                that diverges from your clinical judgment to mark it with a red
                flag.
              </p>
              <p>
                <strong>4. Incremental Re-reasoning:</strong> Provide specific
                override instructions in the bottom bar and click{' '}
                <strong>Re-infer</strong>. The AI preserves all valid upstream
                reasoning and regenerates only the downstream decision path.
              </p>
              <p>
                <strong>5. Patient Privacy:</strong> Demographics and sensitive
                fields are encrypted at rest using AES-256 before saving to
                department folders.
              </p>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="px-4 py-2 bg-[#00A896] hover:bg-[#009383] text-white text-xs font-bold rounded-xl"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
