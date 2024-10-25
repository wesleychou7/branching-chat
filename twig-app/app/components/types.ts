type MessageType = {
   id: number;
   parent_id: number | null;
   role: string;
   content: string | null;
}

export type { MessageType }