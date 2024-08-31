import {Avatar, Badge, Typography} from "@material-tailwind/react";
import React from "react";

const ChatBubble = ({message, isSender}) => {
  console.log("message", message);
  return (
    <div
      className={`flex  items-center  z-10 relative ${
        isSender ? "justify-end" : "justify-start"
      } mb-4`}>
      <div className="w-10 pt-3">
        <Avatar
          size="sm"
          src="https://docs.material-tailwind.com/img/face-2.jpg"
          alt="avatar"
        />
      </div>
      <div className="w-full relative pb-2 px-2  ">
        <div className="w-5 h-3 absolute bottom-2 -z-40  bg-blue-gray-50"></div>
        <div className="w-fit rounded-xl px-4 pt-2 pb-1 z-50 bg-blue-gray-50">
          <p
            className={` text-black ${
              isSender ? "bg-blue-500" : "bg-blue-gray-50 text-black"
            }`}>
            {message?.message}
          </p>
          <Typography variant="small" color="blue-gray" className="font-normal text-xs ">
            {new Date(message.created_at).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
