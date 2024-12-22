type ChatType = {
   id: string;
   name: string;
};

type MessageType = {
   id: string;
   parent_id: string | null;
   role: string;
   content: string | null;
}

type NodeType = {
   id: string;
   type: string;
   position: { x: number; y: number };
   data: {
     id: string;
     label: string;
     value: string;
   };
 
   width: number;
   height: number;
   message: MessageType;
 };
 
type EdgeType = {
   id: string;
   source: string;
   target: string;
 };

export type { ChatType, MessageType, NodeType, EdgeType }