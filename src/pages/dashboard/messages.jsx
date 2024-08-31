import React, {useEffect, useState} from "react";
import AvatarWithDotIndicator from "@/components/message-table/AvatarWithDotIndicator";
import {
  Avatar,
  Badge,
  Card,
  CardBody,
  Input,
  List,
  ListItem,
  ListItemPrefix,
  Typography,
} from "@material-tailwind/react";
import {MagnifyingGlassIcon} from "@heroicons/react/24/solid";
import {getMessageApis, markMessagesAsRead} from "@/apis/messages-api";
import MessageList from "@/components/message-table/MessageList";

export default function Messages() {
  const [messageData, setMessageData] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTable, setActiveTable] = useState(null);
  const [messageCountByTable, setMessageCountByTable] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchMessageData = async () => {
    try {
      const messageResult = await getMessageApis(searchQuery);

      if (messageResult && messageResult.data) {
        const messages = messageResult.data;

        const sortedMessages = messages.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
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

      setLoading(false);
    } catch (error) {
      console.error("Error fetching message data:", error);
      setLoading(false);
    }
  };

  // Filter messages based on active table number
  const handleTableClick = async (tableNo) => {
    setActiveTable(tableNo);

    const filtered = messageData.filter(
      (message) => message.tables?.table_no === tableNo,
    );

    setFilteredMessages(
      filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
    );

    if (filtered.length > 0) {
      setActiveTable(filtered[0]);
    }

    // Get table_id from filtered messages
    const tableId = filtered.length > 0 ? filtered[0].tables?.id : null;

    // Mark messages as read for the specific table
    if (tableId) {
      try {
        await markMessagesAsRead(tableId);
        const updatedMessageCountByTable = {...messageCountByTable};
        updatedMessageCountByTable[tableNo] = 0; // Reset count for the table
        setMessageCountByTable(updatedMessageCountByTable);
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    }
  };
  useEffect(() => {
    fetchMessageData();
  }, [searchQuery]);

  return (
    <div>
      <Card className="h-full w-full">
        <CardBody className="overflow-hidden grid grid-cols-1 md:grid-cols-3 px-5">
          <div className="w-full border-r border-gray-400 pr-5">
            <AvatarWithDotIndicator messageResult={messageData} />
            <div className="w-full mt-5">
              <Input
                label="Search by user"
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
              <List className="px-0 w-full h-96 overflow-y-scroll pr-2">
                {Array.from(
                  new Map(
                    messageData
                      .sort((b, a) => new Date(b.created_at) - new Date(a.created_at))
                      .map((msg) => [msg.tables?.table_no, msg]),
                  ).values(),
                ).map((msg, index) => (
                  <div className="w-full min-h-96" key={msg.tables?.table_no || index}>
                    <ListItem
                      onClick={() => handleTableClick(msg.tables?.table_no)}
                      className={`cursor-pointer ${
                        activeTable === msg.tables?.table_no ? "bg-blue-50" : ""
                      }`}>
                      <ListItemPrefix className="w-16">
                        <Badge
                          placement="bottom-end"
                          overlap="circular"
                          content={messageCountByTable[msg.tables?.table_no] || 0}
                          color="green"
                          className={`font-normal w-2 h-2  flex items-center  justify-center ${
                            messageCountByTable[msg.tables?.table_no]
                              ? ""
                              : " bg-[#4caf50] text-[#4caf50]"
                          }`}
                          withBorder>
                          <Avatar
                            size="md"
                            variant="circular"
                            alt="Table Icon"
                            src="https://docs.material-tailwind.com/img/face-1.jpg"
                          />
                        </Badge>
                      </ListItemPrefix>
                      <div className="w-full">
                        <Typography variant="h6" color="blue-gray">
                          Table No : {msg.tables?.table_no || "Unknown Table No"}
                        </Typography>
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
            </div>
          </div>
          <div className="w-full max-h-96 px-5 col-span-2">
            {filteredMessages.length > 0 ? (
              <>
                <div className="w-full flex justify-between items-center py-5 ">
                  <div className="flex gap-3 items-center">
                    <Badge
                      placement="bottom-end"
                      overlap="circular"
                      color="green"
                      withBorder>
                      <Avatar
                        size="md"
                        src="https://docs.material-tailwind.com/img/face-2.jpg"
                        alt="avatar"
                      />
                    </Badge>
                    <div>
                      <Typography variant="h6" color="gray">
                        Table No:{" "}
                        {filteredMessages[0]?.tables?.table_no || "Unknown Table No"}
                      </Typography>
                      <Typography variant="small" color="gray" className="font-normal">
                        {filteredMessages[0]?.tables?.is_booked ? "Booked" : "Available"}
                      </Typography>
                    </div>
                  </div>
                </div>
                <div className="w-full   border-t border-gray-300  ">
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
