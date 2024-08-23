import {getAllOrders, getStatuses, getWaiters, updateOrder} from "@/apis/order-apis";
import {ViewOrderDrawer} from "@/components/order-modal/view-order";
import {MagnifyingGlassIcon, ChevronUpDownIcon} from "@heroicons/react/24/outline";
import {EyeIcon} from "@heroicons/react/24/solid";
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
} from "@material-tailwind/react";
import {ChevronDownIcon} from "lucide-react";
import React, {useEffect, useState} from "react";

const TABS = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "Delivered",
    value: "true",
  },
  {
    label: "Undelivered",
    value: "undelivered",
  },
];

const TABLE_HEAD = [
  "Order ID",
  "Created",
  "Table No",
  "Food Items",
  "Total Amount",
  "Waiter",
  "Preparation Time",
  "Status",
  "Action",
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

  useEffect(() => {
    fetchOrderData();
    fetchWaitersData();
    fetchStatusesData();
  }, [maxRow, currentPage, loading, activeTab, searchQuery]);

  const totalPages = Math.ceil(maxItems / maxRow);

  const handlePageChange = (page) => {
    setLoading(true);
    setCurrentPage(page);
  };

  const handleTabChange = (value) => {
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
    } finally {
      fetchOrderData();
    }
  };

  const handleWaiterChange = (orderId, waiterId) => {
    handleUpdateOrder(orderId, {waiter_id: waiterId});
  };

  const handlePreparationTimeChange = (orderId, newTime, oldTime) => {
    const mainTime = parseInt(newTime + oldTime);
    handleUpdateOrder(orderId, {preparation_time: mainTime});
  };

  const handleStatusChange = (orderId, statusId, sorting) => {
    handleUpdateOrder(orderId, {status_id: statusId, sorting: sorting});
  };

  const toggleDrawer = () => {
    setOpen(!open);
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
    });
    toggleDrawer();
  };

  return (
    <div className="mt-8 mb-8 flex flex-col gap-12">
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
                {TABS.map(({label, value}) => (
                  <Tab key={value} value={value} onClick={() => handleTabChange(value)}>
                    &nbsp;&nbsp;{label}&nbsp;&nbsp;
                  </Tab>
                ))}
              </TabsHeader>
            </Tabs>
            <div className="w-full md:w-72">
              <Input
                label="Search"
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
        </CardHeader>
        <CardBody className="overflow-scroll px-0">
          <table className="mt-4 w-full min-w-max table-auto text-left">
            <thead>
              <tr>
                {TABLE_HEAD.map((head, index) => (
                  <th
                    key={head}
                    className="cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 transition-colors hover:bg-blue-gray-50">
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="flex items-center justify-between gap-2 font-normal leading-none opacity-70">
                      {head}{" "}
                      {index !== TABLE_HEAD.length - 1 && (
                        <ChevronUpDownIcon strokeWidth={2} className="h-4 w-4" />
                      )}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orderData.map(
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
                  },
                  index,
                ) => {
                  const isLast = index === orderData.length - 1;
                  const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

                  return (
                    <tr key={index}>
                      <td className={classes}>
                        <div className="flex items-center gap-3">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal opacity-70">
                            {order_id}
                          </Typography>
                        </div>
                      </td>
                      <td className={classes}>
                        <div className="flex flex-col">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal">
                            {new Date(created_at)
                              .toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                              .replace(/-/g, " ")}
                          </Typography>
                        </div>
                      </td>
                      <td className={classes}>
                        <div className="flex items-center gap-3">
                          <Chip color="orange" value={table_id.table_no} />
                        </div>
                      </td>

                      <td className={`${classes} flex flex-col gap-1`}>
                        {fooditem_ids.slice(0, 3).map((food, index) => (
                          <div key={index} className="flex items-center gap-2">
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
                        {fooditem_ids.length > 3 && (
                          <h2
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
                              })
                            }
                            className="text-md underline underline-offset-2 text-orange-600 decoration-dotted cursor-pointer">
                            see all
                          </h2>
                        )}
                      </td>
                      <td className={classes}>
                        <div className="flex items-center gap-3">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal opacity-70">
                            ₹ {grand_amount.toFixed(2)}
                          </Typography>
                        </div>
                      </td>
                      <td className={classes}>
                        {waiter_id?.name ? (
                          <Chip
                            variant="ghost"
                            size="md"
                            color="green"
                            value={waiter_id?.name}
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
                            <MenuList>
                              {waitersData.map((waiter, index) => (
                                <MenuItem
                                  key={index}
                                  onClick={() => handleWaiterChange(id, waiter.id)}>
                                  {waiter?.name}
                                </MenuItem>
                              ))}
                            </MenuList>
                          </Menu>
                        )}
                      </td>
                      <td className={classes}>
                        <Menu size="xs">
                          <MenuHandler>
                            <Chip
                              icon={<ChevronDownIcon size={20} />}
                              variant="ghost"
                              size="md"
                              color="blue"
                              value={`${preparation_time} Minutes`}
                              className="flex justify-center cursor-pointer "
                            />
                          </MenuHandler>

                          <MenuList>
                            {[10, 20, 30, 40].map((time, index) => (
                              <MenuItem
                                key={index}
                                onClick={() =>
                                  handlePreparationTimeChange(id, time, preparation_time)
                                }>
                                Add {time} minutes
                              </MenuItem>
                            ))}
                          </MenuList>
                        </Menu>
                      </td>
                      <td className={classes}>
                        <Menu size="xs">
                          <MenuHandler>
                            <Chip
                              icon={
                                status_id?.sorting !== 4 && <ChevronDownIcon size={20} />
                              }
                              variant="ghost"
                              size="md"
                              color={
                                status_id?.sorting === 1
                                  ? "blue"
                                  : status_id?.sorting === 2
                                  ? "cyan"
                                  : status_id?.sorting === 3
                                  ? "orange"
                                  : "green"
                              }
                              value={status_id?.title}
                              className="flex justify-center cursor-pointer"
                            />
                          </MenuHandler>
                          {status_id.sorting !== 4 && (
                            <MenuList>
                              {statusesData &&
                                statusesData
                                  .filter(
                                    (status) =>
                                      (status_id.sorting === 1 && status.sorting === 2) ||
                                      (status_id.sorting === 2 && status.sorting === 3) ||
                                      (status_id.sorting === 3 && status.sorting === 4),
                                  )
                                  .map((status, index) => (
                                    <MenuItem
                                      key={index}
                                      onClick={() =>
                                        handleStatusChange(
                                          id,
                                          status.id,
                                          status_id.sorting,
                                        )
                                      }>
                                      {status.title}
                                    </MenuItem>
                                  ))}
                            </MenuList>
                          )}
                        </Menu>
                      </td>

                      <td className={classes}>
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
              )}
            </tbody>
          </table>
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
                  pages.push("...", currentPage - 1, currentPage, currentPage + 1, "...");
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
    </div>
  );
}
