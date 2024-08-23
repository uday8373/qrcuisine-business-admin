import React, {useEffect} from "react";
import {Drawer, Typography, IconButton, Chip, Avatar} from "@material-tailwind/react";

export function ViewOrderDrawer({closeDrawer, open, selectedData, toggleDrawer}) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (selectedData === null) {
    return null;
  }
  return (
    <Drawer
      overlay={false}
      size={500}
      placement="right"
      open={open}
      onClose={toggleDrawer}
      className="p-4 overflow-y-scroll">
      <div className="mb-6 flex items-center justify-between">
        <Typography variant="h5" color="blue-gray">
          Order ID : {selectedData.order_id}
        </Typography>
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

      <div className="flex justify-between gap-3 items-center">
        <div className="flex flex-col gap-1">
          <Typography
            variant="small"
            color="blue-gray"
            className="font-normal opacity-70">
            Created at
          </Typography>
          <div className="flex gap-1">
            <Typography variant="paragraph" color="blue-gray" className="font-normal">
              {new Date(selectedData?.created_at)
                .toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
                .replace(/-/g, " ")}
            </Typography>
            <Typography variant="paragraph" color="blue-gray" className="font-normal">
              at{" "}
              {new Date(selectedData?.created_at)
                .toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })
                .replace(/-/g, " ")}
            </Typography>
          </div>
        </div>
        <div className="flex flex-col gap-1">
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
              selectedData?.status_id?.sorting === 1
                ? "blue"
                : selectedData?.status_id?.sorting === 2
                ? "cyan"
                : selectedData?.status_id?.sorting === 3
                ? "orange"
                : "green"
            }
            value={selectedData?.status_id?.title}
            className="flex justify-center cursor-pointer"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Typography
            variant="small"
            color="blue-gray"
            className="font-normal opacity-70">
            Delivered
          </Typography>
          <Chip
            color={selectedData?.is_delivered ? "green" : "orange"}
            className="flex justify-center"
            value={selectedData?.is_delivered ? "True" : "false"}
          />
        </div>
      </div>
      <hr className="my-5" />
      <div className="flex flex-col gap-1">
        <Typography variant="small" color="blue-gray" className="font-normal opacity-70">
          Customer
        </Typography>
        <div className="flex flex-col">
          <Typography variant="paragraph" color="blue-gray" className="font-normal">
            {selectedData?.user_id?.name}
          </Typography>
          <Typography variant="paragraph" color="blue" className="font-normal">
            +91 {selectedData?.user_id?.mobile}
          </Typography>
        </div>
      </div>
      <hr className="my-5" />
      <div className="flex flex-col gap-3">
        <Typography variant="small" color="blue-gray" className="font-normal opacity-70">
          Items
        </Typography>
        <div className="flex flex-col gap-3">
          {selectedData?.fooditem_ids &&
            selectedData?.fooditem_ids.map((food, index) => (
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
        <Typography variant="small" color="blue-gray" className="font-normal opacity-70">
          Instructions
        </Typography>
        <Typography
          variant="paragraph"
          color="blue-gray"
          className={`${
            !selectedData.instructions && "text-center opacity-70 py-5"
          } font-normal`}>
          {selectedData?.instructions
            ? selectedData?.instructions
            : "No Instructions Available"}
        </Typography>
      </div>
      <hr className="my-5" />
      <div className="flex flex-col gap-1">
        <div className="flex justify-between gap-3">
          <Typography variant="paragraph" color="blue-gray" className="font-normal">
            Subtotal
          </Typography>
          <Typography variant="paragraph" color="blue-gray" className="font-normal">
            ₹ {selectedData?.total_amount.toFixed(2)}
          </Typography>
        </div>
        <div className="flex justify-between gap-3">
          <Typography variant="paragraph" color="blue-gray" className="font-normal">
            GST
          </Typography>
          <Typography variant="paragraph" color="blue-gray" className="font-normal">
            ₹ {selectedData?.tax_amount.toFixed(2)}
          </Typography>
        </div>
        <div className="flex justify-between gap-3">
          <Typography variant="paragraph" color="blue-gray" className="font-semibold">
            Total
          </Typography>
          <Typography variant="paragraph" color="deep-orange" className="font-semibold">
            ₹ {selectedData?.grand_amount.toFixed(2)}
          </Typography>
        </div>
      </div>
    </Drawer>
  );
}
