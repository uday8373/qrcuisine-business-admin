import React, {useEffect, useState} from "react";
import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuHandler,
  MenuItem,
  MenuList,
  Typography,
} from "@material-tailwind/react";
import {ChevronDownIcon, Clock, User, X} from "lucide-react";
import Datepicker from "react-tailwindcss-datepicker";
import {getMessageApis, subscribeToMessages} from "@/apis/messages-api";
import supabase from "@/configs/supabase";
import {getOrderTableApis} from "@/apis/activity-table-api";
import ViewOrder from "../table-activity-modal/view-order";

const ActivityTableView = ({tableId, tableNo}) => {
  const [selectedOption, setSelectedOption] = useState("LIVE");
  const [messageData, setMessageData] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [orderTable, setOrderTable] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [value, setValue] = useState({
    startDate: null,
    endDate: null,
  });

  const [open, setOpen] = useState(null);

  const [openView, setOpenView] = useState(false);
  const openDrawer = (orderId) => {
    setSelectedOrderId(orderId);
    console.log("orderId", orderId);
    setOpenView(true);
  };
  const closeDrawer = () => {
    setOpenView(false);
    setSelectedOrderId(null);
  };

  const handleOpen = (index) => {
    setOpen(open === index ? null : index); // Toggle open/close on click
  };

  const handleMenuItemClick = (option) => {
    setSelectedOption(option);
  };

  function timeAgo(createdDate) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(createdDate)) / 1000);
    if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  }

  const formatOrderDate = (dateString) => {
    const date = new Date(dateString);

    const day = date.getDate();
    const month = date.toLocaleString("default", {month: "long"});
    const year = date.getFullYear();

    // Function to get the ordinal suffix for the day
    const getOrdinalSuffix = (day) => {
      if (day > 3 && day < 21) return "th"; // For numbers 4 to 20
      switch (day % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };

    // Combine day, month, year with the ordinal suffix for the day
    return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
  };

  // Fetch message data from API
  const fetchMessageData = async () => {
    setLoading(true);
    setError(null);
    try {
      const messageResult = await getMessageApis({status: selectedOption});

      if (messageResult && messageResult.data) {
        const messages = messageResult.data.map((msg) => ({
          ...msg,
          timeAgo: timeAgo(msg.created_at),
        }));
        setMessageData(messages);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error); // Log error details
      setError("Failed to fetch messages. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filterMessageData = () => {
    if (!tableId) {
      return [];
    }

    if (messageData.length === 0) {
      return [];
    }

    const today = new Date();
    const currentDate = today.toISOString().split("T")[0];

    return messageData.filter((msg) => {
      const msgDate = new Date(msg.created_at);

      const msgTableId = msg.tables?.id;

      const isMessageForSelectedTable = msgTableId === tableId;

      if (!isMessageForSelectedTable) {
        return false;
      }

      if (selectedOption === "LIVE") {
        const msgDateString = msgDate.toISOString().split("T")[0];
        return msgDateString === currentDate;
      }

      return false;
    });
  };

  const fetchOrderData = async () => {
    setLoading(true);
    setError(null);
    try {
      const orderResult = await getOrderTableApis();

      if (orderResult && orderResult.data) {
        // Grouping orders by date
        const groupedOrders = orderResult.data.map((group) => ({
          orderDate: group.order_date,
          orderCount: group.order_count,
          orders: group.orders.map((order) => ({
            ...order,
            timeAgo: timeAgo(order.created_at),
          })),
        }));

        setOrderTable(groupedOrders);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error); // Log error details
      setError("Failed to fetch orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filterOrderData = () => {
    if (!tableId || orderTable.length === 0) {
      return [];
    }

    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    // Filter orders based on selected filters
    return orderTable
      .map((group) => ({
        ...group,
        orders: group.orders.filter((order) => {
          const orderDate = new Date(order.created_at);
          const orderDay = orderDate.getDate();
          const orderMonth = orderDate.getMonth() + 1;
          const orderYear = orderDate.getFullYear();
          const orderTableId = order?.table_id;

          const isOrderForSelectedTable = orderTableId === tableId;

          if (!isOrderForSelectedTable) {
            return false;
          }

          // Check for TODAY
          if (selectedOption === "TODAY") {
            const isToday =
              orderDay === currentDay &&
              orderMonth === currentMonth &&
              orderYear === currentYear;
            return isToday;
          }

          // Check for MONTHLY
          if (selectedOption === "MONTHLY") {
            const isCurrentMonth =
              orderMonth === currentMonth && orderYear === currentYear;
            return isCurrentMonth;
          }

          // Check for DATE RANGE
          if (selectedOption === "DATE RANGE" && value.startDate && value.endDate) {
            const startDate = new Date(value.startDate);
            const endDate = new Date(value.endDate);
            const isInRange = orderDate >= startDate && orderDate <= endDate;
            return isInRange;
          }

          return false;
        }),
      }))
      .filter((group) => group.orders.length > 0); // Ensure we only return groups with filtered orders
  };
  useEffect(() => {
    fetchMessageData(); // Fetch data on initial render
    filterOrderData();

    const channel = subscribeToMessages((event, newMessage) => {
      if (event === "INSERT") {
        setMessageData((prevData) => {
          const exists = prevData.some((msg) => msg.id === newMessage.id);

          if (!exists) {
            return [
              ...prevData,
              {
                ...newMessage,
                timeAgo: timeAgo(newMessage.created_at),
                tableNo: newMessage.table_no,
              },
            ];
          }
          return prevData;
        });
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableId]);

  useEffect(() => {
    filterMessageData();
  }, [selectedOption, messageData.length, tableId]);

  const filteredMessageData = filterMessageData();
  const sortedMessageData = [...filteredMessageData].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at),
  );

  useEffect(() => {
    fetchOrderData();
  }, [tableId]);

  useEffect(() => {
    const filteredOrders = filterOrderData();
    setFilteredOrders(filteredOrders);
  }, [orderTable, selectedOption, value]);

  const markOrderAsPaid = async (orderId) => {
    setIsUpdating(true);
    try {
      const {data, error} = await supabase
        .from("orders")
        .update({is_paid: true})
        .eq("id", orderId);

      if (error) {
        console.error("Error updating order:", error);
        alert("Failed to mark order as paid. Please try again.");
      } else {
        fetchOrderData();
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setIsUpdating(false);
    }
  };
  function Icon({id, open}) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className={`${id === open ? "rotate-180" : ""} h-5 w-5 transition-transform`}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 8.25l-7.5 7.5-7.5-7.5"
        />
      </svg>
    );
  }

  return (
    <div className="relative w-full h-auto">
      <div className="w-full grid grid-cols-8 ">
        <div className="bg-orange-400 p-5 flex justify-center items-center">
          <Typography variant="h4" color="white">
            {tableNo ? ` ${tableNo}` : "No Table Selected"}
          </Typography>
        </div>
        <div className="col-span-5 flex justify-center items-center bg-blue-gray-200">
          <Typography variant="h4" color="white">
            {selectedOption}
          </Typography>
        </div>
        <div className="bg-orange-400 col-span-2 flex justify-center items-center">
          <Menu>
            <MenuHandler>
              <Button color="white" variant="text" className="flex gap-1 items-center">
                <ChevronDownIcon />
                {selectedOption || "LIVE"}
              </Button>
            </MenuHandler>
            <MenuList>
              <MenuItem onClick={() => handleMenuItemClick("LIVE")}>LIVE</MenuItem>
              <MenuItem onClick={() => handleMenuItemClick("TODAY")}>TODAY</MenuItem>
              <MenuItem onClick={() => handleMenuItemClick("MONTHLY")}>MONTHLY</MenuItem>
              <MenuItem onClick={() => handleMenuItemClick("DATE RANGE")}>
                DATE RANGE
              </MenuItem>
            </MenuList>
          </Menu>
        </div>
      </div>
      {selectedOption === "TODAY" ||
      selectedOption === "MONTHLY" ||
      selectedOption === "DATE RANGE" ? (
        <>
          <div className="flex items-center justify-center">
            <div className="py-2 grid grid-cols-4 gap-5 bg-orange-100 mt-2 w-full px-5">
              <div>
                <Typography variant="h6" color="black">
                  SALE
                </Typography>
                <Typography variant="h6" color="black">
                  Rs.5000
                </Typography>
              </div>
              <div>
                <Typography variant="h6" color="black">
                  BOOKED
                </Typography>
                <Typography variant="h6" color="black">
                  122 times
                </Typography>
              </div>
              <div>
                <Typography variant="h6" color="black">
                  AVG TIME SPENT
                </Typography>
                <Typography variant="h6" color="black">
                  42 min/ Customer
                </Typography>
              </div>
              <div>
                <Typography variant="h6" color="black">
                  AVG RATING
                </Typography>
                <Typography variant="h6" color="black">
                  4.5
                </Typography>
              </div>
            </div>
          </div>

          {selectedOption === "DATE RANGE" && (
            <div className="border-2 border-gray-400 mx-5 mt-5 rounded-md">
              <Datepicker
                value={value}
                onChange={(newValue) => setValue(newValue)}
                showShortcuts
              />
            </div>
          )}

          <div className="pb-5 grid grid-cols-1 gap-5 pt-5">
            {filteredOrders.length === 0 ? (
              <div className="w-full h-[70vh] flex flex-col text-center gap-5 items-center justify-center">
                <Typography variant="h3" color="black">
                  VACANT
                </Typography>
                <Typography variant="h4" color="black">
                  This table has no active customer yet
                </Typography>
                <Typography variant="paragraph">
                  You can view this table booking history by changing the dropdown value
                  above <br />
                  from "live" to any other time frame
                </Typography>
              </div>
            ) : (
              filteredOrders.map((group, index) => (
                <Accordion
                  key={index}
                  icon={<Icon id={index} open={open} />}
                  open={open === index}>
                  <AccordionHeader
                    className="bg-gray-300 px-5"
                    onClick={() => handleOpen(index)}>
                    {formatOrderDate(group.orderDate)}
                  </AccordionHeader>

                  <AccordionBody>
                    {group.orders.map((order, orderIndex) => (
                      <div key={orderIndex} className="p-2 border-b">
                        <div className="flex gap-3 w-full items-center pr-5">
                          <span className="p-[2px] w-16 bg-gray-400"></span>
                          <IconButton
                            variant="gradient"
                            color="green"
                            size="sm"
                            className="rounded-full w-full">
                            <i className="fas fa-heart" />
                          </IconButton>
                          <div className="w-full bg-gray-300 grid-cols-5 gap-2 grid rounded-xl">
                            <div className="col-span-2 w-full items-center text-start pl-5 py-2 justify-center">
                              <Typography variant="h6" color="black">
                                {order?.user_id?.name || "No users"}
                              </Typography>
                              <Typography variant="small" color="black">
                                {timeAgo(order?.created_at)}
                              </Typography>
                            </div>
                            <div
                              className={`flex justify-center items-start px-3 text-start flex-col ${
                                order?.is_delivered
                                  ? "bg-green-500"
                                  : order?.is_cancelled
                                  ? "bg-red-200"
                                  : order?.is_abandoned
                                  ? "bg-yellow-500"
                                  : "bg-blue-300"
                              }`}>
                              <Typography variant="h6" color="white">
                                {order?.is_delivered
                                  ? "Delivered"
                                  : order?.is_cancelled
                                  ? "Cancelled"
                                  : order?.is_abandoned
                                  ? "Abandoned"
                                  : "Pending"}
                              </Typography>
                              <Typography variant="small" color="white">
                                {timeAgo(order?.created_at)}
                              </Typography>
                            </div>

                            <div>
                              <Button
                                onClick={() => openDrawer(order?.id)}
                                size="lg"
                                variant="filled"
                                className="flex items-center justify-center flex-col w-full h-full rounded-none"
                                color="blue-gray">
                                View Orders
                              </Button>
                            </div>
                            <div className="bg-green-500 flex items-center justify-center rounded-r-xl">
                              <Typography variant="h6" color="white">
                                Rs. {order.grand_amount}
                              </Typography>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </AccordionBody>
                </Accordion>
              ))
            )}
          </div>
        </>
      ) : (
        <>
          <div className="h-[90vh] pb-5 overflow-y-auto w-full">
            <ul className="flex flex-col w-full gap-5 pt-5">
              {sortedMessageData.length === 0 ? (
                <div className="w-full h-[70vh] flex flex-col text-center gap-5 items-center justify-center">
                  <Typography variant="h3" color="black">
                    VACANT
                  </Typography>
                  <Typography variant="h4" color="black">
                    This table has no active customer yet
                  </Typography>
                  <Typography variant="paragraph">
                    You can view this table booking history by changing the dropdown value
                    above <br />
                    from "live" to any other time frame
                  </Typography>
                </div>
              ) : (
                sortedMessageData.map((msg, index) => {
                  const isBillRequested = msg.message
                    ?.toLowerCase()
                    .includes("prepare the bill");
                  const isOrderPlaced = msg.message
                    ?.toLowerCase()
                    .includes("order has been placed");

                  return (
                    <li key={index}>
                      <div className="flex gap-3 w-full items-center">
                        <span className="p-[2px] w-16 bg-gray-400"></span>
                        <IconButton
                          variant="gradient"
                          color="green"
                          size="sm"
                          className="rounded-full w-6 h-5"></IconButton>

                        <div className="w-full space-y-1">
                          <Typography color="black" variant="h6">
                            {msg.message}
                          </Typography>
                          <div className="w-full grid grid-cols-3">
                            <Typography variant="small">
                              {timeAgo(msg.created_at)} ago
                            </Typography>

                            <div className="flex gap-2 col-span-2 items-center justify-end w-full">
                              {isBillRequested && (
                                <>
                                  <Chip
                                    value="Vacant"
                                    variant="filled"
                                    size="lg"
                                    className="rounded-full"
                                    color="pink"
                                  />
                                  <Button
                                    onClick={() => markOrderAsPaid(msg?.orders?.id)}
                                    variant="filled"
                                    className="rounded-full"
                                    color="green"
                                    size="sm"
                                    disabled={msg?.orders?.is_paid || isUpdating}>
                                    {msg?.orders?.is_paid
                                      ? "Paid"
                                      : isUpdating
                                      ? "Processing..."
                                      : "Mark as paid"}
                                  </Button>

                                  <Chip
                                    value={`Rs. ${msg?.orders?.grand_amount}`}
                                    variant="filled"
                                    color="orange"
                                    className="rounded-full"
                                    size="lg"
                                  />
                                  <span className="p-[2px] w-16 bg-gray-400"></span>
                                </>
                              )}
                              {isOrderPlaced && (
                                <div className="flex items-center gap-2 justify-end w-full col-span-2">
                                  <Button
                                    onClick={() => openDrawer(msg?.orders?.id)}
                                    variant="filled"
                                    className="rounded-full"
                                    color="orange"
                                    size="sm">
                                    View Order
                                  </Button>
                                  <span className="p-[2px] w-16 bg-gray-400"></span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </>
      )}

      <ViewOrder
        open={openView}
        closeDrawer={closeDrawer}
        orderTable={orderTable}
        selectedOrderId={selectedOrderId}
      />
    </div>
  );
};

export default ActivityTableView;
