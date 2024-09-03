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
        <Avatar
          size="lg"
          src={restaurantName?.logo || "/public/img/restaurant.png"}
          alt="avatar"
        />

        <div>
          <Typography variant="h6">
            {restaurantName?.restaurant_name || "Restaurant "}
          </Typography>
          <Typography variant="small" color="gray" className="font-normal">
            {restaurantName?.owner_name || "Owner "}
          </Typography>
        </div>
      </div>
    </>
  );
}
