import {Avatar, Badge, Typography} from "@material-tailwind/react";
import React from "react";

export default function AvatarWithDotIndicator({messageResult}) {
  const restaurantName = messageResult[0]?.restaurants;

  if (!messageResult) {
    return <div>No message result</div>;
  }

  return (
    <>
      <div className="flex gap-3 items-center">
        <Avatar size="lg" src={restaurantName?.logo} alt="avatar" variant="rounded" />

        <div>
          <Typography variant="h6">{restaurantName?.restaurant_name}</Typography>
          <Typography variant="small" color="gray" className="font-normal">
            {restaurantName?.owner_name}
          </Typography>
        </div>
      </div>
    </>
  );
}
