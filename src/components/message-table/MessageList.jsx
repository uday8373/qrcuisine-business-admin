import {useEffect, useRef} from "react";
import ChatBubble from "./ChatBubble";

export default function MessageList({filteredMessages}) {
  const messagesEndRef = useRef(null);

  // Scroll to the bottom whenever messages are updated
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({behavior: "smooth"});
    }
  }, [filteredMessages]);

  return (
    <div className="w-full max-h-96 pt-5 pb-5 overflow-y-auto">
      {filteredMessages.map((msg, index) => (
        <div key={index}>
          <ChatBubble message={msg} />
        </div>
      ))}
      {/* Empty div used as a reference point for scrolling */}
      <div ref={messagesEndRef}></div>
    </div>
  );
}