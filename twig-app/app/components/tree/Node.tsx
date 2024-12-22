import { useRef, useState, useEffect } from "react";
import { Handle, Position } from "@xyflow/react";
import { MessageType } from "@/app/components/types";
import TextareaAutosize from "react-textarea-autosize";
import supabase from "@/app/supabase";
import { v4 as uuidv4 } from "uuid";

// props must be any type bc of dagre
export default function Node({
  id, // THIS IS A STRING  
  data,
  selectedChatID,
  setMessages,
}: any) {
  const [prompt, setPrompt] = useState<string>(data.value);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    timeoutRef.current = setTimeout(async () => {
      const response = await supabase
        .from("messages")
        .update({ content: prompt })
        .eq("id", id);

      if (response.error) console.error(response.error);
    }, 3000);

    return () => clearTimeout(timeoutRef.current);
  }, [prompt, id]);

  async function onClickAddPrompt() {
    // add message to message state
    const newMessage: MessageType = {
      id: uuidv4(),
      parent_id: id,
      role: "user",
      content: "",
    };
    setMessages((prev: MessageType[]) => prev.concat(newMessage));

    // add message to database
    const response = await supabase.from("messages").insert({
      id: newMessage.id,
      chat_id: selectedChatID,
      role: "user",
      content: "",
      parent_id: id,
    });

    if (response.error) console.error(response.error);
  }

  async function onClickDelete() {
    // delete message from message state
    setMessages((prev: MessageType[]) =>
      prev.filter((msg: MessageType) => msg.id != id)
    );

    // delete message from database
    const response = await supabase.from("messages").delete().eq("id", id);

    if (response.error) console.error(response.error);
  }

  async function onClickGenerateResponse() {
    // add message to message state
    const newMessage: MessageType = {
      id: uuidv4(),
      parent_id: id,
      role: "assistant",
      content: "",
    };
    setMessages((prev: MessageType[]) => prev.concat(newMessage));

    // add message to database
    const response = await supabase.from("messages").insert({
      id: newMessage.id,
      chat_id: selectedChatID,
      role: "assistant",
      content: "",
      parent_id: id,
    });

    if (response.error) console.error(response.error);
  }

  return (
    <div>
      <div className="bg-white border border-gray-400 rounded-lg w-[750px] p-2">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <div>
            {data.label} {data.id}
          </div>
          <button onClick={onClickDelete}>Delete</button>
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

        <div className="flex justify-end text-xs text-gray-400 gap-4">
          <button onClick={onClickAddPrompt}>Add prompt</button>
          <button onClick={onClickGenerateResponse}>Generate response</button>
        </div>
      </div>

      {data.height > 1 && (
        <Handle type="target" position={Position.Top} isConnectable={false} />
      )}
      {data.height > 1 && (
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={false}
        />
      )}
    </div>
  );
}
