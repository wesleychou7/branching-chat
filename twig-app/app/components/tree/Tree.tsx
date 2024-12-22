import {
  ReactFlow,
  ReactFlowProvider,
  Background,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Dagre from "@dagrejs/dagre";
import { useState, useRef, useEffect } from "react";
import { MessageType, NodeType, EdgeType } from "@/app/components/types";
import Node from "./Node";

const getLayoutedElements = (nodes: any[], edges: any[]) => {
  const dagreGraph = new Dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Set graph direction and spacing
  dagreGraph.setGraph({
    rankdir: "TB",
  });

  // Add nodes to dagre graph
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, node);
  });

  // Add edges to dagre graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target, { height: 10, minlen: 1 });
  });

  // Calculate layout
  Dagre.layout(dagreGraph, { height: 100 });

  // Map nodes with updated positions and heights
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);

    return {
      ...node,
      position: {
        x: nodeWithPosition.x - node.width / 2,
        y: nodeWithPosition.y - node.height / 2,
      },
      data: {
        ...node.data,
        width: node.width,
        height: node.height,
      },
    };
  });
  return layoutedNodes;
};

interface Props {
  selectedChatID: string | null;
  messages: MessageType[];
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
}

export default function Tree({ selectedChatID, messages, setMessages }: Props) {
  const [heightsCalculated, setHeightsCalculated] = useState<boolean>(false);
  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [edges, setEdges] = useState<EdgeType[]>([]);
  const refs = useRef<(HTMLDivElement | null)[]>([]); // refs for each node to get height

  const nodeTypes = {
    node: (props: any) => (
      <Node
        {...props}
        selectedChatID={selectedChatID}
        setMessages={setMessages}
      />
    ),
  };

  // load nodes and edges from messages
  useEffect(() => {
    const newNodes: NodeType[] = [];
    const newEdges: EdgeType[] = [];
    for (const message of messages) {
      newNodes.push({
        id: message.id,
        type: "node",
        position: { x: 0, y: 0 },
        data: {
          id: message.id,
          label: message.role,
          value: message.content || "",
        },
        width: 750,
        height: 1,
        message: message,
      });
      if (message.parent_id) {
        newEdges.push({
          id: message.id,
          source: message.parent_id,
          target: message.id,
        });
      }
    }
    setNodes(newNodes);
    setEdges(newEdges);
    setHeightsCalculated(false);
  }, [messages]);

  useEffect(() => {
    if (!heightsCalculated) {
      const newNodes: NodeType[] = [];
      for (const ref of refs.current) {
        if (ref) {
          const height = ref.offsetHeight;
          const node = nodes.find((node) => node.id === ref.id);
          if (node) {
            newNodes.push({ ...node, height: height });
          }
        }
      }
      setNodes(getLayoutedElements(newNodes, edges));
      setHeightsCalculated(true);
    }
  }, [heightsCalculated, nodes, edges]);

  if (!heightsCalculated) {
    return (
      <div style={{ visibility: "hidden" }}>
        {nodes
          .filter((node) => node.message.id !== "-1")
          .map((node, index) => {
            return (
              <div
                ref={(el: HTMLDivElement | null) => {
                  refs.current[index] = el;
                }}
                key={index}
                id={node.id}
              >
                <Node {...node} />
              </div>
            );
          })}
      </div>
    );
  } else {
    return (
      <div style={{ width: "100%", height: "100%" }}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            panOnScroll
            panOnScrollSpeed={1.5}
            elevateEdgesOnSelect
          >
            <Background />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    );
  }
}
