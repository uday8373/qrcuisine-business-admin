import React, {useEffect, useState} from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  IconButton,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
  Tooltip,
  Progress,
  Tabs,
  Tab,
  TabsHeader,
} from "@material-tailwind/react";
import {EllipsisVerticalIcon, ArrowUpIcon} from "@heroicons/react/24/outline";
import {StatisticsCard} from "@/widgets/cards";
import {StatisticsChart} from "@/widgets/charts";
import {
  statisticsCardsData,
  statisticsChartsData,
  projectsTableData,
  ordersOverviewData,
} from "@/data";
import {
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  UserPlusIcon,
  UsersIcon,
} from "@heroicons/react/24/solid";
import {getOrdersApi, getUsersApi, getVisitorApi} from "@/apis/analytic-apis";
import numeral from "numeral";
import VisitorChart from "@/components/charts/visitor-chart";

const tabs = [
  {label: "Today", value: "today"},
  {label: "This Week", value: "week"},
  {label: "This Month", value: "month"},
  {label: "This Year", value: "year"},
];

const chartTabs = [
  {label: "This Week", value: "week"},
  {label: "This Year", value: "year"},
];

export function Home() {
  const [orderTotalAmount, setOrderTotalAmount] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [newUsersCount, setNewUsersCount] = useState(0);
  const [returningUsersCount, setReturningUsersCount] = useState(0);
  const [selectedTab, setSelectedTab] = useState("today");
  const [activeChartTab, setActiveChartTab] = useState("week");
  const [chartData, setChartData] = useState({
    website_visit: [],
    booked_count: [],
    checkout_count: [],
    place_order_count: [],
    order_confirm_count: [],
    order_preparing_count: [],
    order_delivered_count: [],
    labels: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orderResponse, userResponse, visitorResponse] = await Promise.all([
          getOrdersApi(selectedTab),
          getUsersApi(selectedTab),
          getVisitorApi(activeChartTab),
        ]);
        if (!orderResponse) {
          throw new Error("Failed to fetch data");
        } else {
          const totalAmount = orderResponse.reduce((accumulator, order) => {
            return accumulator + order.grand_amount;
          }, 0);
          setOrderTotalAmount(totalAmount);
          const uniqueCustomers = new Set(userResponse.map((user) => user.deviceToken));
          setTotalCustomers(uniqueCustomers.size);

          const deviceTokenCount = {};
          userResponse.forEach((user) => {
            const {deviceToken} = user;
            if (deviceTokenCount[deviceToken]) {
              deviceTokenCount[deviceToken]++;
            } else {
              deviceTokenCount[deviceToken] = 1;
            }
          });

          let newUsers = 0;
          let returningUsers = 0;

          Object.values(deviceTokenCount).forEach((count) => {
            if (count === 1) {
              newUsers++;
            } else {
              returningUsers++;
            }
          });

          setNewUsersCount(newUsers);
          setReturningUsersCount(returningUsers);

          console.log("users", userResponse);
          console.log("Order", orderResponse);

          const websiteVisits = visitorResponse.map((item) => item.website_visit);
          const checkoutCounts = visitorResponse.map((item) => item.checkout_count);
          const bookedCounts = visitorResponse.map((item) => item.booked_count);
          const placeOrderCounts = visitorResponse.map((item) => item.place_order_count);
          const orderConfirmCounts = visitorResponse.map(
            (item) => item.order_confirm_count,
          );
          const orderPreparingCounts = visitorResponse.map(
            (item) => item.order_preparing_count,
          );
          const orderDeliveredCounts = visitorResponse.map(
            (item) => item.order_delivered_count,
          );

          let labels;

          if (activeChartTab === "week") {
            // Generate labels for the days of the week based on the created_at date
            labels = visitorResponse.map((item) => {
              const date = new Date(item.created_at);
              return date.toLocaleDateString("en-IN", {weekday: "short"}); // e.g., 'Sun', 'Mon'
            });
          } else {
            // Generate labels for months
            labels = visitorResponse.map((item) => {
              const date = new Date(item.created_at);
              return date.toLocaleDateString("en-IN", {month: "short"}); // e.g., 'Jan', 'Feb'
            });
          }

          setChartData({
            website_visit: websiteVisits,
            checkout_count: checkoutCounts,
            booked_count: bookedCounts,
            place_order_count: placeOrderCounts,
            order_confirm_count: orderConfirmCounts,
            order_preparing_count: orderPreparingCounts,
            order_delivered_count: orderDeliveredCounts,
            labels: labels,
          });
        }
      } catch (error) {
        throw error;
      }
    };
    fetchData();
  }, [selectedTab, activeChartTab]);

  const handleTabChange = (value) => {
    setSelectedTab(value);
  };
  const handleChartTabChange = (value) => {
    setActiveChartTab(value);
  };

  const getTitlePrefixByTab = (tab) => {
    switch (tab) {
      case "today":
        return "Today's";
      case "week":
        return "Weekly";
      case "month":
        return "Monthly";
      case "year":
        return "Yearly";
      default:
        return "Today's";
    }
  };

  return (
    <div className="mt-12">
      <Card className="border border-blue-gray-100 shadow-sm mb-5">
        <CardBody className="w-full flex justify-between lg:items-center items-start px-4 py-8 lg:flex-row flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Typography variant="h4" className="font-semibold text-blue-gray-900">
              Hello, Thek Restaurant 👋
            </Typography>
            <Typography variant="h6" className="font-normal text-blue-gray-600">
              Let's check your stats!
            </Typography>
          </div>
          <div className="lg:w-fit w-full">
            <Tabs value={selectedTab} className="lg:w-fit w-full">
              <TabsHeader>
                {tabs.map(({label, value}) => (
                  <Tab
                    className="px-5 whitespace-nowrap"
                    key={value}
                    value={value}
                    onClick={() => handleTabChange(value)}>
                    {label}
                  </Tab>
                ))}
              </TabsHeader>
            </Tabs>
          </div>
        </CardBody>
      </Card>
      <div className="mb-8 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
        <StatisticsCard
          color="gray"
          value={`₹ ${orderTotalAmount}`}
          title={`${getTitlePrefixByTab(selectedTab)} Sales`}
          icon={React.createElement(BanknotesIcon, {
            className: "w-6 h-6 text-white",
          })}
          footer={
            <Typography className="font-normal text-blue-gray-600">
              <strong className="text-green-500">+55%</strong>
              &nbsp;than last week
            </Typography>
          }
        />
        <StatisticsCard
          color="gray"
          value={`${numeral(totalCustomers).format("0a")}`}
          title={`${getTitlePrefixByTab(selectedTab)} Total Customers`}
          icon={React.createElement(UsersIcon, {
            className: "w-6 h-6 text-white",
          })}
          footer={
            <Typography className="font-normal text-blue-gray-600">
              <strong className="text-green-500">+55%</strong>
              &nbsp;than last week
            </Typography>
          }
        />
        <StatisticsCard
          color="gray"
          value={`${numeral(newUsersCount).format("0a")}`}
          title={`${getTitlePrefixByTab(selectedTab)} New Customers`}
          icon={React.createElement(UserIcon, {
            className: "w-6 h-6 text-white",
          })}
          footer={
            <Typography className="font-normal text-blue-gray-600">
              <strong className="text-green-500">+55%</strong>
              &nbsp;than last week
            </Typography>
          }
        />
        <StatisticsCard
          color="gray"
          value={`${numeral(returningUsersCount).format("0a")}`}
          title={`${getTitlePrefixByTab(selectedTab)} Returning Customers`}
          icon={React.createElement(UserPlusIcon, {
            className: "w-6 h-6 text-white",
          })}
          footer={
            <Typography className="font-normal text-blue-gray-600">
              <strong className="text-green-500">+55%</strong>
              &nbsp;than last week
            </Typography>
          }
        />
      </div>
      <Card className="border border-blue-gray-100 shadow-sm mb-5">
        <CardBody className="w-full flex justify-between lg:items-center items-start px-4 py-5 lg:flex-row flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Typography variant="h4" className="font-semibold text-blue-gray-900">
              Analytics Charts 💹
            </Typography>
          </div>
          <div className="lg:w-fit w-full">
            <Tabs value={activeChartTab} className="lg:w-fit w-full">
              <TabsHeader>
                {chartTabs.map(({label, value}) => (
                  <Tab
                    className="px-5 whitespace-nowrap"
                    key={value}
                    value={value}
                    onClick={() => handleChartTabChange(value)}>
                    {label}
                  </Tab>
                ))}
              </TabsHeader>
            </Tabs>
          </div>
        </CardBody>
      </Card>
      <div className="mb-8 grid grid-cols-1 gap-y-12 gap-x-6 md:grid-cols-2 ">
        <VisitorChart chartData={chartData} />
      </div>
      <div className="mb-4 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="overflow-hidden xl:col-span-2 border border-blue-gray-100 shadow-sm">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="m-0 flex items-center justify-between p-6">
            <div>
              <Typography variant="h6" color="blue-gray" className="mb-1">
                Projects
              </Typography>
              <Typography
                variant="small"
                className="flex items-center gap-1 font-normal text-blue-gray-600">
                <CheckCircleIcon strokeWidth={3} className="h-4 w-4 text-blue-gray-200" />
                <strong>30 done</strong> this month
              </Typography>
            </div>
            <Menu placement="left-start">
              <MenuHandler>
                <IconButton size="sm" variant="text" color="blue-gray">
                  <EllipsisVerticalIcon
                    strokeWidth={3}
                    fill="currenColor"
                    className="h-6 w-6"
                  />
                </IconButton>
              </MenuHandler>
              <MenuList>
                <MenuItem>Action</MenuItem>
                <MenuItem>Another Action</MenuItem>
                <MenuItem>Something else here</MenuItem>
              </MenuList>
            </Menu>
          </CardHeader>
          <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {["companies", "members", "budget", "completion"].map((el) => (
                    <th
                      key={el}
                      className="border-b border-blue-gray-50 py-3 px-6 text-left">
                      <Typography
                        variant="small"
                        className="text-[11px] font-medium uppercase text-blue-gray-400">
                        {el}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projectsTableData.map(
                  ({img, name, members, budget, completion}, key) => {
                    const className = `py-3 px-5 ${
                      key === projectsTableData.length - 1
                        ? ""
                        : "border-b border-blue-gray-50"
                    }`;

                    return (
                      <tr key={name}>
                        <td className={className}>
                          <div className="flex items-center gap-4">
                            <Avatar src={img} alt={name} size="sm" />
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-bold">
                              {name}
                            </Typography>
                          </div>
                        </td>
                        <td className={className}>
                          {members.map(({img, name}, key) => (
                            <Tooltip key={name} content={name}>
                              <Avatar
                                src={img}
                                alt={name}
                                size="xs"
                                variant="circular"
                                className={`cursor-pointer border-2 border-white ${
                                  key === 0 ? "" : "-ml-2.5"
                                }`}
                              />
                            </Tooltip>
                          ))}
                        </td>
                        <td className={className}>
                          <Typography
                            variant="small"
                            className="text-xs font-medium text-blue-gray-600">
                            {budget}
                          </Typography>
                        </td>
                        <td className={className}>
                          <div className="w-10/12">
                            <Typography
                              variant="small"
                              className="mb-1 block text-xs font-medium text-blue-gray-600">
                              {completion}%
                            </Typography>
                            <Progress
                              value={completion}
                              variant="gradient"
                              color={completion === 100 ? "green" : "blue"}
                              className="h-1"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </CardBody>
        </Card>
        <Card className="border border-blue-gray-100 shadow-sm">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="m-0 p-6">
            <Typography variant="h6" color="blue-gray" className="mb-2">
              Orders Overview
            </Typography>
            <Typography
              variant="small"
              className="flex items-center gap-1 font-normal text-blue-gray-600">
              <ArrowUpIcon strokeWidth={3} className="h-3.5 w-3.5 text-green-500" />
              <strong>24%</strong> this month
            </Typography>
          </CardHeader>
          <CardBody className="pt-0">
            {ordersOverviewData.map(({icon, color, title, description}, key) => (
              <div key={title} className="flex items-start gap-4 py-3">
                <div
                  className={`relative p-1 after:absolute after:-bottom-6 after:left-2/4 after:w-0.5 after:-translate-x-2/4 after:bg-blue-gray-50 after:content-[''] ${
                    key === ordersOverviewData.length - 1 ? "after:h-0" : "after:h-4/6"
                  }`}>
                  {React.createElement(icon, {
                    className: `!w-5 !h-5 ${color}`,
                  })}
                </div>
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="block font-medium">
                    {title}
                  </Typography>
                  <Typography
                    as="span"
                    variant="small"
                    className="text-xs font-medium text-blue-gray-500">
                    {description}
                  </Typography>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default Home;
