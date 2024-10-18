import React, {useEffect, useState} from "react";
import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  Button,
  Chip,
  Menu,
  MenuHandler,
  MenuItem,
  MenuList,
  Typography,
} from "@material-tailwind/react";
import {ChevronDownIcon, Heart, MessageSquareText, UserRound} from "lucide-react";
import Datepicker from "react-tailwindcss-datepicker";
import {getMessageApis} from "@/apis/messages-api";
import supabase from "@/configs/supabase";
import {getOrderTableApis} from "@/apis/activity-table-api";
import ViewOrder from "../table-activity-modal/view-order";
import moment from "moment-timezone";
import {endSession} from "@/apis/tables-apis";

const ActivityTableView = ({tableId, tableNo, isBooked, selectedTable}) => {
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
  const [elapsedTime, setElapsedTime] = useState(null);

  const [open, setOpen] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(false);

  const [openView, setOpenView] = useState(false);
  const openDrawer = (orderId) => {
    setSelectedOrderId(orderId);
    setOpenView(true);
  };
  const closeDrawer = () => {
    setOpenView(false);
    setSelectedOrderId(null);
  };

  const handleOpen = (index) => {
    setOpen(open === index ? null : index);
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

    const getOrdinalSuffix = (day) => {
      if (day > 3 && day < 21) return "th";
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

    return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
  };

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
      console.error("Failed to fetch messages:", error);
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
        const groupedOrders = orderResult.data.map((group) => ({
          orderDate: group.order_date,
          orderCount: group.order_count,
          orders: group.orders.map((order) => ({
            ...order.order,
            user: order.user,
            timeAgo: timeAgo(order.created_at),
          })),
        }));

        setOrderTable(groupedOrders);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
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
    fetchMessageData();
    filterOrderData();
    const restaurantId = localStorage.getItem("restaurants_id");

    const messageNewSubscription = supabase
      .channel("currentMessage")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        async (payload) => {
          fetchMessageData();
          filterOrderData();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageNewSubscription);
    };
  }, [selectedOption, messageData.length, tableId]);

  useEffect(() => {
    filterMessageData();
  }, [selectedOption, messageData.length, tableId]);

  const filteredMessageData = filterMessageData();
  const sortedMessageData = [...filteredMessageData].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at),
  );

  const activeUser =
    sortedMessageData.length > 0 ? sortedMessageData[0].user_id?.id : null;

  useEffect(() => {
    fetchOrderData();
  }, [tableId]);

  useEffect(() => {
    const filteredOrders = filterOrderData();
    setFilteredOrders(filteredOrders);
  }, [orderTable, selectedOption, value, messageData]);

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

  useEffect(() => {
    if (!selectedTable?.user_id) return;

    const targetTime = new Date(selectedTable?.user_id?.created_at).getTime();
    const calculateElapsedTime = () => {
      const now = new Date().getTime();
      const timePassed = now - targetTime;

      if (timePassed < 0) {
        setElapsedTime("00:00:00");
      } else {
        const hours = Math.floor(timePassed / (1000 * 60 * 60));
        const minutes = Math.floor((timePassed % (1000 * 60 * 60)) / (1000 * 60));
        setElapsedTime(
          `${hours < 10 ? "0" : ""}${hours}:${minutes < 10 ? "0" : ""}${minutes}`,
        );
      }
    };

    const intervalId = setInterval(calculateElapsedTime, 60000);

    calculateElapsedTime();

    return () => clearInterval(intervalId);
  }, [selectedTable?.user_id]);

  const handleCloseSession = async () => {
    setSessionLoading(true);
    try {
      await endSession(selectedTable?.id, selectedTable?.order_id?.id);
    } catch (error) {
      throw error;
    } finally {
      setSessionLoading(false);
    }
  };

  return (
    <div className="relative w-full h-auto">
      <div className="w-full grid grid-cols-8 ">
        <div className="bg-orange-400 pt-3 pb-2 flex justify-center items-center flex-col">
          <h2 className="uppercase text-xs leading-none font-bold text-white">Table</h2>
          <Typography variant="h3" color="white" className="leading-none">
            {tableNo ? tableNo.toString().padStart(2, "0") : "No Table Selected"}
          </Typography>
        </div>
        <div className="col-span-5 flex justify-center items-center bg-gray-100">
          <Typography variant="h5" color="blue-gray">
            {selectedOption}
          </Typography>
        </div>
        <div className="bg-orange-400 col-span-2 flex justify-center items-center">
          <Menu>
            <MenuHandler>
              <Button
                fullWidth
                color="white"
                variant="text"
                className="flex gap-2 items-center h-full justify-center text-md">
                {selectedOption || "LIVE"}
                <ChevronDownIcon size={26} />
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
          {selectedOption === "DATE RANGE" && (
            <div className="border-2 border-gray-400 mx-5 mt-5 rounded-md">
              <Datepicker
                value={value}
                onChange={(newValue) => setValue(newValue)}
                showShortcuts
              />
            </div>
          )}

          <div className="pb-5 grid grid-cols-1 pt-5">
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
              filteredOrders.map((group, index) => {
                console.log("filteredOrders", group);
                return (
                  <Accordion
                    key={index}
                    icon={<Icon id={index} open={open} />}
                    open={open === index}>
                    <AccordionHeader
                      className="bg-gray-200 px-5"
                      onClick={() => handleOpen(index)}>
                      {formatOrderDate(group.orderDate)}
                    </AccordionHeader>

                    <AccordionBody className="gap-4 flex flex-col">
                      {group.orders
                        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                        .map((order, orderIndex) => {
                          console.log("order", order);
                          return (
                            <>
                              <div key={orderIndex}>
                                <div className="flex gap-3 w-full items-center pr-5">
                                  <div className="flex items-center">
                                    <div className="border border-gray-400 border-dashed w-6 mr-1" />
                                    <div className="p-2 bg-green-500 rounded-full">
                                      <Heart size={18} className="text-white" />
                                    </div>
                                  </div>

                                  <div className="w-full bg-gray-100 flex gap-2 rounded-xl p-3">
                                    <div className="col-span-2 w-full items-center text-start justify-center">
                                      <div className="flex items-center">
                                        <Typography
                                          variant="h6"
                                          color="blue-gray"
                                          className="mt-0.5">
                                          {order?.user?.name || "Anonymous"}{" "}
                                          <span className="opacity-70 text-sm pl-2">
                                            {moment(order?.created_at)
                                              .tz("Asia/Kolkata")
                                              .format("DD MMM YYYY")}{" "}
                                            at{" "}
                                            {moment(order?.created_at)
                                              .tz("Asia/Kolkata")
                                              .format("hh:mm a")}
                                          </span>
                                        </Typography>
                                      </div>
                                    </div>

                                    <div className="flex items-center">
                                      <Chip
                                        size="lg"
                                        variant="ghost"
                                        className="w-24 flex justify-center"
                                        color={
                                          order?.is_delivered
                                            ? "green"
                                            : order?.is_cancelled
                                            ? "red"
                                            : order?.is_abandoned
                                            ? "brown"
                                            : "gray"
                                        }
                                        value={
                                          order?.is_delivered
                                            ? "Delivered"
                                            : order?.is_cancelled
                                            ? "Cancelled"
                                            : order?.is_abandoned
                                            ? "Abandoned"
                                            : "Pending"
                                        }
                                      />
                                    </div>

                                    <div className="flex items-center">
                                      <Chip
                                        onClick={() => openDrawer(order?.id)}
                                        size="lg"
                                        variant="ghost"
                                        value="View Orders"
                                        className="cursor-pointer"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </>
                          );
                        })}
                    </AccordionBody>
                  </Accordion>
                );
              })
            )}
          </div>
        </>
      ) : (
        <>
          <div className="h-[90vh] pb-5 overflow-y-auto w-full">
            {selectedTable?.is_booked && (
              <div className="pt-3 pb-3 grid grid-cols-5 gap-5 bg-gray-50 w-full px-5 border-y">
                <div className="flex items-center gap-3 col-span-2">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <UserRound size={24} className="text-white" />
                  </div>
                  <div>
                    <Typography variant="h6" color="blue-gray" className="leading-none">
                      {selectedTable?.user_id?.name || "Anonymous"}
                    </Typography>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-medium opacity-80 ">
                      {(selectedTable?.user_id?.mobile || "000000000").replace(
                        /\d(?=\d{4})/g,
                        "*",
                      ) || "N/A"}
                    </Typography>
                  </div>
                </div>
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-medium opacity-80">
                    Order Status
                  </Typography>
                  <Typography variant="h6" color="blue-gray" className="leading-none">
                    {selectedTable?.order_id
                      ? selectedTable?.order_id?.status_id?.title
                      : selectedTable?.is_booked
                      ? "Booked"
                      : "Vacant"}
                  </Typography>
                </div>
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-medium opacity-80">
                    Time Spent
                  </Typography>
                  <Typography variant="h6" color="blue-gray" className="leading-none">
                    {elapsedTime || "Calculating..."}
                  </Typography>
                </div>
                <div className="w-full h-full flex justify-center items-center">
                  <Button
                    className="whitespace-nowrap"
                    loading={sessionLoading}
                    onClick={handleCloseSession}
                    color="red">
                    End Session
                  </Button>
                </div>
              </div>
            )}
            <ul className="flex flex-col w-full gap-1 pt-5">
              {!isBooked ? (
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
                sortedMessageData
                  .filter((msg) => msg?.user_id?.id === activeUser)
                  .map((msg, index) => {
                    const isBillRequested = msg.message
                      ?.toLowerCase()
                      .includes("prepare the bill");
                    const isOrderPlaced = msg.message
                      ?.toLowerCase()
                      .includes("order has been placed");

                    return (
                      <li key={index}>
                        <div className="flex gap-3 w-full items-center py-2 border-b border-dotted border-gray-300">
                          <div className="flex items-center">
                            <div className="border border-gray-400 border-dashed w-6 " />
                            <div className="p-2 bg-green-500 rounded-full">
                              <MessageSquareText size={18} className="text-white" />
                            </div>
                          </div>
                          <div className="w-full flex ">
                            <div className="flex flex-col justify-center flex-grow">
                              <Typography color="black" variant="h6">
                                {msg.message}
                              </Typography>
                              <Typography variant="small">
                                {timeAgo(msg.created_at)} ago
                              </Typography>
                            </div>

                            <div className="flex gap-2 justify-end">
                              {isOrderPlaced && (
                                <div className="flex items-center justify-end w-full col-span-2">
                                  <Button
                                    onClick={() =>
                                      openDrawer(selectedTable?.order_id?.id)
                                    }
                                    variant="filled"
                                    className="rounded-full"
                                    color="orange"
                                    size="sm">
                                    View Order
                                  </Button>
                                  <div className="border border-gray-400 border-dashed w-6 " />
                                </div>
                              )}
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
