import { useCallback, useState, useRef } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "./Background.css";

export default function Backgrounds() {
  const reactFlowWrapper = useRef(null);

  const [count, setCount] = useState(1);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);

  /* ================= CONNECT ================= */

  const onConnect = useCallback((params) => {
    setEdges((eds) => {
      const alreadyConnected = eds.some(
        (edge) => edge.source === params.source
      );

      if (alreadyConnected) {
        alert("Each source can only have one outgoing edge.");
        return eds;
      }

      return addEdge(params, eds);
    });
  }, []);

  /* ================= DRAG & DROP ================= */

  const onDragStart = (event) => {
    event.dataTransfer.setData("application/reactflow", "messageNode");
    event.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      if (!type || !reactFlowWrapper.current) return;

      const bounds =
        reactFlowWrapper.current.getBoundingClientRect();

      const position = {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      };

      const newNode = {
        id: `${Date.now()}`,
        position,
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        data: {
          stage: count,
          message: "New Message",
        },
      };

      setNodes((nds) => [...nds, newNode]);
      setCount((prev) => prev + 1);
    },
    [count]
  );

  /* ================= NODE SELECTION ================= */

  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = () => {
    setSelectedNode(null);
  };


  const handleMessageChange = (value) => {
    if (!selectedNode) return;

    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode.id
          ? {
              ...node,
              data: { ...node.data, message: value },
            }
          : node
      )
    );

    setSelectedNode((prev) => ({
      ...prev,
      data: { ...prev.data, message: value },
    }));
  };


  const handleSave = () => {
    if (nodes.length <= 1) {
      alert("Flow saved successfully!");
      return;
    }

    const nodesWithoutIncoming = nodes.filter(
      (node) =>
        !edges.some((edge) => edge.target === node.id)
    );

    if (nodesWithoutIncoming.length > 1) {
      alert(
        "Error: More than one node has empty target handles."
      );
      return;
    }

    alert("Flow saved successfully!");
  };


  return (
    <div className="app-container">
      <div className="flow-container" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes.map((node) => ({
            ...node,
            data: {
              ...node.data,
              label: (
                <div className="node-container">
                  <div className="node-header">
                    Stage {node.data.stage}
                  </div>
                  <div className="node-body">
                    {node.data.message}
                  </div>
                </div>
              ),
            },
          }))}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          fitView
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={12}
            size={1}
          />
          <Controls />
        </ReactFlow>
      </div>

      <div className="input-container">
        {selectedNode ? (
          <div className="settings-panel">
            <div className="settings-header">
              <button
                className="back-button"
                onClick={() => setSelectedNode(null)}
              >
                ← Back
              </button>
              <h3>Edit Message</h3>
            </div>

            <input
              type="text"
              value={selectedNode.data.message}
              onChange={(e) =>
                handleMessageChange(e.target.value)
              }
            />
          </div>
        ) : (
          <div
            className="dnd-node"
            draggable
            onDragStart={onDragStart}
          >
            Message Node
          </div>
        )}

        <button
          className="save-button"
          onClick={handleSave}
        >
          Save Flow
        </button>
      </div>
    </div>
  );
}