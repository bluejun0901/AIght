import React, { useState, useRef, useEffect } from 'react';
import { DAGNode, DAGEdge, ReasoningDAG, NodeType } from '../types';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  AlertCircle,
  Eye,
  EyeOff,
  Activity,
  CheckCircle2,
  FileSpreadsheet,
  Pill,
  Sparkles,
  HelpCircle,
  XCircle,
  Info,
  ArrowRight,
  Stethoscope,
  Move,
} from 'lucide-react';

interface DAGCanvasProps {
  dag: ReasoningDAG | null;
  selectedNodeId: string | null;
  onSelectNode: (node: DAGNode) => void;
  onFlagNode: (nodeId: string, reason?: string) => void;
  onUnflagNode: (nodeId: string) => void;
  onUpdateNodePosition: (nodeId: string, x: number, y: number) => void;
  isLoading: boolean;
  onGoToPromptEntry?: () => void;
  onLoadSampleCase?: () => void;
  hideFlaggedNodes?: boolean;
  onToggleHideFlaggedNodes?: () => void;
}

// Helper to get Node Icon & Type Color
export const getNodeTypeConfig = (type: NodeType) => {
  switch (type) {
    case 'OBSERVATION':
      return {
        label: 'OBSERVATION',
        icon: Eye,
        color: '#0284C7',
        bg: '#F0F9FF',
        border: '#BAE6FD',
      };
    case 'HYPOTHESIS':
      return {
        label: 'HYPOTHESIS',
        icon: Activity,
        color: '#D97706',
        bg: '#FFFBEB',
        border: '#FDE68A',
      };
    case 'DIFFERENTIAL':
      return {
        label: 'DIFFERENTIAL',
        icon: HelpCircle,
        color: '#7C3AED',
        bg: '#F5F3FF',
        border: '#DDD6FE',
      };
    case 'CLINICAL_RULE':
      return {
        label: 'CLINICAL RULE',
        icon: FileSpreadsheet,
        color: '#4F46E5',
        bg: '#EEF2FF',
        border: '#C7D2FE',
      };
    case 'CONTRAINDICATION':
      return {
        label: 'CONTRAINDICATION',
        icon: AlertCircle,
        color: '#DC2626',
        bg: '#FEF2F2',
        border: '#FECACA',
      };
    case 'ACTION':
      return {
        label: 'ACTION',
        icon: Sparkles,
        color: '#0D9488',
        bg: '#F0FDFA',
        border: '#99F6E4',
      };
    case 'PROPOSED_ACTION':
      return {
        label: 'PROPOSED ACTION',
        icon: Activity,
        color: '#00A896',
        bg: '#E6FFFA',
        border: '#A7F3D0',
      };
    case 'RX_INSTRUCTION':
      return {
        label: 'PRESCRIPTION ORDER',
        icon: Pill,
        color: '#059669',
        bg: '#ECFDF5',
        border: '#A7F3D0',
      };
    default:
      return {
        label: 'REASONING STEP',
        icon: CheckCircle2,
        color: '#2D2E2E',
        bg: '#F8FAFC',
        border: '#E2E8F0',
      };
  }
};

