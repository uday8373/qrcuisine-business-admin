import {
  getAllOrders,
  getCancelledReason,
  getOrdersCounts,
  getStatuses,
  getWaiters,
  updateCancelStatusOrder,
  updateOrder,
  updateStatusOrder,
  updateWaiterOrder,
} from "@/apis/order-apis";
import {CancelOrder} from "@/components/order-modal/cancel-order";
import {ViewOrderDrawer} from "@/components/order-modal/view-order";
import supabase from "@/configs/supabase";
import {MagnifyingGlassIcon, ChevronUpDownIcon} from "@heroicons/react/24/outline";
import {EyeIcon, StopIcon} from "@heroicons/react/24/solid";
import {
  Card,
  CardHeader,
  Input,
  Typography,
  Button,
  CardBody,
  Chip,
  CardFooter,
  Tabs,
  TabsHeader,
  Tab,
  IconButton,
  Tooltip,
  MenuHandler,
  MenuItem,
  MenuList,
  Menu,
  Spinner,
} from "@material-tailwind/react";
import {ChevronDownIcon} from "lucide-react";
import moment from "moment";
import React, {useEffect, useState} from "react";

const TABLE_HEAD = [
  "Table No",
  "Order ID",
  "Created",
  "Food Items",
  "Total Amount",
  "Waiter",
  "Preparation Time",
  "Status",
  "Action",
];

const STATUS = [
  {color: "bg-blue-500", label: "Sent"},
  {color: "bg-green-500", label: "Confirmed"},
  {color: "bg-orange-500", label: "Preparing"},
  {color: "bg-gray-700", label: "Delivered"},
  {color: "bg-red-500", label: "Cancelled"},
  {color: "bg-brown-500", label: "Abandoned"},
];

