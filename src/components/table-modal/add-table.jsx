import React, {useEffect} from "react";
import {
  Input,
  Button,
  Dialog,
  IconButton,
  Typography,
  DialogBody,
  DialogHeader,
  DialogFooter,
} from "@material-tailwind/react";
import {XMarkIcon} from "@heroicons/react/24/outline";

export function AddTableModal({
  open,
  formData,
  setFormData,
  handleSubmit,
  handleOpen,
  loading,
  errors,
}) {
  const handleTableNumberChange = (e) => {
    const {name, value} = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleBeforeUnload = (e) => {
    if (loading) {
      e.preventDefault();
      e.returnValue = ""; // Required for most browsers to trigger the confirmation
    }
  };

  useEffect(() => {
    if (loading) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    } else {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    }

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [loading]);

  return (
    <>
      <Dialog
        size="sm"
        open={open}
        handler={handleOpen}
        className="p-4"
        backdrop={loading ? null : true}>
        <DialogHeader className="relative m-0 block">
          <Typography variant="h4" color="blue-gray">
            Generate Tables
          </Typography>
          <Typography className="mt-1 font-normal text-gray-600">
            Generate a table for your store.
          </Typography>
          <IconButton
            disabled={loading}
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
              Number of Tables
            </Typography>
            <Input
              type="number"
              color="gray"
              size="lg"
              placeholder="eg. 10"
              name="numberOfTable"
              value={formData.numberOfTable}
              onChange={handleTableNumberChange}
              className={`placeholder:opacity-100 focus:!border-t-gray-900 !border-t-gray-400 ${
                errors.numberOfTable ? "border-red-500" : ""
              }`}
              containerProps={{
                className: "!min-w-full",
              }}
              labelProps={{
                className: "hidden",
              }}
            />
            {errors.numberOfTable && (
              <Typography variant="small" color="red" className="mt-1">
                {errors.numberOfTable}
              </Typography>
            )}
          </div>
          <div>
            <Typography
              variant="small"
              color="blue-gray"
              className="mb-2 text-left font-medium">
              Number of Seat Capacity
            </Typography>
            <Input
              type="number"
              color="gray"
              size="lg"
              placeholder="eg. 10"
              name="max_capacity"
              value={formData.max_capacity}
              onChange={handleTableNumberChange}
              className={`placeholder:opacity-100 focus:!border-t-gray-900 !border-t-gray-400 ${
                errors.max_capacity ? "border-red-500" : ""
              }`}
              containerProps={{
                className: "!min-w-full",
              }}
              labelProps={{
                className: "hidden",
              }}
            />
            {errors.max_capacity && (
              <Typography variant="small" color="red" className="mt-1">
                {errors.max_capacity}
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
            Add Table
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
