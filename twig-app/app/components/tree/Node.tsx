import { useRef, useState, useEffect } from "react";
import { Handle, Position } from "@xyflow/react";
import { MessageType } from "@/app/components/types";
import TextareaAutosize from "react-textarea-autosize";
import Box from "@mui/joy/Box";

// props must be any type bc of dagre
export default function Node({
  id,
  data,
  messages,
  setMessages,
  setNodes,
  setEdges,
}: any) {
  const [prompt, setPrompt] = useState<string>(data.value);

  console.log(data);

  function onClickAddPrompt() {
    const maxId = Math.max(0, ...messages.map((msg: MessageType) => msg.id));
    const newMessage: MessageType = {
      id: maxId + 1,
      parent_id: id,
      role: "user",
      content: "",
    };
    setMessages((prev: MessageType[]) => prev.concat(newMessage));
  }

  const ref = useRef<HTMLDivElement>(null);

  return (
    <div ref={ref}>
      <Box
        style={{
          backgroundColor: "white",
          border: "2px solid gray",
          width: 750,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>{data.label}</div>
          <button>Delete</button>
        </div>
        {/* <div>{data.value}</div> */}
        <TextareaAutosize
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          style={{
            width: "99%",
            border: "none",
            resize: "none",
            outline: "none",
            fontFamily: "inherit",
            fontSize: "inherit",
          }}
        />

        <div style={{ display: "flex", justifyContent: "right" }}>
          <button onClick={onClickAddPrompt}>Add prompt</button>
          <button>Generate response</button>
        </div>
      </Box>

      {data.height > 1 && <Handle type="target" position={Position.Top} isConnectable={false} />}
      {data.height > 1 && <Handle type="source" position={Position.Bottom} isConnectable={false} />}
    </div>
  );
}
