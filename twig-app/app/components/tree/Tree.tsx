import { ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { MessageType } from "@/app/components/types";

interface Props {
  messages: MessageType[];
}

const Tree = ({ messages }: Props) => {
  const initialNodes: { id: string; position: { x: number; y: number }; data: { label: string } }[] = [];
  const initialEdges: { id: string; source: string; target: string }[] = [];

  messages.forEach((message, index) => {
    initialNodes.push({
      id: message.id.toString(),
      position: { x: 100 + index * 200, y: 100 },
      data: { label: `${message.id}${message.content}` || "" },
    });

    if (message.parent_id) {
      initialEdges.push({
        id: `${message.parent_id}-${message.id}`,
        source: message.parent_id.toString(),
        target: message.id.toString(),
      });
    }
  });
  return <ReactFlow nodes={initialNodes} edges={initialEdges} fitView />;
};

export default Tree;