export function Orders() {
  const [orderData, setOrderData] = useState([]);
  const [waitersData, setWaitersData] = useState([]);
  const [statusesData, setStatusesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maxItems, setMaxItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [maxRow, setMaxRow] = useState(10);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [cancelledReasonsData, setCancelledReasonsData] = useState([]);
  const [selectedReason, setSelectedReason] = useState(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [updatedData, setUpdatedData] = useState({});
  const [tabs, setTabs] = useState([
    {
      label: "All",
      value: "all",
      count: 0,
    },
    {
      label: "Active",
      value: "active",
      count: 0,
    },
    {
      label: "Delivered",
      value: "delivered",
      count: 0,
    },
    {
      label: "Cancelled",
      value: "cancelled",
      count: 0,
    },
    {
      label: "Abandoned",
      value: "abandoned",
      count: 0,
    },
  ]);

  const openDrawer = () => setOpen(true);
  const closeDrawer = () => setOpen(false);

  const fetchOrderData = async () => {
    const orderResult = await getAllOrders(currentPage, maxRow, activeTab, searchQuery);
    if (orderResult) {
      setOrderData(orderResult.data);
      setMaxItems(orderResult.count);
    }
    setLoading(false);
  };

  const fetchWaitersData = async () => {
    const waiterResult = await getWaiters();
    if (waiterResult) {
      setWaitersData(waiterResult);
    }
  };

  const fetchStatusesData = async () => {
    const statusResult = await getStatuses();
    if (statusResult) {
      setStatusesData(statusResult);
    }
  };

  const fetchOrdersCount = async () => {
    const result = await getOrdersCounts();
    if (result) {
      setTabs([
        {label: "All", value: "all", count: result.total},
        {label: "Active", value: "active", count: result.active},
        {label: "Delivered", value: "delivered", count: result.available},
        {label: "Cancelled", value: "cancelled", count: result.cancelled},
        {label: "Abandoned", value: "abandoned", count: result.abandoned},
      ]);
    }
  };

  const fetchCancelledReason = async () => {
    const result = await getCancelledReason();
    if (result) {
      setCancelledReasonsData(result);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const restaurantId = localStorage.getItem("restaurants_id");

        // Use Promise.all to make parallel requests
        await Promise.all([
          fetchOrdersCount(),
          fetchOrderData(),
          fetchWaitersData(),
          fetchStatusesData(),
          fetchCancelledReason(),
        ]);

        // Setup Supabase subscription for real-time updates
        const orderSubscription = supabase
          .channel("orders")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "orders",
              filter: `restaurant_id=eq.${restaurantId}`,
            },
            async (payload) => {
              await Promise.all([fetchOrderData(), fetchOrdersCount()]);
            },
          )
          .subscribe();

        // Cleanup subscription on component unmount
        return () => {
          supabase.removeChannel(orderSubscription);
        };
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [maxRow, currentPage, activeTab, searchQuery]);

  const totalPages = Math.ceil(maxItems / maxRow);

  const handlePageChange = (page) => {
    setLoading(true);
    setCurrentPage(page);
  };

  const handleTabChange = (value) => {
    setLoading(true);
    setActiveTab(value);
    setCurrentPage(1);
  };

  const handleUpdateOrder = async (orderId, updates) => {
    try {
      await updateOrder({
        id: orderId,
        ...updates,
      });
    } catch (error) {
      console.error("Failed to update order:", error);
    }
  };

  const handleUpdateWaiterOrder = async (orderId, updates) => {
    try {
      await updateWaiterOrder({
        id: orderId,
        ...updates,
      });
    } catch (error) {
      console.error("Failed to update order:", error);
    }
  };

  const handleStatusUpdateOrder = async (orderId, updates) => {
    try {
      await updateStatusOrder({
        id: orderId,
        ...updates,
      });
    } catch (error) {
      console.error("Failed to update order:", error);
    }
  };

  const handleWaiterChange = (orderId, waiter_id, table_id, user_id, waiter_name) => {
    handleUpdateWaiterOrder(orderId, {
      waiter_id: waiter_id,
      table_id: table_id,
      user_id: user_id,
      name: waiter_name,
    });
  };

  const handlePreparationTimeChange = (orderId, newTime, oldTime) => {
    const mainTime = parseInt(newTime + oldTime);
    handleUpdateOrder(orderId, {preparation_time: mainTime});
  };

  const handleStatusChange = (orderId, statusId, sorting, table_id, user_id) => {
    handleStatusUpdateOrder(orderId, {
      status_id: statusId,
      sorting: sorting,
      table_id: table_id,
      user_id: user_id,
    });
  };

  const handleCancelStatusChange = ({orderId, statusId, sorting, table_id, user_id}) => {
    setUpdatedData({
      id: orderId,
      status_id: statusId,
      sorting: sorting,
      table_id: table_id,
      user_id: user_id,
    });
    toggleCancelModal();
  };

  const handleCancelSubmit = async () => {
    try {
      await updateCancelStatusOrder({selectedReason, value: updatedData});
    } catch (error) {
      console.error("Failed to update order:", error);
    } finally {
      toggleCancelModal();
    }
  };

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const toggleCancelModal = () => {
    setCancelOpen(!cancelOpen);
  };

  const handleSelectOrder = (value) => {
    setSelectedData({
      id: value.id,
      created_at: value.created_at,
      order_id: value.order_id,
      status_id: value.status_id,
      is_delivered: value.is_delivered,
      user_id: value.user_id,
      fooditem_ids: value.fooditem_ids,
      instructions: value.instructions,
      preparation_time: value.preparation_time,
      waiter_id: value.waiter_id,
      tax_amount: value.tax_amount,
      total_amount: value.total_amount,
      grand_amount: value.grand_amount,
      cancelled_reason: value.cancelled_reason,
    });
    toggleDrawer();
  };

  const updateRemainingTime = (created_at, preparation_time) => {
    const targetTime = new Date(created_at).getTime() + preparation_time * 60000;
    const now = new Date().getTime();
    const timeLeft = targetTime - now;

    if (timeLeft <= 0) {
      return "00:00";
    } else {
      const minutes = Math.floor(timeLeft / 60000);
      const seconds = Math.floor((timeLeft % 60000) / 1000);
      const timeResult = `${minutes < 10 ? "0" : ""}${minutes}:${
        seconds < 10 ? "0" : ""
      }${seconds}`;

      return timeResult;
    }
  };
  return (
    <React.StrictMode>
      <div className="mt-6 mb-8 flex flex-col gap-12 min-h-screen">
        <Card className="h-full w-full">
          <CardHeader floated={false} shadow={false} className="rounded-none">
            <div className="mb-8 flex items-center justify-between gap-8">
              <div>
                <Typography variant="h5" color="blue-gray">
                  Orders list
                </Typography>
                <Typography color="gray" className="mt-1 font-normal">
                  See information about all orders
                </Typography>
              </div>
            </div>
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <Tabs value="all" className="w-full md:w-max">
                <TabsHeader>
                  {tabs.map(({label, value, count}) => (
                    <Tab
                      className="flex whitespace-nowrap"
                      key={value}
                      value={value}
                      onClick={() => handleTabChange(value)}>
                      <div className="flex items-center gap-2">
                        {label}
                        <Chip variant="ghost" value={count} size="sm" />
                      </div>
                    </Tab>
                  ))}
                </TabsHeader>
              </Tabs>
              <div className="w-full md:w-72">
                <Input
                  label="Search by order Id"
                  icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setLoading(true);
                      setCurrentPage(1);
                    }
                  }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-5 flex gap-4">
              {STATUS.map((status, index) => (
                <div key={index} className="flex gap-2 items-center text-sm">
                  <div className={`w-4 h-4 ${status?.color} rounded-md bg-opacity-80`} />
                  {status?.label}
                </div>
              ))}
            </div>
          </CardHeader>
          <CardBody className="overflow-scroll px-0">
            {loading ? (
              <div className="flex w-full h-[350px] justify-center items-center">
                <Spinner className="h-8 w-8" />
              </div>
            ) : (
              <table className="mt-4 w-full min-w-max table-auto text-left">
                <thead>
                  <tr>
                    {TABLE_HEAD.map((head, index) => (
                      <th
                        key={head}
                        className=" border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 transition-colors">
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="flex items-center justify-between gap-2 font-normal leading-none opacity-70">
                          {head}{" "}
                          {/* {index !== TABLE_HEAD.length - 1 && (
                          <ChevronUpDownIcon strokeWidth={2} className="h-4 w-4" />
                        )} */}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody
                  className={`${orderData.length === 0 && "h-[350px]"} relative w-full}`}>
                  {orderData.length === 0 ? (
                    <div className="w-full absolute flex justify-center items-center h-full">
                      <Typography variant="h6" color="blue-gray" className="font-normal">
                        No Order Found
                      </Typography>
                    </div>
                  ) : (
                    orderData.map(
                      (
                        {
                          id,
                          created_at,
                          table_id,
                          fooditem_ids,
                          user_id,
                          grand_amount,
                          waiter_id,
                          instructions,
                          preparation_time,
                          status_id,
                          order_id,
                          is_delivered,
                          tax_amount,
                          total_amount,
                          cancelled_reason,
                        },
                        index,
                      ) => {
                        const isLast = index === orderData.length - 1;
                        const classes = isLast
                          ? "p-4"
                          : "p-4 border-b border-blue-gray-50";

                        return (
                          <tr key={index} className="h-28">
                            <td
                              className={`${classes} bg-orange-400 relative w-28 border-r`}>
                              <div className="flex items-center gap-3 justify-end">
                                <div className="flex flex-col items-center relative w-full justify-center">
                                  <Typography
                                    variant="small"
                                    color="white"
                                    className="font-semibold uppercase text-xs">
                                    Table No
                                  </Typography>
                                  <Typography
                                    variant="h2"
                                    color="white"
                                    className="font-black text-[42px] tracking-wide">
                                    {table_id.table_no.toString().padStart(2, "0")}
                                  </Typography>
                                </div>
                              </div>
                            </td>
                            <td
                              className={`${classes} relative bg-gradient-to-r ${
                                status_id?.sorting === 1
                                  ? "from-blue-500/20 to-white"
                                  : status_id?.sorting === 2
                                  ? "from-green-500/20 to-white"
                                  : status_id?.sorting === 3
                                  ? "from-orange-500/20 to-white"
                                  : status_id?.sorting === 4
                                  ? "from-gray-500/20 to-white"
                                  : status_id?.sorting === 5
                                  ? "from-red-500/20 to-white"
                                  : status_id?.sorting === 6
                                  ? "from-brown-500/20 to-white"
                                  : "bg-gray-500"
                              }`}>
                              <div
                                className={`w-2 h-full top-0 absolute left-0 bg-opacity-80  ${
                                  status_id?.sorting === 1
                                    ? "bg-blue-500"
                                    : status_id?.sorting === 2
                                    ? "bg-green-500"
                                    : status_id?.sorting === 3
                                    ? "bg-orange-500"
                                    : status_id?.sorting === 4
                                    ? "bg-gray-500"
                                    : status_id?.sorting === 5
                                    ? "bg-red-500"
                                    : status_id?.sorting === 6
                                    ? "bg-brown-500"
                                    : "bg-gray-500"
                                }`}
                              />
                              <div className="flex items-center gap-3 pl-2 relative">
                                {status_id.sorting < 4 && (
                                  <div className="absolute -top-1 -right-1 z-20">
                                    <span className="relative flex h-3 w-3">
                                      <span
                                        className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                                          status_id?.sorting === 1
                                            ? "bg-blue-400"
                                            : status_id?.sorting === 2
                                            ? "bg-green-400"
                                            : status_id?.sorting === 3
                                            ? "bg-orange-400"
                                            : status_id?.sorting === 4
                                            ? "bg-gray-400"
                                            : status_id?.sorting === 5
                                            ? "bg-red-400"
                                            : status_id?.sorting === 6
                                            ? "bg-brown-400"
                                            : "bg-gray-400"
                                        }`}></span>
                                      <span
                                        className={`relative inline-flex rounded-full h-3 w-3 ${
                                          status_id?.sorting === 1
                                            ? "bg-blue-500"
                                            : status_id?.sorting === 2
                                            ? "bg-green-500"
                                            : status_id?.sorting === 3
                                            ? "bg-orange-500"
                                            : status_id?.sorting === 4
                                            ? "bg-gray-500"
                                            : status_id?.sorting === 5
                                            ? "bg-red-500"
                                            : status_id?.sorting === 6
                                            ? "bg-brown-500"
                                            : "bg-gray-500"
                                        }`}></span>
                                    </span>
                                  </div>
                                )}
                                <Chip
                                  value={order_id}
                                  size="lg"
                                  variant="ghost"
                                  color={
                                    status_id?.sorting === 1
                                      ? "blue"
                                      : status_id?.sorting === 2
                                      ? "green"
                                      : status_id?.sorting === 3
                                      ? "orange"
                                      : status_id?.sorting === 4
                                      ? "gray"
                                      : status_id?.sorting === 5
                                      ? "red"
                                      : status_id?.sorting === 6
                                      ? "brown"
                                      : "gray"
                                  }
                                />
                              </div>
                            </td>
                            <td className={`${classes} relative`}>
                              <div className="flex flex-col">
                                <Typography
                                  variant="small"
                                  color="blue-gray"
                                  className="font-normal">
                                  {moment(created_at).format("DD MMM YYYY")}
                                </Typography>
                                <Typography
                                  variant="paragraph"
                                  color="blue-gray"
                                  className="font-normal">
                                  {moment(created_at).format("hh:mm a")}
                                </Typography>
                              </div>
                            </td>

                            <td className={classes}>
                              <div className="flex flex-col gap-1">
                                {fooditem_ids.slice(0, 2).map((food, index) => (
                                  <div key={index} className="flex items-center gap-2">
                                    <StopIcon className="h-3 w-3 text-gray-500 mb-0.5" />
                                    <Typography
                                      variant="small"
                                      color="blue-gray"
                                      className="font-normal opacity-70">
                                      {food.food_name}
                                    </Typography>
                                    <Typography
                                      variant="small"
                                      color="blue-gray"
                                      className="font-normal opacity-70">
                                      ({food.quantity})
                                    </Typography>
                                  </div>
                                ))}
                              </div>
                              <div
                                onClick={() =>
                                  handleSelectOrder({
                                    id: id,
                                    created_at: created_at,
                                    order_id: order_id,
                                    status_id: status_id,
                                    is_delivered: is_delivered,
                                    user_id: user_id,
                                    fooditem_ids: fooditem_ids,
                                    instructions: instructions,
                                    preparation_time: preparation_time,
                                    waiter_id: waiter_id,
                                    tax_amount: tax_amount,
                                    total_amount: total_amount,
                                    grand_amount: grand_amount,
                                    cancelled_reason: cancelled_reason,
                                  })
                                }
                                className="text-sm hover:animate-pulse hover:text-orange-400 transition-all duration-500 delay-75 w-fit underline mt-2 font-semibold underline-offset-2 text-orange-600 decoration-dotted cursor-pointer">
                                View Details
                              </div>
                            </td>
                            <td className={classes}>
                              <div className="flex items-center gap-3">
                                <Typography
                                  variant="small"
                                  color="blue-gray"
                                  className="font-medium">
                                  ₹ {grand_amount.toFixed(2)}
                                </Typography>
                              </div>
                            </td>
                            <td className={classes}>
                              {waiter_id?.name || status_id?.sorting > 3 ? (
                                <Chip
                                  variant="ghost"
                                  size="md"
                                  color={waiter_id?.name ? "green" : "brown"}
                                  value={
                                    waiter_id?.name ? waiter_id?.name : "Not Assigned"
                                  }
                                  className="flex justify-center"
                                />
                              ) : (
                                <Menu size="xs">
                                  <MenuHandler>
                                    <Chip
                                      icon={<ChevronDownIcon size={20} />}
                                      variant="ghost"
                                      size="md"
                                      color="gray"
                                      value="Assigned a waiter"
                                      className="flex justify-center cursor-pointer"
                                    />
                                  </MenuHandler>
                                  {status_id?.sorting < 4 && (
                                    <MenuList>
                                      {waitersData.map((waiter, index) => {
                                        const activeOrdersForWaiter = orderData.filter(
                                          (order) =>
                                            order.waiter_id?.id === waiter.id &&
                                            !order.is_delivered &&
                                            !order.is_cancelled &&
                                            !order.is_abandoned,
                                        ).length;

                                        return (
                                          <MenuItem
                                            className="flex items-center justify-between gap-3"
                                            key={index}
                                            onClick={() =>
                                              handleWaiterChange(
                                                id,
                                                waiter.id,
                                                table_id.id,
                                                user_id.id,
                                                waiter.name,
                                              )
                                            }>
                                            {waiter?.name}

                                            <Chip
                                              size="sm"
                                              variant="ghost"
                                              value={activeOrdersForWaiter}
                                            />
                                          </MenuItem>
                                        );
                                      })}
                                    </MenuList>
                                  )}
                                </Menu>
                              )}
                            </td>
                            <td className={classes}>
                              <Menu size="xs">
                                <MenuHandler>
                                  <Chip
                                    icon={
                                      status_id?.sorting < 4 && (
                                        <ChevronDownIcon size={20} />
                                      )
                                    }
                                    variant="ghost"
                                    size="md"
                                    color="blue"
                                    value={`${updateRemainingTime(
                                      created_at,
                                      preparation_time,
                                    )}`}
                                    className="flex justify-center cursor-pointer "
                                  />
                                </MenuHandler>
                                {status_id?.sorting < 4 && (
                                  <MenuList>
                                    {[10, 20, 30].map((time, index) => (
                                      <MenuItem
                                        key={`add-${index}`}
                                        onClick={() =>
                                          handlePreparationTimeChange(
                                            id,
                                            time,
                                            preparation_time,
                                          )
                                        }>
                                        Add {time} minutes
                                      </MenuItem>
                                    ))}
                                    <hr className="my-1" />
                                    {[10, 20, 30].map((time, index) => (
                                      <MenuItem
                                        key={`minus-${index}`}
                                        onClick={() =>
                                          handlePreparationTimeChange(
                                            id,
                                            -time,
                                            preparation_time,
                                          )
                                        }>
                                        Reduce {time} minutes
                                      </MenuItem>
                                    ))}
                                  </MenuList>
                                )}
                              </Menu>
                            </td>
                            <td className={classes}>
                              <Menu size="xs">
                                <MenuHandler>
                                  <Chip
                                    icon={
                                      status_id?.sorting < 4 && (
                                        <ChevronDownIcon size={20} />
                                      )
                                    }
                                    variant="ghost"
                                    size="md"
                                    color={
                                      status_id?.sorting === 1
                                        ? "blue"
                                        : status_id?.sorting === 2
                                        ? "green"
                                        : status_id?.sorting === 3
                                        ? "orange"
                                        : status_id?.sorting === 4
                                        ? "gray"
                                        : status_id?.sorting === 5
                                        ? "red"
                                        : status_id?.sorting === 6
                                        ? "brown"
                                        : "gray"
                                    }
                                    value={status_id?.title}
                                    className="flex justify-center cursor-pointer"
                                  />
                                </MenuHandler>
                                {status_id.sorting < 4 && (
                                  <MenuList>
                                    {statusesData &&
                                      statusesData
                                        .filter((status) => {
                                          if (status.sorting === 5) {
                                            return status_id.sorting < 4;
                                          }
                                          return (
                                            (status_id.sorting === 1 &&
                                              status.sorting === 2) ||
                                            (status_id.sorting === 2 &&
                                              status.sorting === 3) ||
                                            (status_id.sorting === 3 &&
                                              status.sorting === 4)
                                          );
                                        })
                                        .map((status, index) => (
                                          <MenuItem
                                            key={index}
                                            onClick={() => {
                                              if (status.sorting === 5) {
                                                handleCancelStatusChange({
                                                  orderId: id,
                                                  statusId: status.id,
                                                  sorting: status_id.sorting,
                                                  table_id: table_id.id,
                                                  user_id: user_id.id,
                                                });
                                              } else {
                                                handleStatusChange(
                                                  id,
                                                  status.id,
                                                  status_id.sorting,
                                                  table_id.id,
                                                  user_id.id,
                                                );
                                              }
                                            }}>
                                            {status.title}
                                          </MenuItem>
                                        ))}
                                  </MenuList>
                                )}
                              </Menu>
                            </td>

                            <td className={`${classes}`}>
                              <Tooltip content="View Order">
                                <IconButton
                                  onClick={() =>
                                    handleSelectOrder({
                                      id: id,
                                      created_at: created_at,
                                      order_id: order_id,
                                      status_id: status_id,
                                      is_delivered: is_delivered,
                                      user_id: user_id,
                                      fooditem_ids: fooditem_ids,
                                      instructions: instructions,
                                      preparation_time: preparation_time,
                                      waiter_id: waiter_id,
                                      tax_amount: tax_amount,
                                      total_amount: total_amount,
                                      grand_amount: grand_amount,
                                      cancelled_reason: cancelled_reason,
                                    })
                                  }
                                  variant="text">
                                  <EyeIcon className="h-4 w-4" />
                                </IconButton>
                              </Tooltip>
                            </td>
                          </tr>
                        );
                      },
                    )
                  )}
                </tbody>
              </table>
            )}
          </CardBody>
          <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
            <Typography variant="small" color="blue-gray" className="font-normal">
              Page {currentPage} of {totalPages}
            </Typography>
            <div className="flex items-center gap-2 mt-4">
              {(() => {
                const pages = [];
                if (totalPages <= 5) {
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                  }
                } else {
                  if (currentPage <= 3) {
                    pages.push(1, 2, 3, 4, "...");
                  } else if (currentPage >= totalPages - 2) {
                    pages.push(
                      "...",
                      totalPages - 3,
                      totalPages - 2,
                      totalPages - 1,
                      totalPages,
                    );
                  } else {
                    pages.push(
                      "...",
                      currentPage - 1,
                      currentPage,
                      currentPage + 1,
                      "...",
                    );
                  }
                }

                return pages.map((page, index) => (
                  <React.Fragment key={index}>
                    {page === "..." ? (
                      <span className="text-blue-gray-500">...</span>
                    ) : (
                      <IconButton
                        variant={page === currentPage ? "filled" : "text"}
                        disabled={page === currentPage}
                        size="sm"
                        onClick={() => handlePageChange(page)}>
                        {page}
                      </IconButton>
                    )}
                  </React.Fragment>
                ));
              })()}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outlined"
                size="sm"
                className="w-24"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}>
                Previous
              </Button>
              <Button
                variant="outlined"
                size="sm"
                className="w-24"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}>
                Next
              </Button>
            </div>
          </CardFooter>
        </Card>
        <ViewOrderDrawer
          open={open}
          openDrawer={openDrawer}
          closeDrawer={closeDrawer}
          selectedData={selectedData}
          toggleDrawer={toggleDrawer}
        />
        <CancelOrder
          open={cancelOpen}
          handleOpen={toggleCancelModal}
          reasonData={cancelledReasonsData}
          setSelectedReason={setSelectedReason}
          selectedReason={selectedReason}
          handleSubmit={handleCancelSubmit}
        />
      </div>
    </React.StrictMode>
  );
}
