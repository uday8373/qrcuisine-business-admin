import React from "react";
import {Card, CardBody, CardHeader, Typography} from "@material-tailwind/react";
import Chart from "react-apexcharts";
import {ChartLine} from "lucide-react";

export default function VisitorChart({chartData}) {
  const chartConfig = {
    type: "area",
    height: 350,
    series: [
      {
        name: "Website Visits",
        data: chartData.website_visit,
      },
      {
        name: "Booked",
        data: chartData.booked_count,
      },
      {
        name: "Checkout",
        data: chartData.checkout_count,
      },
      {
        name: "Order Placed",
        data: chartData.place_order_count,
      },
      {
        name: "Order Confirmed",
        data: chartData.order_confirm_count,
      },
      {
        name: "Order Preparing",
        data: chartData.order_preparing_count,
      },
      {
        name: "Order Delivered",
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
        "#f44336",
        "#9c27b0",
        "#3f51b5",
        "#03a9f4",
        "#4caf50",
        "#607d8b",
        "#ffc107",
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
          gradientToColors: ["#1E40AF"], // Gradient fades to this color
          inverseColors: false,
          opacityFrom: 0.5, // Opacity at the top of the gradient
          opacityTo: 0, // Opacity at the bottom of the gradient
          stops: [0, 100], // Gradient stops, controlling the fade
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
        <div className="w-max rounded-lg bg-gray-900 p-4 text-white">
          <ChartLine className="h-8 w-8" />
        </div>
        <div>
          <Typography variant="h6" color="blue-gray">
            Page Visit Analysis Chart
          </Typography>
          <Typography variant="small" color="gray" className="max-w-sm font-normal">
            In this chart, you can see the numeral number of every page that customer
            visits.
          </Typography>
        </div>
      </CardHeader>
      <CardBody className="px-2 pb-0">
        <Chart {...chartConfig} />
      </CardBody>
    </Card>
  );
}
