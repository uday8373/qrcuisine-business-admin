import React, {useEffect} from "react";
import {Drawer, Typography, IconButton, Chip, Avatar} from "@material-tailwind/react";
import moment from "moment";
import IsCustomizedFood from "../food-modal/is-customized-food";
import {
  Additional_Sides,
  Quantity,
  Quick_Instructions,
  Sides,
  Temperature,
} from "/public/img";
import {WEB_CONFIG} from "@/configs/website-config";

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

  const icons = {
    selectedSides: Sides,
    selectedAdditionalSides: Additional_Sides,
    selectedInstructions: Quick_Instructions,
    selectedTemperature: Temperature,
    selectedQuantity: Quantity,
  };

  const mergedArr = selectedData?.fooditem_ids.map((item) => {
    const matchedIcon = {};

    if (item.selectedSides) {
      matchedIcon.selectedSides = icons.selectedSides;
    }
    if (item.selectedAdditionalSides) {
      matchedIcon.selectedAdditionalSides = icons.selectedAdditionalSides;
    }
    if (item.selectedInstructions) {
      matchedIcon.selectedInstructions = icons.selectedInstructions;
    }
    if (item.selectedTemperature) {
      matchedIcon.selectedTemperature = icons.selectedTemperature;
    }
    if (item.selectedQuantity) {
      matchedIcon.selectedQuantity = icons.selectedQuantity;
    }

    return {
      ...item,
      icon: matchedIcon, // turn the object into an array of values
    };
  });

  console.log("Merged Array", mergedArr);

  return (
    <Drawer
      overlay={true}
      overlayProps={{
        className: "fixed inset-0 h-full",
      }}
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
              {moment(selectedData?.created_at).format("DD MMM YYYY")}
            </Typography>
            <Typography variant="paragraph" color="blue-gray" className="font-normal">
              at {moment(selectedData?.created_at).format("hh:mm a")}
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
                ? "green"
                : selectedData?.status_id?.sorting === 3
                ? "orange"
                : selectedData?.status_id?.sorting === 4
                ? "gray"
                : selectedData?.status_id?.sorting === 5
                ? "red"
                : selectedData?.status_id?.sorting === 6
                ? "brown"
                : "gray"
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
            color={selectedData?.is_delivered ? "green" : "gray"}
            className="flex justify-center"
            value={selectedData?.is_delivered ? "True" : "false"}
          />
        </div>
      </div>
      {selectedData?.status_id?.sorting === 5 && (
        <>
          <hr className="my-5" />
          <div className="flex flex-col gap-1 bg-red-500/10 p-3 rounded-lg">
            <Typography variant="small" color="red" className="font-medium">
              Cancelled Reason
            </Typography>
            <div className="flex flex-col">
              <Typography variant="paragraph" color="blue-gray" className="font-medium">
                {selectedData?.cancelled_reason?.title}
              </Typography>
              <Typography
                variant="small"
                color="blue-gray"
                className="font-normal opacity-70">
                {selectedData?.cancelled_reason?.description}
              </Typography>
            </div>
          </div>
        </>
      )}
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
            +91 {(selectedData?.user_id?.mobile || "").replace(/\d(?=\d{4})/g, "*")}
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
            mergedArr?.map((food, index) => (
              <div
                key={index}
                className={`flex w-full flex-col ${
                  food?.is_customized ? "bg-green-50 px-2 py-2 rounded-lg" : ""
                }`}>
                <div className="flex justify-between items-center gap-3">
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
                      {WEB_CONFIG?.currencySymbol}
                      {(food?.price * food?.quantity).toFixed(2)}
                    </Typography>
                  </div>
                </div>
                <div>
                  {food?.is_customized && (
                    <>
                      <hr
                        className="my-2 border-gray-500
                      border-dashed "
                      />
                      <div className=" w-full h-full grid grid-cols-2   gap-5 ">
                        {/* Sides */}
                        <IsCustomizedFood
                          title="Sides"
                          icon={food?.icon?.selectedSides}
                          content={food?.selectedSides?.title}
                        />
                        {/* Additional Sides */}
                        <IsCustomizedFood
                          title="Additional Sides"
                          icon={food?.icon?.selectedAdditionalSides}
                          content={food?.selectedAdditionalSides?.title}
                        />
                        {/* { Quick Instructions } */}
                        <IsCustomizedFood
                          title="Quick Instructions"
                          icon={food?.icon?.selectedInstructions}
                          content={food?.selectedInstructions?.title}
                        />
                        {/* { Temperature } */}
                        <IsCustomizedFood
                          title="Temperature"
                          icon={food?.icon?.selectedTemperature}
                          content={food?.selectedTemperature?.title}
                        />
                        {/* { Quantity } */}
                        <IsCustomizedFood
                          title="Quantity"
                          icon={food?.icon?.selectedQuantity}
                          content={food?.selectedQuantity?.title}
                        />
                      </div>
                    </>
                  )}
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
            {WEB_CONFIG?.currencySymbol}
            {selectedData?.total_amount.toFixed(2)}
          </Typography>
        </div>
        <div className="flex justify-between gap-3">
          <Typography variant="paragraph" color="blue-gray" className="font-normal">
            GST
          </Typography>
          <Typography variant="paragraph" color="blue-gray" className="font-normal">
            {WEB_CONFIG?.currencySymbol}
            {selectedData?.tax_amount.toFixed(2)}
          </Typography>
        </div>
        <div className="flex justify-between gap-3">
          <Typography variant="paragraph" color="blue-gray" className="font-semibold">
            Total
          </Typography>
          <Typography variant="lead" color="green" className="font-semibold">
            {WEB_CONFIG?.currencySymbol}
            {selectedData?.grand_amount.toFixed(2)}
          </Typography>
        </div>
      </div>
    </Drawer>
  );
}
