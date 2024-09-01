import React, {useEffect, useState} from "react";
import {
  Typography,
  Card,
  CardBody,
  Tabs,
  Tab,
  TabsHeader,
} from "@material-tailwind/react";

import {getVisitorApi} from "@/apis/analytic-apis";
import numeral from "numeral";
import VisitorChart from "@/components/charts/visitor-chart";

const chartTabs = [
  {label: "This Week", value: "week"},
  {label: "This Year", value: "year"},
];

export function Home() {
  const [activeChartTab, setActiveChartTab] = useState("week");
  const [visitorData, setVisitorData] = useState({
    website_visit: 0,
    booked_count: 0,
    checkout_count: 0,
    place_order_count: 0,
    order_confirm_count: 0,
    order_preparing_count: 0,
    order_delivered_count: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [visitorResponse] = await Promise.all([getVisitorApi(activeChartTab)]);
        if (!visitorResponse) {
          throw new Error("Failed to fetch data");
        } else {
          console.log("data", visitorResponse);
        }
      } catch (error) {
        throw error;
      }
    };
    fetchData();
  }, [activeChartTab]);

  const handleChartTabChange = (value) => {
    setActiveChartTab(value);
  };

  return (
    <div className="mt-12">
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
        <VisitorChart />
      </div>
    </div>
  );
}

export default Home;
