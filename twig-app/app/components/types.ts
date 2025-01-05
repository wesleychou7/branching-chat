type ChatType = {
   id: string;
   name: string;
};

type MessageType = {
   id: string;
   parent_id: string | null;
   role: string;
   model_name?: string;
   content: string | null;
}

type NodeType = {
   id: string;
   type: string;
   position: { x: number; y: number };
   data: {
     id: string;
     parent_id: string | null;
     label: string;
     model_name: string | null;
     value: string;
     height: number;
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