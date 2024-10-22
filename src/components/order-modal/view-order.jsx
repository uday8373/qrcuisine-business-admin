import React, {useEffect} from "react";
import {Drawer, Typography, IconButton, Chip, Avatar} from "@material-tailwind/react";
import moment from "moment";
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

  console.log("selectedData", selectedData);

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
            selectedData?.fooditem_ids.map((food, index) => (
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
                      {WEB_CONFIG?.currencySymbol}{" "}
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
                        <div className="w-full h-full  rounded-lg relative bg-white">
                          <div className="absolute top-[12px] left-2">
                            <IconButton size="sm" className="p-1 bg-gray-200">
                              <svg
                                width="27"
                                height="27"
                                viewBox="0 0 27 27"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                  fill-rule="evenodd"
                                  clip-rule="evenodd"
                                  d="M5.0625 13.5C5.0625 11.0207 6.13184 8.7912 7.83444 7.24749C7.67797 7.75715 7.59375 8.29843 7.59375 8.85938C7.59375 11.8883 10.0492 14.3438 13.0781 14.3438C15.1751 14.3438 16.875 16.0436 16.875 18.1406C16.875 20.1808 15.2658 21.8453 13.2474 21.9338C8.70436 21.8003 5.0625 18.0754 5.0625 13.5ZM3.375 13.5C3.375 8.44587 7.07817 4.25666 11.9193 3.49768C12.2928 3.41731 12.6805 3.375 13.0781 3.375V3.38363C13.2181 3.37789 13.3587 3.375 13.5 3.375C19.0919 3.375 23.625 7.90812 23.625 13.5C23.625 19.0919 19.0919 23.625 13.5 23.625C13.4188 23.625 13.3378 23.624 13.257 23.6222C13.1976 23.624 13.138 23.625 13.0781 23.625V23.6163C7.68188 23.3952 3.375 18.9505 3.375 13.5ZM9.28125 8.85938C9.28125 7.05336 10.5422 5.54185 12.2317 5.15719C12.6454 5.09483 13.0689 5.0625 13.5 5.0625C18.1599 5.0625 21.9375 8.84009 21.9375 13.5C21.9375 16.5293 20.3411 19.1858 17.9436 20.6739C18.339 19.9161 18.5625 19.0545 18.5625 18.1406C18.5625 15.1117 16.1071 12.6562 13.0781 12.6562C10.9812 12.6562 9.28125 10.9563 9.28125 8.85938ZM14.3438 8.85938C14.3438 8.16039 13.7771 7.59375 13.0781 7.59375C12.3792 7.59375 11.8125 8.16039 11.8125 8.85938C11.8125 9.55836 12.3792 10.125 13.0781 10.125C13.7771 10.125 14.3438 9.55836 14.3438 8.85938ZM14.3438 18.1406C14.3438 17.4417 13.7771 16.875 13.0781 16.875C12.3792 16.875 11.8125 17.4417 11.8125 18.1406C11.8125 18.8396 12.3792 19.4062 13.0781 19.4062C13.7771 19.4062 14.3438 18.8396 14.3438 18.1406Z"
                                  fill="#080341"
                                />
                              </svg>
                            </IconButton>
                          </div>
                          <div className="bg-orange-200 rounded-t-lg pl-12 pr-2  py-[5px]">
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-bold uppercase ">
                              Sides
                            </Typography>
                          </div>
                          <div className="pl-12 pr-2 py-[2px]">
                            <Typography
                              variant="paragraph"
                              color="blue-gray"
                              className="font-normal">
                              {food?.selectedSides?.title || "N/A"}
                            </Typography>
                          </div>
                        </div>
                        {/* Additional Sides */}
                        <div className="w-full h-full rounded-lg relative bg-white ">
                          <div className="absolute top-[12px] left-2">
                            <IconButton size="sm" className="p-1 bg-gray-200">
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <g clip-path="url(#clip0_384_255)">
                                  <path
                                    d="M8.92353 10.6736V17.784C7.58126 17.9922 6.60252 18.6379 6.60252 19.4027H13.1104C13.1104 18.6937 12.2689 18.0871 11.0765 17.8364V10.6736L20 0.59726H0L8.92353 10.6736ZM9.94472 9.7427L3.90305 2.85617H15.9812L9.94472 9.7427Z"
                                    fill="black"
                                  />
                                </g>
                                <defs>
                                  <clipPath id="clip0_384_255">
                                    <rect width="20" height="20" fill="white" />
                                  </clipPath>
                                </defs>
                              </svg>
                            </IconButton>
                          </div>
                          <div className="bg-orange-200 rounded-t-lg pl-12 pr-2  py-[5px]">
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-bold uppercase ">
                              Additional Sides
                            </Typography>
                          </div>
                          <div className="pl-12 pr-2 py-[2px]">
                            <Typography
                              variant="paragraph"
                              color="blue-gray"
                              className="font-normal">
                              {food?.selectedAdditionalSides?.title || "N/A"}
                            </Typography>
                          </div>
                        </div>
                        {/* Instructions */}
                        <div className="w-full h-full  rounded-lg relative bg-white">
                          <div className="absolute top-[12px] left-2">
                            <IconButton size="sm" className="p-1 bg-gray-200">
                              <svg
                                width="27"
                                height="27"
                                viewBox="0 0 27 27"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                  fill-rule="evenodd"
                                  clip-rule="evenodd"
                                  d="M5.0625 13.5C5.0625 11.0207 6.13184 8.7912 7.83444 7.24749C7.67797 7.75715 7.59375 8.29843 7.59375 8.85938C7.59375 11.8883 10.0492 14.3438 13.0781 14.3438C15.1751 14.3438 16.875 16.0436 16.875 18.1406C16.875 20.1808 15.2658 21.8453 13.2474 21.9338C8.70436 21.8003 5.0625 18.0754 5.0625 13.5ZM3.375 13.5C3.375 8.44587 7.07817 4.25666 11.9193 3.49768C12.2928 3.41731 12.6805 3.375 13.0781 3.375V3.38363C13.2181 3.37789 13.3587 3.375 13.5 3.375C19.0919 3.375 23.625 7.90812 23.625 13.5C23.625 19.0919 19.0919 23.625 13.5 23.625C13.4188 23.625 13.3378 23.624 13.257 23.6222C13.1976 23.624 13.138 23.625 13.0781 23.625V23.6163C7.68188 23.3952 3.375 18.9505 3.375 13.5ZM9.28125 8.85938C9.28125 7.05336 10.5422 5.54185 12.2317 5.15719C12.6454 5.09483 13.0689 5.0625 13.5 5.0625C18.1599 5.0625 21.9375 8.84009 21.9375 13.5C21.9375 16.5293 20.3411 19.1858 17.9436 20.6739C18.339 19.9161 18.5625 19.0545 18.5625 18.1406C18.5625 15.1117 16.1071 12.6562 13.0781 12.6562C10.9812 12.6562 9.28125 10.9563 9.28125 8.85938ZM14.3438 8.85938C14.3438 8.16039 13.7771 7.59375 13.0781 7.59375C12.3792 7.59375 11.8125 8.16039 11.8125 8.85938C11.8125 9.55836 12.3792 10.125 13.0781 10.125C13.7771 10.125 14.3438 9.55836 14.3438 8.85938ZM14.3438 18.1406C14.3438 17.4417 13.7771 16.875 13.0781 16.875C12.3792 16.875 11.8125 17.4417 11.8125 18.1406C11.8125 18.8396 12.3792 19.4062 13.0781 19.4062C13.7771 19.4062 14.3438 18.8396 14.3438 18.1406Z"
                                  fill="#080341"
                                />
                              </svg>
                            </IconButton>
                          </div>
                          <div className="bg-orange-200 rounded-t-lg pl-12 pr-2  py-[5px]">
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-bold uppercase ">
                              Quick Instructions
                            </Typography>
                          </div>
                          <div className="pl-12 pr-2 py-[2px]">
                            <Typography
                              variant="paragraph"
                              color="blue-gray"
                              className="font-normal">
                              {food?.selectedInstructions?.title || "N/A"}
                            </Typography>
                          </div>
                        </div>
                        {/* Temperature */}
                        <div className="w-full h-full  rounded-lg relative bg-white ">
                          <div className="absolute top-[12px] left-2">
                            <IconButton size="sm" className="p-1 bg-gray-200">
                              <svg
                                width="26"
                                height="26"
                                viewBox="0 0 26 26"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                  d="M16.8594 4.8815C16.8594 -0.193372 9.13981 -0.194997 9.14062 4.8815V15.6374C8.13719 16.6319 7.51562 18.0107 7.51562 19.5341C7.51562 22.5631 9.971 25.0185 13 25.0185C16.029 25.0185 18.4844 22.5631 18.4844 19.5341C18.4844 18.0107 17.8628 16.6319 16.8594 15.6374V4.8815ZM13 23.7656C10.6437 23.7656 8.73438 21.8554 8.73438 19.4992C8.73438 18.2374 9.282 17.1039 10.1522 16.3231L10.1562 16.3199L10.1611 16.3101C10.2667 16.211 10.3358 16.0745 10.3488 15.9226V15.9201C10.3496 15.9088 10.3545 15.9006 10.3553 15.8893L10.3602 15.8657V4.88069C10.3578 4.83763 10.3561 4.78725 10.3561 4.73607C10.3561 3.35157 11.4782 2.2295 12.8627 2.2295C12.9114 2.2295 12.9602 2.23113 13.0081 2.23357H13.0016C13.0431 2.23113 13.091 2.2295 13.1398 2.2295C14.5243 2.2295 15.6463 3.35157 15.6463 4.73607C15.6463 4.78725 15.6447 4.83763 15.6414 4.88719V4.88069V15.8657L15.6463 15.8893L15.652 15.9185C15.6642 16.0737 15.7341 16.211 15.8397 16.3101L15.8446 16.3199C16.7188 17.1048 17.2664 18.2382 17.2664 19.4992C17.2664 21.8554 15.3563 23.7648 13 23.7656ZM13.6094 17.3607V14.3016C13.6094 13.9653 13.3364 13.6923 13 13.6923C12.6636 13.6923 12.3906 13.9653 12.3906 14.3016V17.3607C11.4449 17.6353 10.7656 18.4933 10.7656 19.5106C10.7656 20.7448 11.7658 21.7449 13 21.7449C14.2342 21.7449 15.2344 20.7448 15.2344 19.5106C15.2344 18.4933 14.5551 17.6353 13.6248 17.3648L13.6094 17.3607ZM21.5312 1.82813C20.0728 1.82813 18.8906 3.01032 18.8906 4.46875C18.8906 5.92719 20.0728 7.10938 21.5312 7.10938C22.9897 7.10938 24.1719 5.92719 24.1719 4.46875C24.1702 3.01113 22.9889 1.82975 21.5312 1.82813ZM21.5312 5.89063C20.7464 5.89063 20.1094 5.25363 20.1094 4.46875C20.1094 3.68388 20.7464 3.04688 21.5312 3.04688C22.3161 3.04688 22.9531 3.68388 22.9531 4.46875C22.9523 5.25363 22.3161 5.88982 21.5312 5.89063Z"
                                  fill="black"
                                />
                              </svg>
                            </IconButton>
                          </div>
                          <div className="bg-orange-200 rounded-t-lg pl-12 pr-2  py-[5px]">
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-bold uppercase ">
                              Temperature
                            </Typography>
                          </div>
                          <div className="pl-12 pr-2 py-[2px]">
                            <Typography
                              variant="paragraph"
                              color="blue-gray"
                              className="font-normal">
                              {food?.selectedTemperature?.title || "N/A"}
                            </Typography>
                          </div>
                        </div>
                        {/* Quantity */}
                        <div className="w-full h-full  rounded-lg relative bg-white">
                          <div className="absolute top-[12px] left-2">
                            <IconButton size="sm" className="p-1 bg-gray-200">
                              <svg
                                width="17"
                                height="17"
                                viewBox="0 0 17 17"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <g clip-path="url(#clip0_387_295)">
                                  <path
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M6.375 10.625H10.625V6.375H6.375V10.625ZM17 6.375V4.25H12.75V0H10.625V4.25H6.375V0H4.25V4.25H0V6.375H4.25V10.625H0V12.75H4.25V17H6.375V12.75H10.625V17H12.75V12.75H17V10.625H12.75V6.375H17Z"
                                    fill="black"
                                  />
                                </g>
                                <defs>
                                  <clipPath id="clip0_387_295">
                                    <rect width="17" height="17" fill="white" />
                                  </clipPath>
                                </defs>
                              </svg>
                            </IconButton>
                          </div>
                          <div className="bg-orange-200 rounded-t-lg pl-12 pr-2  py-[5px]">
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-bold uppercase ">
                              Quantity
                            </Typography>
                          </div>
                          <div className="pl-12 pr-2 py-[2px]">
                            <Typography
                              variant="paragraph"
                              color="blue-gray"
                              className="font-normal">
                              {food?.selectedQuantity?.title || "N/A"}
                            </Typography>
                          </div>
                        </div>
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
            {WEB_CONFIG?.currencySymbol} {selectedData?.total_amount.toFixed(2)}
          </Typography>
        </div>
        <div className="flex justify-between gap-3">
          <Typography variant="paragraph" color="blue-gray" className="font-normal">
            GST
          </Typography>
          <Typography variant="paragraph" color="blue-gray" className="font-normal">
            {WEB_CONFIG?.currencySymbol} {selectedData?.tax_amount.toFixed(2)}
          </Typography>
        </div>
        <div className="flex justify-between gap-3">
          <Typography variant="paragraph" color="blue-gray" className="font-semibold">
            Total
          </Typography>
          <Typography variant="lead" color="green" className="font-semibold">
            {WEB_CONFIG?.currencySymbol} {selectedData?.grand_amount.toFixed(2)}
          </Typography>
        </div>
      </div>
    </Drawer>
  );
}
