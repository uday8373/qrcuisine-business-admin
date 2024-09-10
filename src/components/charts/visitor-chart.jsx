import React from "react";
import {Card, CardBody, CardHeader, Typography} from "@material-tailwind/react";
import Chart from "react-apexcharts";
import {PresentationChartLineIcon} from "@heroicons/react/24/solid";

export default function VisitorChart({chartData}) {
  const chartConfig = {
    type: "area",
    height: 320,
    series: [
      {
        name: "Menu Page",
        data: chartData.website_visit,
      },
      {
        name: "Booking Page",
        data: chartData.booked_count,
      },
      {
        name: "Checkout Page",
        data: chartData.checkout_count,
      },
      {
        name: "Order Placed Page",
        data: chartData.place_order_count,
      },
      {
        name: "Order Confirmed Page",
        data: chartData.order_confirm_count,
      },
      {
        name: "Order Preparing Page",
        data: chartData.order_preparing_count,
      },
      {
        name: "Order Delivered Page",
        data: chartData.order_delivered_count,
      },
    ],
    options: {
      chart: {
        toolbar: {
          show: true,
        },
      },
      title: {
        show: false,
      },
      dataLabels: {
        enabled: false,
      },
      colors: [
        "#71717A",
        "#F5A524",
        "#7EE7FC",
        "#006FEE",
        "#7828C8",
        "#FF4ECD",
        "#17C964",
      ],
      stroke: {
        lineCap: "round",
        curve: "smooth",
      },
      markers: {
        size: 0,
      },
      xaxis: {
        categories: chartData.labels,
        axisTicks: {
          show: false,
        },
        axisBorder: {
          show: false,
        },
        labels: {
          style: {
            colors: "#616161",
            fontSize: "12px",
            fontFamily: "inherit",
            fontWeight: 400,
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: "#616161",
            fontSize: "12px",
            fontFamily: "inherit",
            fontWeight: 400,
          },
        },
      },
      grid: {
        show: true,
        borderColor: "#dddddd",
        strokeDashArray: 5,
        xaxis: {
          lines: {
            show: true,
          },
        },
        padding: {
          top: 5,
          right: 20,
        },
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "light",
          type: "vertical",
          shadeIntensity: 1,
          gradientToColors: ["#1E40AF"],
          inverseColors: false,
          opacityFrom: 0.5,
          opacityTo: 0,
          stops: [0, 100],
        },
      },
      tooltip: {
        theme: "light",
      },
    },
  };

  return (
    <Card className="border border-blue-gray-100 shadow-sm">
      <CardHeader
        floated={false}
        shadow={false}
        color="transparent"
        className="flex flex-col gap-4 rounded-none md:flex-row md:items-center">
        <div className="w-max rounded-xl bg-gray-900 p-3 text-white">
          <PresentationChartLineIcon className="h-6 w-6" />
        </div>
        <div>
          <Typography variant="h6" color="blue-gray">
            Customers Page Visits
          </Typography>
          <Typography variant="small" color="gray" className="max-w-sm font-normal">
            Total visits on the website
          </Typography>
        </div>
      </CardHeader>
      <CardBody className="px-2 pb-0">
        <Chart {...chartConfig} />
      </CardBody>
    </Card>
  );
}
