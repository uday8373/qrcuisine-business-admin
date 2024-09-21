import React from "react";
import {Dialog, DialogHeader, DialogBody, IconButton} from "@material-tailwind/react";
import {XMarkIcon} from "@heroicons/react/24/solid";

export function QRShowModal({open, handleOpen, selectedQr}) {
  return (
    <>
      <Dialog size="xs" open={open} handler={handleOpen}>
        <DialogHeader className="relative m-0 block">
          <IconButton
            size="sm"
            variant="text"
            className="!absolute right-3.5 top-3.5"
            onClick={handleOpen}>
            <XMarkIcon className="h-4 w-4 stroke-2" />
          </IconButton>
        </DialogHeader>
        <DialogBody className="grid place-items-center gap-4 py-5 relative min-h-[500px]">
          <img src={selectedQr} className="w-full h-auto" />
        </DialogBody>
      </Dialog>
    </>
  );
}
