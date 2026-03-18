import { ChatWindow } from "./ChatWindow";

interface InlineChatProps {
  entityId: string;
  entityType: "competitor" | "prospect" | "client" | "primary";
  entityName?: string;
}

export function InlineChat({ entityId, entityType, entityName }: InlineChatProps) {
  return (
    <div className="mt-8">
      <ChatWindow 
        entityId={entityId}
        entityType={entityType}
        entityName={entityName}
        compact={false}
      />
    </div>
  );
}
