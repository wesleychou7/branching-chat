import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  applyEdgeChanges,
  applyNodeChanges,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Dagre from "@dagrejs/dagre";
import { useState, useRef, useEffect } from "react";
import { MessageType, NodeType, EdgeType, ChatType } from "@/app/components/types";
import Node from "./Node";
import "./Node.css";

/**
 * Adjust these spacings as you like:
 * - SIBLING_HORIZONTAL_SPACING: extra space between siblings (left-right).
 * - PARENT_CHILD_VERTICAL_SPACING: vertical gap from parent's bottom to child's top.
 */
const SIBLING_HORIZONTAL_SPACING = 30;
const PARENT_CHILD_VERTICAL_SPACING = 60;

/**
 * layoutTree:
 * - Takes an array of nodes and edges (with each node’s width/height known).
 * - Returns a new array of nodes with x/y positions set for a top-down tree.
 */
function customLayout(nodes: NodeType[], edges: EdgeType[]): NodeType[] {
  // 1) Build a quick lookup so we can mutate a copy
  const nodeById: Record<string, NodeType> = {};
  nodes.forEach((n) => (nodeById[n.id] = { ...n }));

  // 2) Build adjacency: for each source, a list of targets
  const adjacency: Record<string, string[]> = {};
  edges.forEach(({ source, target }) => {
    if (!adjacency[source]) adjacency[source] = [];
    adjacency[source].push(target);
  });

  // 3) Find root(s). A root is any node with no incoming edges.
  //    If you have multiple roots, you can position them side by side at the top.
  const allTargets = new Set(edges.map((e) => e.target));
  const rootNodes = nodes.filter((n) => !allTargets.has(n.id));

  // We’ll store subtree widths in a cache so we don’t recalc them repeatedly
  const subtreeWidthCache: Record<string, number> = {};

  // This function returns how wide the entire subtree below `nodeId` is.
  // We'll use it to position siblings so they don’t overlap horizontally.
  function getSubtreeWidth(nodeId: string): number {
    // If cached, return immediately
    if (subtreeWidthCache[nodeId] !== undefined) {
      return subtreeWidthCache[nodeId];
    }

    const node = nodeById[nodeId];
    if (!node) return 0;

    const children = adjacency[nodeId] || [];
    if (children.length === 0) {
      // Leaf node: subtree width = the node’s own width
      subtreeWidthCache[nodeId] = node.width;
      return node.width;
    }

    // Sum widths of children plus spacing between them
    let totalChildrenWidth = 0;
    children.forEach((childId, index) => {
      totalChildrenWidth += getSubtreeWidth(childId);
      // Add horizontal spacing except after the last child
      if (index < children.length - 1) {
        totalChildrenWidth += SIBLING_HORIZONTAL_SPACING;
      }
    });

    // Subtree width is at least the parent's own width
    const subtreeW = Math.max(node.width, totalChildrenWidth);
    subtreeWidthCache[nodeId] = subtreeW;
    return subtreeW;
  }

  // This function actually positions a node (and its entire subtree).
  // `leftX` is the left edge where we can start drawing children,
  // `currentY` is where the current node’s top goes.
  function placeSubtree(nodeId: string, leftX: number, currentY: number) {
    const node = nodeById[nodeId];
    if (!node) return;

    const children = adjacency[nodeId] || [];
    const subtreeW = getSubtreeWidth(nodeId);

    // We'll place the node’s center at leftX + subtreeW/2
    const nodeCenterX = leftX + subtreeW / 2;
    node.position.x = nodeCenterX - node.width / 2;
    node.position.y = currentY;

    // If no children, we’re done
    if (children.length === 0) {
      return;
    }

    // We now place children in a row beneath this node.
    // We'll compute the total width of all children to center them.
    let totalChildrenWidth = 0;
    children.forEach((childId, i) => {
      totalChildrenWidth += getSubtreeWidth(childId);
      if (i < children.length - 1) {
        totalChildrenWidth += SIBLING_HORIZONTAL_SPACING;
      }
    });

    // The leftX for the first child so that the group is centered
    let childLeftX = nodeCenterX - totalChildrenWidth / 2;
    const childY = currentY + node.height + PARENT_CHILD_VERTICAL_SPACING;

    // Position each child left to right
    children.forEach((childId, i) => {
      const childSubtreeWidth = getSubtreeWidth(childId);

      // Recursively place the child subtree
      placeSubtree(childId, childLeftX, childY);

      // Advance childLeftX past the child’s subtree plus spacing
      childLeftX += childSubtreeWidth + SIBLING_HORIZONTAL_SPACING;
    });
  }

  // 4) Actually place each root’s subtree
  // For multiple roots, you might offset them horizontally. Here we just place them in a row.
  let nextRootLeftX = 0;
  rootNodes.forEach((root, index) => {
    const w = getSubtreeWidth(root.id);
    placeSubtree(root.id, nextRootLeftX, 0);
    // Move over horizontally for the next root (if multiple)
    nextRootLeftX += w + 100;
  });

  // Return the updated array of nodes
  return Object.values(nodeById);
}

const getLayoutedElements = (nodes: any[], edges: any[]) => {
  const dagreGraph = new Dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Set graph direction
  dagreGraph.setGraph({
    rankdir: "TB",
  });

  // Add nodes to dagre graph
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, node);
  });

  // Add edges to dagre graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Calculate layout
  Dagre.layout(dagreGraph);

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
  setSelectedChatID: React.Dispatch<React.SetStateAction<string | null>>;
  setChats?: React.Dispatch<React.SetStateAction<ChatType[]>>;
  messages: MessageType[];
  setMessages?: React.Dispatch<React.SetStateAction<MessageType[]>>;
  newChat?: boolean;
  setNewChat?: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Tree({
  selectedChatID,
  setChats,
  messages,
  setMessages,
}: Props) {
  const [heightsCalculated, setHeightsCalculated] = useState<boolean>(false);
  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [edges, setEdges] = useState<EdgeType[]>([]);
  const viewportRef = useRef({ x: 0, y: 0, zoom: 1 });
  const refs = useRef<(HTMLDivElement | null)[]>([]); // refs for each node to get height

  const nodeTypes = {
    node: (props: any) => (
      <Node
        {...props}
        selectedChatID={selectedChatID}
        setChats={setChats}
        messages={messages}
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
          parent_id: message.parent_id,
          label: message.role,
          value: message.content || "",
          height: 1,
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
          const height = ref.offsetHeight - 1;
          const node = nodes.find((node) => node.id === ref.id);
          if (node) {
            newNodes.push({
              ...node,
              height: height,
              data: { ...node.data, height: height },
            });
          }
        }
      }
      setNodes(customLayout(newNodes, edges));
      setHeightsCalculated(true);
    }
  }, [heightsCalculated, nodes, edges]);

  if (!heightsCalculated) {
    return (
      <div style={{ visibility: "hidden" }}>
        {nodes.map((node, index) => {
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
      <div className="w-full h-full">
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={(changes) =>
              setNodes((nds) => applyNodeChanges(changes, nds))
            }
            onEdgesChange={(changes) =>
              setEdges((eds) => applyEdgeChanges(changes, eds))
            }
            defaultViewport={viewportRef.current}
            onViewportChange={(viewport) => {
              viewportRef.current = viewport;
            }}
            nodesDraggable={false}
            panOnScroll
            panOnScrollSpeed={1.5}
            minZoom={0.2}
            noPanClassName="nopan"
            fitViewOptions={{
              maxZoom: 1.1,
            }}
          >
            <Background />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    );
  }
}
