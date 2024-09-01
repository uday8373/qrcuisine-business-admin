import supabase from "@/configs/supabase";
import moment from "moment";

const restaurantId = localStorage.getItem("restaurants_id");

export async function getOrdersApi(timeRange) {
  try {
    let startDate;
    let endDate;

    switch (timeRange) {
      case "today":
        // startDate = moment.utc().startOf("day").toISOString();
        // endDate = moment.utc().endOf("day").toISOString();
        startDate = moment().format("YYYY-MM-DD");
        endDate = moment().add(1, "day").format("YYYY-MM-DD");
        break;
      case "week":
        startDate = moment().add(-7, "day").format("YYYY-MM-DD");
        endDate = moment().format("YYYY-MM-DD");
        break;
      case "month":
        startDate = moment().subtract(1, "months").startOf("month").format("YYYY-MM-DD");
        endDate = moment().subtract(1, "months").endOf("month").format("YYYY-MM-DD");
        break;
      case "year":
        startDate = moment.utc().startOf("year").toISOString();
        endDate = moment.utc().endOf("year").toISOString();
        break;
      default:
        throw new Error("Invalid time range");
    }
    console.log("value", timeRange);
    console.log("startDate", startDate);
    console.log("endDate", endDate);

    const {data, error} = await supabase
      .from("orders")
      .select("id, grand_amount, created_at")
      .eq("restaurant_id", restaurantId)
      .gte("created_at", startDate)
      .lt("created_at", endDate);

    if (error) {
      throw error;
    } else {
      return data;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

export async function getUsersApi(timeRange) {
  try {
    const today = new Date();
    let startDate;
    let endDate;

    switch (timeRange) {
      case "today":
        startDate = new Date(today.setHours(0, 0, 0, 0));
        endDate = new Date(today.setHours(23, 59, 59, 999));
        break;
      case "week":
        startDate = new Date(today.setHours(0, 0, 0, 0));
        startDate.setDate(today.getDate() - today.getDay());
        endDate = new Date(today.setHours(23, 59, 59, 999));
        endDate.setDate(startDate.getDate() + 7);
        break;
      case "month":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        break;
      case "year":
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today.getFullYear() + 1, 0, 1);
        break;
      default:
        throw new Error("Invalid time range");
    }

    const {data, error} = await supabase
      .from("users")
      .select("id, deviceToken")
      .eq("restaurant_id", restaurantId)
      .gte("created_at", startDate.toISOString())
      .lt("created_at", endDate.toISOString());

    if (error) {
      throw error;
    } else {
      return data;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

export async function getVisitorApi(timeRange) {
  try {
    let startDate;
    let endDate;

    switch (timeRange) {
      case "week":
        startDate = moment.utc().startOf("isoWeek").toISOString();
        endDate = moment.utc().endOf("isoWeek").toISOString();
        break;
      case "year":
        startDate = moment.utc().startOf("year").toISOString();
        endDate = moment.utc().endOf("year").toISOString();
        break;
      default:
        throw new Error("Invalid time range");
    }

    const {data, error} = await supabase
      .from("visitors")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .gte("created_at", startDate)
      .lt("created_at", endDate);

    if (error) {
      throw error;
    } else {
      return data;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}
