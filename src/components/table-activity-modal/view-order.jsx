import React from "react";
import {Drawer, Typography, IconButton} from "@material-tailwind/react";

export default function ViewOrder({
  open,
  closeDrawer,
  sortedMessageData,
  selectedOrderId,
}) {
  const selectedOrder = sortedMessageData?.find(
    (msg) => msg.orders?.id === selectedOrderId,
  );

  return (
    <Drawer
      placement="right"
      size={450}
      open={open}
      overlay={false}
      onClose={closeDrawer}
      className="p-4">
      <div className="mb-6 flex items-center justify-between">
        <Typography variant="h5">Order Details</Typography>
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

      <div>
        {selectedOrder ? (
          <div>
            <Typography variant="h6">Order ID: {selectedOrder.orders?.id}</Typography>
            <Typography variant="body1">
              Customer Name: {selectedOrder.customerName}
            </Typography>
            <Typography variant="body1">
              Total Amount: Rs. {selectedOrder.orders?.grand_amount}
            </Typography>
            <Typography variant="body1">Status: {selectedOrder.status}</Typography>
          </div>
        ) : (
          <Typography>No order details available.</Typography>
        )}
      </div>
    </Drawer>
  );
}
