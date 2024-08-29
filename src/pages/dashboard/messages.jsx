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
import {getMessageApis} from "@/apis/messages-api";

export default function Messages() {
  const [messageData, setMessageData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMessage, setActiveMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMessageData = async () => {
    const messageResult = await getMessageApis();
    if (messageResult) {
      const messages = messageResult.data;

      // Sort messages in descending order based on created_at
      const sortedMessages = messages.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      );

      setMessageData(sortedMessages);

      // Set the most recent message as the active message by default
      if (sortedMessages.length > 0) {
        setActiveMessage(sortedMessages[0]);
      }
    }
    setLoading(false);
  };

  console.log("activeMessage", activeMessage);
  useEffect(() => {
    fetchMessageData();
  }, []);

  return (
    <div>
      <Card className="h-full w-full">
        <CardBody className="overflow-x-scroll grid  grid-cols-1 md:grid-cols-3  gap-4 px-5">
          <div className=" w-full border-r border-gray-400  pr-5">
            <AvatarWithDotIndicator messageResult={messageData} />
            <div className="w-full mt-6 ">
              <Input
                label="Search by user"
                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setLoading(true);
                  }
                }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="w-full pt-2 relative">
              {/* Check if messageData exists and is an array */}

              <List className="px-0 w-full h-96 overflow-y-scroll ">
                {messageData?.map(
                  (
                    {
                      created_at,
                      is_read,
                      message,
                      order_id,
                      restaurant_id,
                      restaurants,
                      sub_message,
                      table_id,
                      tables,
                      user_id,
                      users,
                    },
                    index,
                  ) => (
                    <div className="min-h-96">
                      <ListItem
                        key={index}
                        onClick={() => setActiveMessage(messageData[index])}
                        className={`cursor-pointer  ${
                          activeMessage === messageData[index] ? "bg-blue-50" : ""
                        }`}>
                        <ListItemPrefix className="w-20">
                          <Avatar
                            size="md"
                            variant="circular"
                            alt={users?.name || "Unknown User"}
                            src={
                              users?.avatar ||
                              "https://docs.material-tailwind.com/img/face-1.jpg"
                            }
                          />
                        </ListItemPrefix>
                        <div
                          className="w-full 
                      ">
                          <Typography variant="h6" color="blue-gray">
                            Table No :{" "}
                            {tables?.table_no ? tables.table_no : "Unknown Table No"}
                          </Typography>

                          <Typography
                            variant="small"
                            color="gray"
                            className="font-normal !line-clamp-1">
                            {message ? message : "No message available"}
                          </Typography>
                        </div>{" "}
                      </ListItem>
                    </div>
                  ),
                )}
              </List>
            </div>
          </div>

          <div className=" w-full col-span-2">
            {activeMessage ? (
              <div>
                <div className="w-full flex justify-between ">
                  <div className="flex gap-3 items-center pb-10">
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
                      <Typography variant="h6">{activeMessage?.users.name}</Typography>
                      <Typography variant="small" color="gray" className="font-normal">
                        Online
                      </Typography>
                    </div>
                  </div>
                  <div>
                    <Typography variant="h6" color="gray">
                      Table No : {activeMessage.tables.table_no}
                    </Typography>
                  </div>
                </div>

                <Typography variant="h6" color="blue-gray">
                  {activeMessage.message}
                </Typography>
                <Typography variant="small" color="gray" className="font-normal mt-2">
                  Sent by: {activeMessage?.users?.name || "Unknown User"}
                </Typography>
                <Typography variant="small" color="gray" className="font-normal mt-2">
                  {activeMessage.sub_message || "No additional details"}
                </Typography>
              </div>
            ) : (
              <div>
                <Typography variant="h6" color="blue-gray">
                  Select a message to view details.
                </Typography>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
