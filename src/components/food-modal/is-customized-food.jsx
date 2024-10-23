import {Chip, IconButton, Typography} from "@material-tailwind/react";
import React from "react";

export default function IsCustomizedFood({title, icon, content}) {
  return (
    <>
      <div className="w-full h-full rounded-lg relative bg-white">
        <div className="absolute top-[12px]  left-1 pl-[2px] ">
          <div
            className="bg-gray-200 p-1 w-8 h-8 flex items-center justify-center
             rounded-md">
            <img src={icon} alt="icon" className="" />
          </div>
        </div>
        <div className="bg-orange-200 rounded-t-lg pl-12 pr-2 py-[5px]">
          <Typography variant="small" color="blue-gray" className="font-bold uppercase">
            {title}
          </Typography>
        </div>
        <div className="pl-12 pr-2 py-[2px]">
          <Typography variant="paragraph" color="blue-gray" className="font-normal">
            {content || "N/A"}
          </Typography>
        </div>
      </div>
    </>
  );
}
