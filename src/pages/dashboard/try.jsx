import {useEffect, useState} from "react";

import {
  getOrdersApi,
  getRevenueChartApi,
  getUserChartApi,
  getUsersApi,
  getVisitorApi,
} from "@/apis/analytic-apis";
import moment from "moment";

const chartTabs = [
  {label: "Last 7 Days", value: "week"},
  {label: "Last 12 Months", value: "year"},
];

export function Home() {
  const [activeChartTab, setActiveChartTab] = useState("week");
  const [revenueChartData, setRevenueChartData] = useState({
    labels: [],
    totalRevenue: [],
  });
  const [trendingFoods, setTrendingFoods] = useState({
    food_name: "",
    food_image: "",
    food_sold_count: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [revenueChartResponse] = await Promise.all([
          getRevenueChartApi(activeChartTab),
        ]);
        if (!revenueChartResponse) {
          throw new Error("Failed to fetch data");
        }

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
      } catch (error) {
        throw error;
      }
    };
    fetchData();
  }, [activeChartTab]);
}
