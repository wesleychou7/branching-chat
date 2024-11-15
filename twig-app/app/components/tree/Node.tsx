import { useRef, useEffect } from "react";
import { Handle, Position } from "@xyflow/react";
import Box from "@mui/joy/Box";

// props must be any type bc of dagre
export default function Node({ data }: any) {
  function onClickAddPrompt() {
    
  }

  const ref = useRef<HTMLDivElement>(null);

  console.log(data);

  return (
    <div ref={ref}>
      {data.height > 1 && <Handle type="target" position={Position.Top} />}
      <div
        style={{
          border: "2px solid gray",
          width: 750,
        }}
      >
        <div style={{ display: "flex", justifyContent: "right" }}>
          <button>Delete</button>
        </div>
        <div>
          {data.label} {data.value}
        </div>
        <div style={{ display: "flex", justifyContent: "right" }}>
          <button>Add prompt</button>
          <button>Generate response</button>
        </div>
      </div>
      {data.height > 1 && <Handle type="source" position={Position.Bottom} />}
    </div>
  );
}

/**
 * todo:
 * - fix node handles
 * - let treewrapper take in messages prop
 */