export const DAGCanvas: React.FC<DAGCanvasProps> = ({
  dag,
  selectedNodeId,
  onSelectNode,
  onFlagNode,
  onUnflagNode,
  onUpdateNodePosition,
  isLoading,
  onGoToPromptEntry,
  onLoadSampleCase,
  hideFlaggedNodes: externalHideFlagged,
  onToggleHideFlaggedNodes: externalToggleHide,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 60, y: 50 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);

  // Internal state if not passed from outside
  const [internalHideFlagged, setInternalHideFlagged] = useState(false);
  const hideFlagged = externalHideFlagged !== undefined ? externalHideFlagged : internalHideFlagged;
  const toggleHideFlagged = externalToggleHide || (() => setInternalHideFlagged((prev) => !prev));

  // Count flagged nodes
  const allNodes = dag?.nodes || [];
  const flaggedNodesCount = allNodes.filter((n) => n.flaggedIncorrect).length;

  // Filter visible nodes based on hideFlagged setting
  const visibleNodes = hideFlagged
    ? allNodes.filter((n) => !n.flaggedIncorrect)
    : allNodes;

  // Map of visible nodes for fast edge coordinate lookup
  const visibleNodeMap = new Map<string, DAGNode>();
  visibleNodes.forEach((n) => visibleNodeMap.set(n.id, n));

  // Filter edges: only connect if both endpoints are visible and edge itself is not flagged hidden
  const visibleEdges = dag
    ? dag.edges.filter((e) => {
        const sourceNode = visibleNodeMap.get(e.source);
        const targetNode = visibleNodeMap.get(e.target);
        if (!sourceNode || !targetNode) return false;
        if (hideFlagged && (sourceNode.flaggedIncorrect || targetNode.flaggedIncorrect || e.isFlaggedPath)) {
          return false;
        }
        return true;
      })
    : [];

  // Auto-center graph when new dag is loaded
  useEffect(() => {
    if (dag && dag.nodes.length > 0) {
      handleFitView();
    }
  }, [dag?.prompt]);

  // Handle canvas pan with mouse drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.dag-node-card')) {
      return; // Handled by node drag
    }
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    } else if (draggingNodeId && dag) {
      const node = dag.nodes.find((n) => n.id === draggingNodeId);
      if (node && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // Allow unconstrained wide canvas dragging without harsh clipping bounds
        const rawX = (e.clientX - rect.left - pan.x) / zoom - dragOffset.x;
        const rawY = (e.clientY - rect.top - pan.y) / zoom - dragOffset.y;
        onUpdateNodePosition(draggingNodeId, Math.round(rawX), Math.round(rawY));
      }
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  // Touch Support for Mobile & Tablets
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const target = touch.target as HTMLElement;
      if (target.closest('.dag-node-card')) return;
      setIsPanning(true);
      setStartPan({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
      lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isPanning && e.touches.length === 1) {
      const touch = e.touches[0];
      setPan({
        x: touch.clientX - startPan.x,
        y: touch.clientY - startPan.y,
      });
    } else if (draggingNodeId && dag && e.touches.length === 1) {
      const touch = e.touches[0];
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const rawX = (touch.clientX - rect.left - pan.x) / zoom - dragOffset.x;
        const rawY = (touch.clientY - rect.top - pan.y) / zoom - dragOffset.y;
        onUpdateNodePosition(draggingNodeId, Math.round(rawX), Math.round(rawY));
      }
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
    lastTouchRef.current = null;
  };

  // Node Drag start
  const handleNodeMouseDown = (e: React.MouseEvent, node: DAGNode) => {
    e.stopPropagation();
    setDraggingNodeId(node.id);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const nodeCanvasX = node.x * zoom + pan.x + rect.left;
      const nodeCanvasY = node.y * zoom + pan.y + rect.top;
      setDragOffset({
        x: (e.clientX - nodeCanvasX) / zoom,
        y: (e.clientY - nodeCanvasY) / zoom,
      });
    }
  };

  const handleNodeTouchStart = (e: React.TouchEvent, node: DAGNode) => {
    e.stopPropagation();
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setDraggingNodeId(node.id);
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const nodeCanvasX = node.x * zoom + pan.x + rect.left;
        const nodeCanvasY = node.y * zoom + pan.y + rect.top;
        setDragOffset({
          x: (touch.clientX - nodeCanvasX) / zoom,
          y: (touch.clientY - nodeCanvasY) / zoom,
        });
      }
    }
  };

  // Double-click to toggle flag
  const handleNodeDoubleClick = (e: React.MouseEvent, node: DAGNode) => {
    e.stopPropagation();
    if (node.flaggedIncorrect) {
      onUnflagNode(node.id);
    } else {
      onFlagNode(
        node.id,
        'User Flagged: Incorrect Path. Reviewing alternative clinical pathway.'
      );
    }
  };

  // Zoom controls (expanded range 25% to 250%)
  const handleZoomIn = () => setZoom((z) => Math.min(2.5, z + 0.15));
  const handleZoomOut = () => setZoom((z) => Math.max(0.25, z - 0.15));

  const handleFitView = () => {
    if (!dag || visibleNodes.length === 0) {
      setPan({ x: 60, y: 50 });
      setZoom(1);
      return;
    }
    const minX = Math.min(...visibleNodes.map((n) => n.x));
    const maxX = Math.max(...visibleNodes.map((n) => n.x + 220));
    const minY = Math.min(...visibleNodes.map((n) => n.y));
    const maxY = Math.max(...visibleNodes.map((n) => n.y + 110));

    if (containerRef.current) {
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      const graphWidth = maxX - minX + 80;
      const graphHeight = maxY - minY + 80;

      const scale = Math.min(1.2, Math.max(0.35, Math.min((width - 60) / graphWidth, (height - 60) / graphHeight)));
      setZoom(scale);
      setPan({
        x: (width - (maxX - minX) * scale) / 2 - minX * scale,
        y: (height - (maxY - minY) * scale) / 2 - minY * scale,
      });
    }
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 60, y: 50 });
  };

  // 1. Clean Empty State when DAG is null or has no nodes
  if (!dag || allNodes.length === 0) {
    return (
      <div
        id="dag-canvas-empty-state"
        className="w-full h-full flex flex-col items-center justify-center p-6 bg-[#FBFBFB] relative overflow-hidden select-none"
      >
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#BCABAE 1.2px, transparent 1.2px)`,
            backgroundSize: '24px 24px',
          }}
        />

        <div className="z-10 max-w-lg text-center flex flex-col items-center gap-4 bg-white/90 backdrop-blur-xs p-6 sm:p-8 rounded-3xl border border-[#BCABAE]/40 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#00A896]/10 border border-[#00A896]/20 flex items-center justify-center text-[#00A896] shadow-xs">
            <Stethoscope className="w-8 h-8" />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#00A896] px-2.5 py-0.5 rounded-full bg-[#00A896]/10 border border-[#00A896]/20 self-center">
              Step 2: Reasoning DAG Empty
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-[#0F0F0F]">
              생성된 추론 그래프가 없습니다
            </h3>
            <p className="text-xs sm:text-sm text-[#716969] leading-relaxed max-w-md">
              <strong>1. Case Input</strong> 탭에서 환자의 임상 증상 및 검사 결과를 입력하거나, 샘플 템플릿을 선택하여 <strong>Generate Reasoning DAG</strong>를 실행해 주세요.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto mt-2">
            {onGoToPromptEntry && (
              <button
                id="btn-empty-goto-case-input"
                type="button"
                onClick={onGoToPromptEntry}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[#00A896] hover:bg-[#009383] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <span>1. Case Input으로 이동하여 입력하기</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {onLoadSampleCase && (
              <button
                id="btn-empty-load-sample"
                type="button"
                onClick={onLoadSampleCase}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white hover:bg-gray-50 border border-[#BCABAE]/50 text-[#0F0F0F] text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#00A896]" />
                <span>샘플 케이스 (ACS) 불러오기</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      id="dag-canvas-container"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className={`relative w-full h-full overflow-hidden bg-[#FBFBFB] select-none touch-none ${
        isPanning ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* Infinite-Feel Background Dot Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-45"
        style={{
          backgroundImage: `radial-gradient(#BCABAE 1.2px, transparent 1.2px)`,
          backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      />

      {/* Floating Canvas Controls & Hide Flagged Nodes Toggle */}
      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-20 flex flex-wrap items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-[#BCABAE]/40 shadow-sm max-w-[calc(100vw-30px)]">
        <button
          onClick={handleZoomIn}
          className="p-1.5 rounded-lg text-[#2D2E2E] hover:bg-[#BCABAE]/20 transition-colors"
          title="Zoom In (확대)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-1.5 rounded-lg text-[#2D2E2E] hover:bg-[#BCABAE]/20 transition-colors"
          title="Zoom Out (축소)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-4 bg-[#BCABAE]/40 my-auto mx-0.5" />
        <button
          onClick={handleFitView}
          className="p-1.5 rounded-lg text-[#2D2E2E] hover:bg-[#BCABAE]/20 transition-colors"
          title="Fit Graph to Screen (전체 노드 맞춤)"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetZoom}
          className="p-1.5 rounded-lg text-[#2D2E2E] hover:bg-[#BCABAE]/20 transition-colors"
          title="Reset Zoom & Pan (100% 초기화)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <span className="text-[10px] font-semibold text-[#716969] px-1.5">
          {Math.round(zoom * 100)}%
        </span>

        {/* Feature: Hide Flagged Nodes Toggle Button */}
        {flaggedNodesCount > 0 && (
          <>
            <div className="w-[1px] h-4 bg-[#BCABAE]/40 my-auto mx-0.5" />
            <button
              id="btn-toggle-hide-flagged-nodes"
              type="button"
              onClick={toggleHideFlagged}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                hideFlagged
                  ? 'bg-[#EF4444] text-white shadow-xs'
                  : 'bg-[#FEF2F2] text-[#EF4444] hover:bg-[#FEE2E2] border border-[#FECACA]'
              }`}
              title={
                hideFlagged
                  ? '지적된 노드 다시 표시하기 (Show Flagged Nodes)'
                  : '잘못되었다고 지적된 노드 숨기기 (Hide Flagged Nodes)'
              }
            >
              {hideFlagged ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span className="text-[11px]">지적된 노드 숨김 ({flaggedNodesCount})</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span className="text-[11px]">지적된 노드 숨기기 ({flaggedNodesCount})</span>
                </>
              )}
            </button>
          </>
        )}
      </div>

      {/* Flagged Nodes Hidden Banner if active */}
      {hideFlagged && flaggedNodesCount > 0 && (
        <div className="absolute top-16 left-4 z-20 flex items-center gap-2 bg-[#FEF2F2]/95 border border-[#FECACA] text-[#DC2626] px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs animate-in fade-in duration-150">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>지적된 노드 {flaggedNodesCount}개가 숨김 처리되었습니다.</span>
          <button
            onClick={toggleHideFlagged}
            className="ml-1 underline font-bold hover:text-[#B91C1C] cursor-pointer"
          >
            모두 표시
          </button>
        </div>
      )}

      {/* Interactive Helper Pill */}
      <div className="absolute top-4 right-4 z-20 hidden md:flex items-center gap-2 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-full border border-[#BCABAE]/30 text-[11px] text-[#716969] shadow-2xs">
        <Info className="w-3.5 h-3.5 text-[#00A896]" />
        <span>
          <strong className="text-[#0F0F0F]">클릭</strong> 상세 확인 •{' '}
          <strong className="text-[#0F0F0F]">더블클릭</strong> 지적(Flag) •{' '}
          <strong className="text-[#0F0F0F]">드래그</strong> 노드 이동
        </span>
      </div>

      {/* Vast, Fully Non-Clipping SVG Coordinate Space for All Edges */}
      <svg
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          width: '100%',
          height: '100%',
          overflow: 'visible',
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        <defs>
          {/* Arrowhead marker for standard active directed edges */}
          <marker
            id="arrowhead-active"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
            overflow="visible"
          >
            <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#0D9488" />
          </marker>

          {/* Arrowhead marker for flagged deviation edges */}
          <marker
            id="arrowhead-flagged"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
            overflow="visible"
          >
            <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#EF4444" />
          </marker>

          {/* Arrowhead marker for default edges */}
          <marker
            id="arrowhead-default"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
            overflow="visible"
          >
            <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#716969" />
          </marker>
        </defs>

        {/* Directed Edges with Robust Wide Bezier Calculation */}
        {visibleEdges.map((edge) => {
          const sourceNode = visibleNodeMap.get(edge.source);
          const targetNode = visibleNodeMap.get(edge.target);

          if (!sourceNode || !targetNode) return null;

          // Card dimensions
          const CARD_WIDTH = 220;
          const CARD_HEIGHT = 105;

          const isLeftToRight = targetNode.x >= sourceNode.x + CARD_WIDTH * 0.5;

          let startX = sourceNode.x + CARD_WIDTH;
          let startY = sourceNode.y + CARD_HEIGHT / 2;
          let endX = targetNode.x;
          let endY = targetNode.y + CARD_HEIGHT / 2;

          let cp1X: number;
          let cp1Y: number;
          let cp2X: number;
          let cp2Y: number;

          if (isLeftToRight) {
            const deltaX = Math.abs(endX - startX);
            const cpOffset = Math.max(50, Math.min(300, deltaX * 0.5));
            cp1X = startX + cpOffset;
            cp1Y = startY;
            cp2X = endX - cpOffset;
            cp2Y = endY;
          } else {
            // Target is to the left or vertical
            const deltaY = targetNode.y - sourceNode.y;
            startX = sourceNode.x + CARD_WIDTH / 2;
            startY = deltaY > 0 ? sourceNode.y + CARD_HEIGHT : sourceNode.y;
            endX = targetNode.x + CARD_WIDTH / 2;
            endY = deltaY > 0 ? targetNode.y : targetNode.y + CARD_HEIGHT;

            const cpOffset = Math.max(60, Math.abs(deltaY) * 0.5);
            cp1X = startX;
            cp1Y = deltaY > 0 ? startY + cpOffset : startY - cpOffset;
            cp2X = endX;
            cp2Y = deltaY > 0 ? endY - cpOffset : endY + cpOffset;
          }

          const pathD = `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;

          const isFlagged =
            edge.isFlaggedPath ||
            sourceNode.flaggedIncorrect ||
            targetNode.flaggedIncorrect;
          const isConnectedToSelected =
            selectedNodeId === edge.source || selectedNodeId === edge.target;

          let strokeColor = '#0D9488';
          let markerId = 'arrowhead-active';
          let strokeWidth = 2.5;

          if (isFlagged) {
            strokeColor = '#EF4444';
            markerId = 'arrowhead-flagged';
            strokeWidth = 2.5;
          } else if (isConnectedToSelected) {
            strokeColor = '#00A896';
            strokeWidth = 3.5;
          }

          return (
            <g key={edge.id} style={{ overflow: 'visible' }}>
              {/* Thicker transparent line for ease of viewing/hover */}
              <path
                d={pathD}
                fill="none"
                stroke="transparent"
                strokeWidth="16"
              />
              {/* Visible directed curve */}
              <path
                d={pathD}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={isFlagged ? '5,5' : 'none'}
                markerEnd={`url(#${markerId})`}
                vectorEffect="non-scaling-stroke"
                className="transition-colors duration-150"
              />
              {/* Edge label pill if present */}
              {edge.label && (
                <text
                  x={(startX + endX) / 2}
                  y={(startY + endY) / 2 - 8}
                  fill={isFlagged ? '#EF4444' : '#716969'}
                  fontSize="10"
                  fontWeight="600"
                  textAnchor="middle"
                  className="select-none bg-white px-1"
                >
                  {edge.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* HTML Nodes Container with Transform & Vast Virtual Bounds */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          width: '100%',
          height: '100%',
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {visibleNodes.map((node) => {
          const typeConfig = getNodeTypeConfig(node.type);
          const Icon = typeConfig.icon;
          const isSelected = selectedNodeId === node.id;
          const isFlagged = node.flaggedIncorrect;

          return (
            <div
              key={node.id}
              id={`dag-node-${node.id}`}
              onMouseDown={(e) => handleNodeMouseDown(e, node)}
              onTouchStart={(e) => handleNodeTouchStart(e, node)}
              onClick={(e) => {
                e.stopPropagation();
                onSelectNode(node);
              }}
              onDoubleClick={(e) => handleNodeDoubleClick(e, node)}
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`,
                width: '220px',
              }}
              className={`dag-node-card absolute pointer-events-auto cursor-pointer rounded-xl bg-white p-3.5 transition-shadow duration-150 select-none ${
                isFlagged
                  ? 'border-2 border-[#EF4444] shadow-[0_4px_12px_rgba(239,68,68,0.15)] ring-2 ring-[#EF4444]/20'
                  : isSelected
                  ? 'border-2 border-[#00A896] shadow-[0_4px_14px_rgba(0,168,150,0.2)] ring-2 ring-[#00A896]/25'
                  : node.isNewOrRegenerated
                  ? 'border-2 border-[#0D9488] shadow-xs ring-1 ring-[#0D9488]/30'
                  : 'border border-[#BCABAE]/50 hover:border-[#2D2E2E] shadow-xs'
              }`}
            >
              {/* Flagged Red X Badge on top right */}
              {isFlagged && (
                <div
                  className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-[#EF4444] text-white flex items-center justify-center shadow-md cursor-pointer hover:scale-110 transition-transform"
                  title="Marked as Incorrect Path. Double-click to unflag."
                  onClick={(e) => {
                    e.stopPropagation();
                    onUnflagNode(node.id);
                  }}
                >
                  <XCircle className="w-4 h-4 fill-white text-[#EF4444]" />
                </div>
              )}

              {/* Node Header: Icon + Category Badge */}
              <div className="flex items-center justify-between gap-1 mb-2">
                <div className="flex items-center gap-1.5">
                  <Icon
                    className="w-3.5 h-3.5 shrink-0"
                    style={{ color: isFlagged ? '#EF4444' : typeConfig.color }}
                  />
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider truncate"
                    style={{ color: isFlagged ? '#EF4444' : typeConfig.color }}
                  >
                    {typeConfig.label}
                  </span>
                </div>
                {node.confidence !== undefined && (
                  <span className="text-[9px] font-semibold text-[#716969] bg-[#BCABAE]/15 px-1.5 py-0.5 rounded">
                    {node.confidence}%
                  </span>
                )}
              </div>

              {/* Node Summary Text */}
              <p className="text-xs font-medium text-[#0F0F0F] leading-snug line-clamp-3 mb-1">
                {node.summary || node.title}
              </p>

              {/* Red User Flagged banner if marked incorrect */}
              {isFlagged && (
                <div className="mt-2 pt-1.5 border-t border-[#EF4444]/20 text-[10px] font-semibold text-[#EF4444] leading-tight">
                  {node.flagReason || 'User Flagged: Incorrect Path'}
                </div>
              )}

              {/* Regenerated / Corrected Badge */}
              {node.isNewOrRegenerated && !isFlagged && (
                <div className="mt-1.5 flex items-center gap-1 text-[9px] font-bold text-[#0D9488] bg-[#F0FDFA] px-1.5 py-0.5 rounded border border-[#99F6E4]">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Re-reasoned Branch</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
