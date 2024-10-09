import React, {useEffect, useState} from "react";
import AvatarWithDotIndicator from "@/components/message-table/AvatarWithDotIndicator";
import {
  Badge,
  Card,
  CardBody,
  Chip,
  Input,
  List,
  ListItem,
  ListItemPrefix,
  Spinner,
  Typography,
} from "@material-tailwind/react";
import {MagnifyingGlassIcon} from "@heroicons/react/24/solid";
import {getMessageApis, markMessagesAsRead} from "@/apis/messages-api"; // Removed subscribeToMessages
import MessageList from "@/components/message-table/MessageList";
import moment from "moment";

function timeAgo(createdDate) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(createdDate)) / 1000);
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? "s" : ""} `;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? "s" : ""} `;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? "s" : ""} `;
  }
}

export default function Messages() {
  const [messageData, setMessageData] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTable, setActiveTable] = useState(null);
  const [messageCountByTable, setMessageCountByTable] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch message data
  const fetchMessageData = async () => {
    try {
      const messageResult = await getMessageApis(searchQuery);

      if (messageResult && messageResult.data) {
        const messages = messageResult.data.map((msg) => ({
          ...msg,
          timeAgo: timeAgo(msg.created_at), // Calculate relative time
        }));

        const sortedMessages = messages.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at),
        );
        setMessageData(sortedMessages);

        // Count messages by table_no
        const countByTable = messages.reduce((acc, message) => {
          const tableNo = message.tables?.table_no;
          if (tableNo && message.is_read === false) {
            acc[tableNo] = (acc[tableNo] || 0) + 1;
          }
          return acc;
        }, {});

        setMessageCountByTable(countByTable);
      }
    } catch (error) {
      console.error("Error fetching message data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTable) {
      const filtered = messageData.filter(
        (message) => message.tables?.table_no === activeTable,
      );
      setFilteredMessages(
        filtered.sort((b, a) => new Date(b.created_at) - new Date(a.created_at)),
      );
    } else {
      setFilteredMessages([]);
    }
  }, [messageData, activeTable]);

  const handleTableClick = async (tableNo) => {
    setActiveTable(tableNo);

    const filtered = messageData.filter(
      (message) => message.tables?.table_no === tableNo,
    );

    setFilteredMessages(
      filtered.sort((b, a) => new Date(b.created_at) - new Date(a.created_at)),
    );

    if (filtered.length > 0) {
      const tableId = filtered[0].tables?.id;

      if (tableId) {
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        try {
          await delay(5000); // 5000 milliseconds = 5 seconds
          await markMessagesAsRead(tableId);

          const updatedMessageCountByTable = {...messageCountByTable};
          updatedMessageCountByTable[tableNo] = 0; // Reset count for the table
          setMessageCountByTable(updatedMessageCountByTable);
        } catch (error) {
          console.error("Error marking messages as read:", error);
        }
      }
    }
  };

  const latestMessagesByTable = Array.from(
    messageData.reduce((acc, msg) => {
      const tableNo = msg.tables?.table_no;
      if (tableNo) {
        if (
          !acc.has(tableNo) ||
          new Date(msg.created_at) > new Date(acc.get(tableNo).created_at)
        ) {
          acc.set(tableNo, msg);
        }
      }
      return acc;
    }, new Map()),
  ).sort((a, b) => new Date(b[1].created_at) - new Date(a[1].created_at));

  useEffect(() => {
    fetchMessageData();
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="flex w-full h-[500px] justify-center items-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="mt-6">
      <Card className="h-full w-full">
        <CardBody className="overflow-hidden grid grid-cols-1 md:grid-cols-3 px-5">
          <div className="w-full border-r border-gray-400 pr-5">
            <AvatarWithDotIndicator messageResult={messageData} />
            <div className="w-full mt-5">
              <Input
                label="Search by Table No"
                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setLoading(true);
                    fetchMessageData();
                  }
                }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full pt-2 relative">
              {loading ? (
                <div className="flex w-full h-96 justify-center items-center">
                  <Spinner className="h-8 w-8" />
                </div>
              ) : latestMessagesByTable.length > 0 ? (
                <List className="px-0 w-full h-96 overflow-y-auto pr-2">
                  {latestMessagesByTable?.map(([tableNo, msg], index) => (
                    <div className="w-full min-h-96" key={tableNo || index}>
                      <ListItem
                        onClick={() => handleTableClick(tableNo)}
                        className={`cursor-pointer ${
                          activeTable === tableNo ? "bg-blue-50" : ""
                        }`}>
                        <ListItemPrefix className="w-16">
                          <Badge
                            placement="top-end"
                            overlap="circular"
                            content={messageCountByTable[tableNo] || 0}
                            color="green"
                            className={`font-bold w-2 h-2 flex items-center justify-center ${
                              messageCountByTable[tableNo]
                                ? ""
                                : " bg-[#4caf50] text-[#4caf50]"
                            }`}>
                            <Chip
                              value={tableNo}
                              variant="ghost"
                              className="w-12 h-12 flex justify-center items-center text-xl"
                            />
                          </Badge>
                        </ListItemPrefix>
                        <div className="w-full">
                          <div className="w-full flex items-center justify-between">
                            <Typography variant="h6" color="blue-gray">
                              Table No: {tableNo || "Unknown Table No"}
                            </Typography>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal !line-clamp-1">
                              {moment(messageData.created_at).fromNow()}
                            </Typography>
                          </div>
                          <Typography
                            variant="small"
                            color="gray"
                            className="font-normal !line-clamp-1">
                            {msg.message ? msg.message : "No message available"}
                          </Typography>
                        </div>
                      </ListItem>
                    </div>
                  ))}
                </List>
              ) : (
                <div
                  className={`w-full ${
                    latestMessagesByTable?.length === 0 && "h-96"
                  } flex justify-center items-center  `}>
                  <Typography variant="h6" color="blue-gray" className="font-normal">
                    No Messages Found
                  </Typography>
                </div>
              )}
            </div>
          </div>
          <div
            className={`${
              filteredMessages.length === 0 && "h-96 "
            } px-5 col-span-2 relative w-full`}>
            {filteredMessages.length > 0 ? (
              <>
                <div className="w-full flex justify-between items-center py-5 ">
                  <div className="flex gap-3 items-center">
                    <div className="relative">
                      <Chip
                        value={filteredMessages[0]?.tables?.table_no}
                        className="h-12 w-12 flex justify-center items-center text-lg"
                        variant="ghost"
                      />
                      <div className="absolute -top-1 -right-1 z-20">
                        <span class="relative flex h-3 w-3">
                          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                      </div>
                    </div>
                    <div className="pl-3">
                      <Typography variant="h6" color="gray">
                        Table No:{" "}
                        {filteredMessages[0]?.tables?.table_no || "Unknown Table No"}
                      </Typography>
                      <Chip
                        className="flex justify-center"
                        variant="ghost"
                        color={filteredMessages[0]?.tables?.is_booked ? "green" : "gray"}
                        value={
                          filteredMessages[0]?.tables?.is_booked ? "Booked" : "Available"
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="w-full  border-t border-gray-300  ">
                  <MessageList filteredMessages={filteredMessages} />
                </div>
              </>
            ) : (
              <Typography variant="h6" color="blue-gray">
                Select a table to view messages.
              </Typography>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
