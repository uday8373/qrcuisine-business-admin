import React from "react";
import {Drawer, Typography, Chip, Avatar, IconButton} from "@material-tailwind/react";
import moment from "moment";

export default function ViewOrder({open, closeDrawer, selectedOrderId, orderTable}) {
  const selectedOrder = orderTable
    ?.flatMap((group) => group.orders)
    .find((order) => order.id === selectedOrderId);

  console.log("object selected order", selectedOrder);

  return (
    <Drawer
      overlay={true}
      overlayProps={{
        className: "fixed inset-0 h-full",
      }}
      size={500}
      placement="right"
      open={open}
      onClose={closeDrawer}
      className="p-4 overflow-y-scroll">
      <div className="mb-6 flex items-center justify-between">
        {selectedOrder && (
          <Typography variant="h5" color="blue-gray">
            Order ID : {selectedOrder.order_id}
          </Typography>
        )}
        <IconButton variant="text" color="blue-gray" onClick={closeDrawer}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </IconButton>
      </div>

      <div className="w-full h-full">
        {selectedOrder ? (
          <div>
            <div className="flex justify-between gap-3 items-center">
              <div className="flex flex-col gap-1">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-normal opacity-70">
                  Created at
                </Typography>
                <div className="flex gap-1">
                  <Typography
                    variant="paragraph"
                    color="blue-gray"
                    className="font-normal">
                    {moment(selectedOrder?.created_at).format("DD MMM YYYY")}
                  </Typography>
                  <Typography
                    variant="paragraph"
                    color="blue-gray"
                    className="font-normal">
                    at {moment(selectedOrder?.created_at).format("hh:mm a")}
                  </Typography>
                </div>
              </div>
              {/* <div className="flex flex-col gap-1">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-normal opacity-70">
                  Order Status
                </Typography>
                <Chip
                  variant="ghost"
                  size="md"
                  color={
                    selectedOrder?.status_id?.sorting === 1
                      ? "blue"
                      : selectedOrder?.status_id?.sorting === 2
                      ? "green"
                      : selectedOrder?.status_id?.sorting === 3
                      ? "orange"
                      : selectedOrder?.status_id?.sorting === 4
                      ? "gray"
                      : selectedOrder?.status_id?.sorting === 5
                      ? "red"
                      : selectedOrder?.status_id?.sorting === 6
                      ? "brown"
                      : "gray"
                  }
                  value={selectedOrder?.status_id?.title}
                  className="flex justify-center cursor-pointer"
                />
              </div> */}
              <div className="flex flex-col gap-1">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-normal opacity-70">
                  Delivered
                </Typography>
                <Chip
                  color={selectedOrder?.is_delivered ? "green" : "gray"}
                  className="flex justify-center"
                  value={selectedOrder?.is_delivered ? "True" : "false"}
                />
              </div>
            </div>
            <hr className="my-5" />
            <div className="flex flex-col gap-1">
              <Typography
                variant="small"
                color="blue-gray"
                className="font-normal opacity-70">
                Customer
              </Typography>
              <div className="flex flex-col">
                <Typography variant="paragraph" color="blue-gray" className="font-normal">
                  {selectedOrder?.user_id?.name || "User"}
                </Typography>
                <Typography variant="paragraph" color="blue" className="font-normal">
                  +91{" "}
                  {(selectedOrder?.user_id?.mobile || "000000000").replace(
                    /\d(?=\d{4})/g,
                    "*",
                  )}
                </Typography>
              </div>
            </div>
            <hr className="my-5" />
            <div className="flex flex-col gap-3">
              <Typography
                variant="small"
                color="blue-gray"
                className="font-normal opacity-70">
                Items
              </Typography>
              <div className="flex flex-col gap-3">
                {selectedOrder?.fooditem_ids &&
                  selectedOrder?.fooditem_ids.map((food, index) => (
                    <div key={index} className="flex justify-between items-center gap-3">
                      <div className="flex gap-3 items-center">
                        <Avatar src={food?.image} variant="rounded" />
                        <div className="flex flex-col">
                          <Typography
                            variant="paragraph"
                            color="blue-gray"
                            className="font-normal line-clamp-1">
                            {food?.food_name}
                          </Typography>
                        </div>
                      </div>
                      <div className="flex gap-6 items-center">
                        <Typography
                          variant="paragraph"
                          color="blue-gray"
                          className="font-normal">
                          x {food?.quantity}
                        </Typography>
                        <Typography
                          variant="paragraph"
                          color="blue-gray"
                          className="font-normal">
                          ₹ {`${(food?.price * food.quantity).toFixed(2)}`}
                        </Typography>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            <hr className="my-5" />
            <div className="flex flex-col gap-1">
              <Typography
                variant="small"
                color="blue-gray"
                className="font-normal opacity-70">
                Instructions
              </Typography>
              <Typography
                variant="paragraph"
                color="blue-gray"
                className={`${
                  !selectedOrder.instructions && "text-center opacity-70 py-5"
                } font-normal`}>
                {selectedOrder?.instructions
                  ? selectedOrder?.instructions
                  : "No Instructions Available"}
              </Typography>
            </div>
            <hr className="my-5" />
            <div className="flex flex-col gap-1 pb-5">
              <div className="flex justify-between gap-3">
                <Typography variant="paragraph" color="blue-gray" className="font-normal">
                  Subtotal
                </Typography>
                <Typography variant="paragraph" color="blue-gray" className="font-normal">
                  ₹ {selectedOrder?.total_amount.toFixed(2)}
                </Typography>
              </div>
              <div className="flex justify-between gap-3">
                <Typography variant="paragraph" color="blue-gray" className="font-normal">
                  GST
                </Typography>
                <Typography variant="paragraph" color="blue-gray" className="font-normal">
                  ₹ {selectedOrder?.tax_amount.toFixed(2)}
                </Typography>
              </div>
              <div className="flex justify-between gap-3">
                <Typography
                  variant="paragraph"
                  color="blue-gray"
                  className="font-semibold">
                  Total
                </Typography>
                <Typography variant="lead" color="green" className="font-semibold">
                  ₹ {selectedOrder?.grand_amount.toFixed(2)}
                </Typography>
              </div>
            </div>
          </div>
        ) : (
          <Typography>No order details available.</Typography>
        )}
      </div>
    </Drawer>
  );
}
