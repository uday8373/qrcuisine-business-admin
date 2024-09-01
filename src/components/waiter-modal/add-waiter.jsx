import React, {useState, useEffect} from "react";
import {
  Input,
  Option,
  Select,
  Button,
  Dialog,
  IconButton,
  Typography,
  DialogBody,
  DialogHeader,
  DialogFooter,
} from "@material-tailwind/react";
import {XMarkIcon} from "@heroicons/react/24/outline";

export function AddWaiterModal({
  open,
  formData,
  setFormData,
  handleSubmit,
  handleOpen,
  loading,
  errors,
}) {
  const handleTitleChange = (e) => {
    const {name, value} = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleStatusChange = (value) => {
    setFormData({
      ...formData,
      status: value,
    });
  };

  return (
    <>
      <Dialog size="sm" open={open} handler={handleOpen} className="p-4">
        <DialogHeader className="relative m-0 block">
          <Typography variant="h4" color="blue-gray">
            Add Waiter
          </Typography>
          <Typography className="mt-1 font-normal text-gray-600">
            Add a new waiter to your store.
          </Typography>
          <IconButton
            size="sm"
            variant="text"
            className="!absolute right-3.5 top-3.5"
            onClick={handleOpen}>
            <XMarkIcon className="h-4 w-4 stroke-2" />
          </IconButton>
        </DialogHeader>
        <DialogBody className="space-y-4 pb-6">
          <div>
            <Typography
              variant="small"
              color="blue-gray"
              className="mb-2 text-left font-medium">
              Name
            </Typography>
            <Input
              color="gray"
              size="lg"
              placeholder="eg. Alena"
              name="title"
              value={formData.title}
              onChange={handleTitleChange}
              className={`placeholder:opacity-100 focus:!border-t-gray-900 !border-t-gray-400 ${
                errors.title ? "border-red-500" : ""
              }`}
              containerProps={{
                className: "!min-w-full",
              }}
              labelProps={{
                className: "hidden",
              }}
            />
            {errors.title && (
              <Typography variant="small" color="red" className="mt-1">
                {errors.title}
              </Typography>
            )}
          </div>
          <div>
            <Typography
              variant="small"
              color="blue-gray"
              className="mb-2 text-left font-medium">
              Status
            </Typography>
            <Select
              className={`!w-full !border-[1.5px] !border-blue-gray-200/90 !border-t-blue-gray-200/90 bg-white text-gray-800 ring-4 ring-transparent placeholder:text-gray-600 focus:!border-primary focus:!border-t group-hover:!border-primary ${
                errors.status ? "border-red-500" : ""
              }`}
              placeholder="Select a status"
              label="Select a status"
              value={String(formData.status)}
              size="lg"
              onChange={handleStatusChange}
              labelProps={{
                className: "hidden",
              }}>
              <Option key="true" value="true">
                Available
              </Option>
              <Option key="false" value="false">
                Unavailable
              </Option>
            </Select>
            {errors.status && (
              <Typography variant="small" color="red" className="mt-1">
                {errors.status}
              </Typography>
            )}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            loading={loading}
            onClick={handleSubmit}
            disabled={!errors || loading}
            className="ml-auto">
            Add Waiter
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
