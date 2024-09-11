import {Chip, IconButton, Typography} from "@material-tailwind/react";
import React from "react";
import {PiChecksBold} from "react-icons/pi";

const ChatBubble = ({message, isSender}) => {
  return (
    <div>
      <div
        className={`flex  items-center gap-3 z-10 relative   ${
          isSender ? "justify-end" : "justify-start"
        } mb-4`}>
        <div className="w-full relative pb-2 px-2  ">
          <div
            className={`w-5 h-3 absolute bottom-2 -z-40  ${
              message?.is_read ? "bg-blue-gray-50" : "bg-blue-100"
            }`}></div>
          <div
            className={`w-fit rounded-xl px-4 pt-2 pb-1 z-50 ${
              message?.is_read ? "bg-blue-gray-50" : "bg-blue-100"
            }`}>
            <p className={` text-black`}>{message?.message}</p>
            <div className="flex items-center  justify-between w-full">
              <Typography
                variant="small"
                color="blue-gray"
                className="font-normal text-xs ">
                {new Date(message.created_at).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Typography>
              {message.is_read && <PiChecksBold color="#1976d2" />}
            </div>
          </div>
        </div>
      </div>
      {message.message ===
        `Please call the waiter to prepare the bill for table no: ${message?.tables?.table_no}` && (
        <div className="flex items-center pb-5">
          <div className="w-full border-t-2 border-gray-500"></div>

          <div className="min-w-fit">
            <Typography variant="small" color="deep-orange" className="font-normal mx-4 ">
              Sessions End
            </Typography>
          </div>
          <div className="w-full border-t-2 border-gray-500"></div>
        </div>
      )}
    </div>
  );
};

export default ChatBubble;
