import ChatBubble from "./ChatBubble";

export default function MessageList({filteredMessages}) {
  const reverse = [...filteredMessages]?.reverse();
  return (
    <div className="w-full max-h-96 pt-5 pb-5 overflow-y-auto">
      {reverse?.map((msg) => (
        <div key={msg.id}>
          <ChatBubble message={msg} />
        </div>
      ))}
    </div>
  );
}
