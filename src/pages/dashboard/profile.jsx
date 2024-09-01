import {
  Card,
  CardBody,
  Avatar,
  Typography,
  Tabs,
  TabsHeader,
  Tab,
  Tooltip,
  Chip,
  MenuHandler,
  MenuList,
  MenuItem,
  Menu,
  IconButton,
} from "@material-tailwind/react";
import {
  HomeIcon,
  ChatBubbleLeftEllipsisIcon,
  Cog6ToothIcon,
  PencilIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/solid";
import {ProfileInfoCard} from "@/widgets/cards";
import {useEffect, useState} from "react";
import {getRestaurant} from "@/apis/profile-apis";
import {useNavigate} from "react-router-dom";
import supabase from "@/configs/supabase";

export function Profile() {
  const navigate = useNavigate();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchRestaurantData = async () => {
    const restaurantResult = await getRestaurant();

    if (restaurantResult) {
      setData(restaurantResult);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRestaurantData();
  }, []);

  const handleStatusChanges = async (is_open) => {
    const {data: statusData, error} = await supabase
      .from("restaurants")
      .update([{is_open: is_open}])
      .eq("id", data.id)
      .select();

    if (error) {
      console.error("Error updating restaurant info:", error);
    } else {
      fetchRestaurantData();
    }
  };

  return (
    <>
      <div
        className={`relative mt-8 h-72 w-full overflow-hidden rounded-xl bg-cover	bg-center`}>
        <div className="absolute inset-0 h-full w-full bg-black/25" />
        <img src={data?.background_image} className="rounded-xl" />
      </div>
      <Card className="mx-3 -mt-16 mb-6 lg:mx-4 border border-blue-gray-100">
        <CardBody className="p-4">
          <div className="mb-10 flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center gap-6">
              <Avatar
                src={data?.logo}
                alt="bruce-mars"
                size="xl"
                variant="rounded"
                className="rounded-lg shadow-lg shadow-blue-gray-500/40"
              />
              <div>
                <Typography variant="h5" color="blue-gray" className="mb-1">
                  {data?.restaurant_name}
                </Typography>
                <Typography variant="small" className="font-normal text-blue-gray-600">
                  {data?.owner_name ? data?.owner_name : "N/A"}
                </Typography>
              </div>
            </div>
            <div className="w-96">
              <Tabs value="app">
                <TabsHeader>
                  <Tab value="app">
                    <HomeIcon className="-mt-1 mr-2 inline-block h-5 w-5" />
                    App
                  </Tab>
                  <Tab value="message">
                    <ChatBubbleLeftEllipsisIcon className="-mt-0.5 mr-2 inline-block h-5 w-5" />
                    Message
                  </Tab>
                  <Tab
                    onClick={() => {
                      navigate("/dashboard/settings");
                    }}
                    value="settings">
                    <Cog6ToothIcon className="-mt-1 mr-2 inline-block h-5 w-5" />
                    Settings
                  </Tab>
                </TabsHeader>
              </Tabs>
            </div>
          </div>
          <div className="gird-cols-1 mb-12 grid gap-12 px-4 lg:grid-cols-2 xl:grid-cols-3">
            <ProfileInfoCard
              title="Restaurant Information"
              description={data?.restaurant_information}
              details={{
                Mobile: data?.restaurant_mobile,
                Email: data?.restaurant_email,
                Location: data?.restaurant_address,
                "Number Of Tables": `${data?.total_tables} tables`,
                Status: (
                  <Menu>
                    <MenuHandler>
                      <Chip
                        className="cursor-pointer"
                        icon={<ChevronDownIcon />}
                        variant="ghost"
                        color={data?.is_open ? "green" : "red"}
                        value={data?.is_open ? "Open" : "Close"}
                      />
                    </MenuHandler>
                    <MenuList>
                      <MenuItem onClick={() => handleStatusChanges(true)}>Open</MenuItem>
                      <hr className="my-3" />
                      <MenuItem onClick={() => handleStatusChanges(false)}>
                        Close
                      </MenuItem>
                    </MenuList>
                  </Menu>
                ),
              }}
              action={
                <Tooltip content="Edit Restaurant Info">
                  <IconButton
                    onClick={() => {
                      navigate("/dashboard/settings", {state: {tab: "restaurantInfo"}});
                    }}
                    variant="text">
                    <PencilIcon className="h-4 w-4 cursor-pointer text-blue-gray-500" />
                  </IconButton>
                </Tooltip>
              }
            />
            <ProfileInfoCard
              title="Owner Information"
              details={{
                Name: data?.owner_name,
                Moblie: data?.owner_mobile,
                Email: data?.owner_email,
                location: data?.owner_address,
                account: (
                  <Chip
                    variant="ghost"
                    color={data?.is_verified ? "green" : ""}
                    value={data?.is_verified ? "Verified" : "Pending"}
                  />
                ),
                Subcription: (
                  <Chip
                    variant="ghost"
                    color={data?.is_subcription ? "light-blue" : "orange"}
                    value={data?.is_subcription ? "Paid" : "Free"}
                  />
                ),
                Licenced: (
                  <Chip
                    variant="ghost"
                    color={data?.licenced ? "green" : ""}
                    value={data?.licenced ? "True" : "False"}
                  />
                ),

                // social: (
                //   <div className="flex items-center gap-4">
                //     <i className="fa-brands fa-facebook text-blue-700" />
                //     <i className="fa-brands fa-twitter text-blue-400" />
                //     <i className="fa-brands fa-instagram text-purple-500" />
                //   </div>
                // ),
              }}
              action={
                <Tooltip content="Edit Owner Info">
                  <IconButton
                    onClick={() => {
                      navigate("/dashboard/settings", {state: {tab: "ownerInfo"}});
                    }}
                    variant="text">
                    <PencilIcon className="h-4 w-4 cursor-pointer text-blue-gray-500" />
                  </IconButton>
                </Tooltip>
              }
            />
            <div>
              <div className="w-full flex justify-between items-center mb-4">
                <Typography variant="h6" color="blue-gray">
                  Opening Times
                </Typography>
                <Tooltip content="Edit Opening Times">
                  <IconButton
                    onClick={() => {
                      navigate("/dashboard/settings", {state: {tab: "openingTimes"}});
                    }}
                    variant="text">
                    <PencilIcon className="h-4 w-4 cursor-pointer text-blue-gray-500" />
                  </IconButton>
                </Tooltip>
              </div>
              <ul className="flex flex-col gap-6">
                {data?.opening_times &&
                  data?.opening_times.map((item, index) => (
                    <div key={index} className="w-full flex justify-between items-center">
                      <div className="flex gap-3 items-center">
                        <div
                          className={`${
                            item?.is_open ? "bg-green-500" : "bg-red-500"
                          } w-2 h-2 rounded-full`}
                        />
                        <Typography
                          variant="small"
                          className="font-normal text-blue-gray-500">
                          {item?.day}
                        </Typography>
                      </div>
                      <Typography
                        variant="small"
                        className={`${
                          item?.is_open ? "text-blue-gray-500" : "text-red-500"
                        } font-normal  uppercase`}>
                        {item?.is_open ? (
                          <>
                            {new Date(item?.opening_time)
                              .toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })
                              .replace(/-/g, " ")}{" "}
                            -{" "}
                            {new Date(item?.opening_time)
                              .toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })
                              .replace(/-/g, " ")}
                          </>
                        ) : (
                          "Close"
                        )}
                      </Typography>
                    </div>
                  ))}
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>
    </>
  );
}

export default Profile;
