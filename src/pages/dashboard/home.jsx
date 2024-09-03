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
import {projectsTableData, ordersOverviewData} from "@/data";
import {
  BanknotesIcon,
  ChartBarSquareIcon,
  CheckCircleIcon,
  ClockIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  UserIcon,
  UserPlusIcon,
  UsersIcon,
} from "@heroicons/react/24/solid";
import {
  getOrdersApi,
  getRevenueChartApi,
  getUserChartApi,
  getUsersApi,
  getVisitorApi,
} from "@/apis/analytic-apis";
import VisitorChart from "@/components/charts/visitor-chart";
import moment from "moment";
import UserChart from "@/components/charts/user-chart";
import RevenueChart from "@/components/charts/revenue-chart";

const tabs = [
  {label: "Today", value: "today"},
  {label: "This Week", value: "week"},
  {label: "This Month", value: "month"},
  {label: "This Year", value: "year"},
];

const chartTabs = [
  {label: "Last 7 Days", value: "week"},
  {label: "Last 12 Months", value: "year"},
];

export function Home() {
  const [orderTotalAmount, setOrderTotalAmount] = useState(0);
  const [orderTotalAmountChange, setOrderTotalAmountChange] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalCustomersChange, setTotalCustomersChange] = useState(0);
  const [newUsersCount, setNewUsersCount] = useState(0);
  const [newUsersChange, setNewUsersChange] = useState(0);
  const [returningUsersCount, setReturningUsersCount] = useState(0);
  const [returningUsersChange, setReturningUsersChange] = useState(0);
  const [activeUsersCount, setActiveUsersCount] = useState(0);
  const [activeUsersChange, setActiveUsersChange] = useState(0);
  const [peakOrderingHour, setPeakOrderingHour] = useState();
  const [lastLeakOrderingHour, setLastPeakOrderingHour] = useState();
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
  const [userChartData, setUserChartData] = useState({
    labels: [],
    totalUsersCount: [],
    newUsersCount: [],
    returningUsersCount: [],
  });
  const [revenueChartData, setRevenueChartData] = useState({
    labels: [],
    totalRevenue: [],
  });
  const [trendingFoods, setTrendingFoods] = useState([
    {
      food_name: "",
      food_image: "",
      count: 0,
    },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          orderResponse,
          userResponse,
          visitorResponse,
          userChartResponse,
          revenueChartResponse,
        ] = await Promise.all([
          getOrdersApi(selectedTab),
          getUsersApi(selectedTab),
          getVisitorApi(activeChartTab),
          getUserChartApi(activeChartTab),
          getRevenueChartApi(activeChartTab),
        ]);
        if (
          !orderResponse ||
          !userResponse ||
          !visitorResponse ||
          !userChartResponse ||
          !revenueChartResponse
        ) {
          throw new Error("Failed to fetch data");
        }

        // Total Revenue Statistics
        const totalAmount = orderResponse.currentData.reduce((accumulator, order) => {
          return accumulator + order.grand_amount;
        }, 0);
        setOrderTotalAmount(totalAmount);

        const previousTotalAmount = orderResponse.previousData.reduce(
          (accumulator, order) => {
            return accumulator + order.grand_amount;
          },
          0,
        );
        const orderTotalAmountChange = calculatePercentageChange(
          totalAmount,
          previousTotalAmount,
        );
        setOrderTotalAmountChange(orderTotalAmountChange);

        // Peak Ordering Hour Statistics
        const orderHoursMap = {};

        orderResponse.currentData.forEach((order) => {
          const hour = moment(order.created_at).hour(); // Get the hour of the order
          orderHoursMap[hour] = (orderHoursMap[hour] || 0) + 1;
        });

        // Find the peak ordering hour
        const peakHour = Object.keys(orderHoursMap).reduce(
          (a, b) => (orderHoursMap[a] > orderHoursMap[b] ? a : b),
          0,
        );

        // Find the last peak ordering hour
        const lastPeakHour = Object.keys(orderHoursMap).reduce(
          (a, b) => (orderHoursMap[a] < orderHoursMap[b] ? a : b),
          0,
        );

        // Convert hours to 12-hour format with AM/PM
        const peakHourFormatted = moment(peakHour, "HH").format("h A");
        const lastPeakHourFormatted = moment(lastPeakHour, "HH").format("h A");

        // Determine the range of peak ordering hours
        const peakHourEnd = (parseInt(peakHour) + 1) % 24;
        const peakHourEndFormatted = moment(peakHourEnd, "HH").format("h A");
        const peakOrderingHourRange = `${peakHourFormatted} to ${peakHourEndFormatted}`;

        // Determine the range of the last peak ordering hours
        const lastPeakHourEnd = (parseInt(lastPeakHour) + 1) % 24;
        const lastPeakHourEndFormatted = moment(lastPeakHourEnd, "HH").format("h A");
        const lastPeakOrderingHourRange = `${lastPeakHourFormatted} to ${lastPeakHourEndFormatted}`;

        setPeakOrderingHour(peakOrderingHourRange);
        setLastPeakOrderingHour(lastPeakOrderingHourRange);

        // Total Customers Statistics
        const uniqueCustomers = new Set(
          userResponse.currentData.map((user) => user.deviceToken),
        );
        const previousUniqueCustomers = new Set(
          userResponse.previousData.map((user) => user.deviceToken),
        );
        setTotalCustomers(uniqueCustomers.size);

        const totalCustomersChange = calculatePercentageChange(
          uniqueCustomers.size,
          previousUniqueCustomers.size,
        );
        setTotalCustomersChange(totalCustomersChange);

        // New Customers and Returning Statistics
        const {newUsers, returningUsers} = calculateNewAndReturningUsers(
          userResponse.currentData,
        );
        const {newUsers: previousNewUsers, returningUsers: previousReturningUsers} =
          calculateNewAndReturningUsers(userResponse.previousData);

        setNewUsersCount(newUsers);
        setReturningUsersCount(returningUsers);

        const newUsersChange = calculatePercentageChange(newUsers, previousNewUsers);
        const returningUsersChange = calculatePercentageChange(
          returningUsers,
          previousReturningUsers,
        );

        setNewUsersChange(newUsersChange);
        setReturningUsersChange(returningUsersChange);

        // Active Customers Statistics
        const activeUsersCount = userResponse.currentData.filter(
          (user) => user.is_active,
        ).length;
        const previousActiveUsersCount = userResponse.previousData.filter(
          (user) => user.is_active,
        ).length;

        setActiveUsersCount(activeUsersCount);

        const activeUsersChange = calculatePercentageChange(
          activeUsersCount,
          previousActiveUsersCount,
        );

        setActiveUsersChange(activeUsersChange);

        // Visitor Chart Statistics
        const initializeDataMap = (keys, defaultValue) =>
          keys.reduce((acc, key) => {
            acc[key] = {...defaultValue};
            return acc;
          }, {});

        // Helper function to process visitor data
        const processVisitorData = (dataMap, item) => {
          const {
            website_visit,
            booked_count,
            checkout_count,
            place_order_count,
            order_confirm_count,
            order_preparing_count,
            order_delivered_count,
          } = item;

          dataMap.websiteVisits += website_visit;
          dataMap.bookedCounts += booked_count;
          dataMap.checkoutCounts += checkout_count;
          dataMap.placeOrderCounts += place_order_count;
          dataMap.orderConfirmCounts += order_confirm_count;
          dataMap.orderPreparingCounts += order_preparing_count;
          dataMap.orderDeliveredCounts += order_delivered_count;
        };

        // Process visitor data based on active chart tab
        const isWeekly = activeChartTab === "week";
        const timeFormat = isWeekly ? "ddd" : "MMM";
        const dataKeys = isWeekly
          ? Array.from({length: 7}, (_, i) =>
              moment().subtract(i, "days").format(timeFormat),
            ).reverse()
          : Array.from({length: 12}, (_, i) =>
              moment().subtract(i, "months").format(timeFormat),
            ).reverse();

        const visitorDataMap = initializeDataMap(dataKeys, {
          websiteVisits: 0,
          bookedCounts: 0,
          checkoutCounts: 0,
          placeOrderCounts: 0,
          orderConfirmCounts: 0,
          orderPreparingCounts: 0,
          orderDeliveredCounts: 0,
        });

        visitorResponse.forEach((item) => {
          const dateKey = moment(item.created_at).format(timeFormat);
          if (visitorDataMap[dateKey]) {
            processVisitorData(visitorDataMap[dateKey], item);
          }
        });

        // Prepare Visitor chart data
        const chartData = dataKeys.map((key) => ({
          label: key,
          websiteVisits: visitorDataMap[key].websiteVisits,
          bookedCounts: visitorDataMap[key].bookedCounts,
          checkoutCounts: visitorDataMap[key].checkoutCounts,
          placeOrderCounts: visitorDataMap[key].placeOrderCounts,
          orderConfirmCounts: visitorDataMap[key].orderConfirmCounts,
          orderPreparingCounts: visitorDataMap[key].orderPreparingCounts,
          orderDeliveredCounts: visitorDataMap[key].orderDeliveredCounts,
        }));

        setChartData({
          website_visit: chartData.map((data) => data.websiteVisits),
          checkout_count: chartData.map((data) => data.checkoutCounts),
          booked_count: chartData.map((data) => data.bookedCounts),
          place_order_count: chartData.map((data) => data.placeOrderCounts),
          order_confirm_count: chartData.map((data) => data.orderConfirmCounts),
          order_preparing_count: chartData.map((data) => data.orderPreparingCounts),
          order_delivered_count: chartData.map((data) => data.orderDeliveredCounts),
          labels: dataKeys,
        });

        // User Chart Statistics
        const userChartDataMap = initializeDataMap(dataKeys, {
          totalUsers: 0,
          newUsers: 0,
          returningUsers: 0,
        });

        userChartResponse.forEach((item) => {
          const dateKey = moment(item.created_at).format(timeFormat);
          if (userChartDataMap[dateKey]) {
            userChartDataMap[dateKey].totalUsers++;
            item.isNewUser
              ? userChartDataMap[dateKey].newUsers++
              : userChartDataMap[dateKey].returningUsers++;
          }
        });

        // Prepare user chart data
        const userChartData = dataKeys.map((key) => ({
          label: key,
          totalUsers: userChartDataMap[key].totalUsers,
          newUsers: userChartDataMap[key].newUsers,
          returningUsers: userChartDataMap[key].returningUsers,
        }));

        setUserChartData({
          labels: dataKeys,
          totalUsersCount: userChartData.map((data) => data.totalUsers),
          newUsersCount: userChartData.map((data) => data.newUsers),
          returningUsersCount: userChartData.map((data) => data.returningUsers),
        });

        // Revenue Chart Statistics
        const revenueChartDataMap = initializeDataMap(dataKeys, {
          totalRevenue: 0,
        });

        revenueChartResponse.forEach((item) => {
          const dateKey = moment(item.created_at).format(timeFormat);
          if (revenueChartDataMap[dateKey]) {
            revenueChartDataMap[dateKey].totalRevenue += item.grand_amount;
          }
        });

        // Prepare revenue chart data
        const revenueChartData = dataKeys.map((key) => ({
          label: key,
          totalRevenue: revenueChartDataMap[key].totalRevenue,
        }));

        setRevenueChartData({
          labels: dataKeys,
          totalRevenue: revenueChartData.map((data) => data.totalRevenue),
        });

        // Calculate trending foods
        const foodCountMap = {};
        revenueChartResponse.forEach((order) => {
          const foodItems = order.fooditem_ids;
          foodItems.forEach((food) => {
            if (foodCountMap[food.food_name]) {
              foodCountMap[food.food_name].count += food.quantity;
            } else {
              foodCountMap[food.food_name] = {
                food_name: food.food_name,
                food_image: food.image,
                count: food.quantity,
              };
            }
          });
        });

        const trendingFoodsArray = Object.values(foodCountMap).sort(
          (a, b) => b.count - a.count,
        );

        setTrendingFoods(trendingFoodsArray.slice(0, 5));
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

  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const calculateNewAndReturningUsers = (data) => {
    const deviceTokenCount = {};
    data.forEach((user) => {
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

    return {newUsers, returningUsers};
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
      <div className="mb-8 grid gap-y-6 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
        <StatisticsCard
          color="gray"
          value={`₹ ${orderTotalAmount.toFixed(2)}`}
          title={`${getTitlePrefixByTab(selectedTab)} Sales`}
          icon={React.createElement(BanknotesIcon, {
            className: "w-6 h-6 text-white",
          })}
          footer={
            <Typography className="font-normal text-blue-gray-600">
              <strong
                className={
                  orderTotalAmountChange >= 0 ? "text-green-500" : "text-red-500"
                }>
                {orderTotalAmountChange >= 0 ? "+" : ""}
                {orderTotalAmountChange.toFixed(2)}%
              </strong>
              &nbsp;than last period
            </Typography>
          }
        />
        <StatisticsCard
          color="gray"
          value={`${totalCustomers.toFixed(0)}`}
          title={`${getTitlePrefixByTab(selectedTab)} Total Customers`}
          icon={React.createElement(UsersIcon, {
            className: "w-6 h-6 text-white",
          })}
          footer={
            <Typography className="font-normal text-blue-gray-600">
              <strong
                className={totalCustomersChange >= 0 ? "text-green-500" : "text-red-500"}>
                {totalCustomersChange >= 0 ? "+" : ""}
                {totalCustomersChange.toFixed(2)}%
              </strong>
              &nbsp;than last period
            </Typography>
          }
        />
        <StatisticsCard
          color="gray"
          value={`${newUsersCount.toFixed(0)}`}
          title={`${getTitlePrefixByTab(selectedTab)} New Customers`}
          icon={React.createElement(UserIcon, {
            className: "w-6 h-6 text-white",
          })}
          footer={
            <Typography className="font-normal text-blue-gray-600">
              <strong className={newUsersChange >= 0 ? "text-green-500" : "text-red-500"}>
                {newUsersChange >= 0 ? "+" : ""}
                {newUsersChange.toFixed(2)}%
              </strong>
              &nbsp;than last period
            </Typography>
          }
        />
        <StatisticsCard
          color="gray"
          value={`${returningUsersCount.toFixed(0)}`}
          title={`${getTitlePrefixByTab(selectedTab)} Returning Customers`}
          icon={React.createElement(UserPlusIcon, {
            className: "w-6 h-6 text-white",
          })}
          footer={
            <Typography className="font-normal text-blue-gray-600">
              <strong
                className={returningUsersChange >= 0 ? "text-green-500" : "text-red-500"}>
                {returningUsersChange >= 0 ? "+" : ""}
                {returningUsersChange.toFixed(2)}%
              </strong>
              &nbsp;than last period
            </Typography>
          }
        />
        <StatisticsCard
          color="gray"
          value={`${activeUsersCount.toFixed(0)}`}
          title={`${getTitlePrefixByTab(selectedTab)} Active Customers`}
          icon={React.createElement(UserCircleIcon, {
            className: "w-6 h-6 text-white",
          })}
          footer={
            <Typography className="font-normal text-blue-gray-600">
              <strong
                className={activeUsersChange >= 0 ? "text-green-500" : "text-red-500"}>
                {activeUsersChange >= 0 ? "+" : ""}
                {activeUsersChange.toFixed(2)}%
              </strong>
              &nbsp;than last period
            </Typography>
          }
        />

        <StatisticsCard
          color="gray"
          value={peakOrderingHour}
          title={`${getTitlePrefixByTab(selectedTab)} Peak Ordering Hour`}
          icon={React.createElement(ClockIcon, {
            className: "w-6 h-6 text-white",
          })}
          footer={
            <Typography className="font-normal text-blue-gray-600">
              last peak hour &nbsp;
              <strong className="text-green-500">{lastLeakOrderingHour}</strong>
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
      <div className="mb-8 grid grid-cols-1 gap-y-6 gap-x-6 md:grid-cols-2 ">
        <VisitorChart chartData={chartData} />
        <UserChart chartData={userChartData} />
        <RevenueChart chartData={revenueChartData} />
        <Card className="overflow-hidden col-span-1 border border-blue-gray-100 shadow-sm">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="flex flex-col gap-4 rounded-none md:flex-row md:items-center">
            <div className="w-max rounded-xl bg-gray-900 p-3 text-white">
              <ShoppingBagIcon className="h-6 w-6" />
            </div>
            <div>
              <Typography variant="h6" color="blue-gray">
                Top Saleing Food Items
              </Typography>
              <Typography variant="small" color="gray" className="max-w-sm font-normal">
                Show the top sale items
              </Typography>
            </div>
          </CardHeader>
          <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
            <table className="w-full  table-auto">
              <thead>
                <tr>
                  {["Food Name", "Sold Count"].map((el) => (
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
                {trendingFoods &&
                  trendingFoods?.map(({food_image, food_name, count}, key) => {
                    const className = `py-3 px-5 ${
                      key === trendingFoods.length - 1
                        ? ""
                        : "border-b border-blue-gray-50"
                    }`;

                    return (
                      <tr key={key}>
                        <td className={className}>
                          <div className="flex items-center gap-4">
                            <Avatar src={food_image} alt={food_name} size="sm" />
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-bold">
                              {food_name}
                            </Typography>
                          </div>
                        </td>

                        <td className={className}>
                          <Typography
                            variant="small"
                            className="text-xs font-medium text-blue-gray-600 text-center">
                            {count}
                          </Typography>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default Home;
