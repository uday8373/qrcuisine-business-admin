import supabase from "@/configs/supabase";
import moment from "moment";

const restaurantId = localStorage.getItem("restaurants_id");

export async function getOrdersApi(timeRange) {
  try {
    let currentStartDate;
    let currentEndDate;
    let previousStartDate;
    let previousEndDate;

    switch (timeRange) {
      case "today":
        currentStartDate = moment().startOf("day").format("YYYY-MM-DD");
        currentEndDate = moment().add(1, "day").startOf("day").format("YYYY-MM-DD");
        previousStartDate = moment()
          .subtract(1, "day")
          .startOf("day")
          .format("YYYY-MM-DD");
        previousEndDate = moment().startOf("day").format("YYYY-MM-DD");
        break;
      case "week":
        currentStartDate = moment().startOf("week").format("YYYY-MM-DD");
        currentEndDate = moment().endOf("week").add(1, "day").format("YYYY-MM-DD");
        previousStartDate = moment()
          .subtract(1, "week")
          .startOf("week")
          .format("YYYY-MM-DD");
        previousEndDate = moment()
          .subtract(1, "week")
          .endOf("week")
          .add(1, "day")
          .format("YYYY-MM-DD");
        break;
      case "month":
        currentStartDate = moment().startOf("month").format("YYYY-MM-DD");
        currentEndDate = moment().endOf("month").add(1, "day").format("YYYY-MM-DD");
        previousStartDate = moment()
          .subtract(1, "month")
          .startOf("month")
          .format("YYYY-MM-DD");
        previousEndDate = moment()
          .subtract(1, "month")
          .endOf("month")
          .add(1, "day")
          .format("YYYY-MM-DD");
        break;
      case "year":
        currentStartDate = moment().startOf("year").format("YYYY-MM-DD");
        currentEndDate = moment().endOf("year").add(1, "day").format("YYYY-MM-DD");
        previousStartDate = moment()
          .subtract(1, "year")
          .startOf("year")
          .format("YYYY-MM-DD");
        previousEndDate = moment()
          .subtract(1, "year")
          .endOf("year")
          .add(1, "day")
          .format("YYYY-MM-DD");
        break;
      default:
        throw new Error("Invalid time range");
    }

    const {data: currentData, error: currentError} = await supabase
      .from("orders")
      .select("id, grand_amount, created_at")
      .eq("restaurant_id", restaurantId)
      .gte("created_at", currentStartDate)
      .lt("created_at", currentEndDate);

    if (currentError) {
      throw currentError;
    }

    const {data: previousData, error: previousError} = await supabase
      .from("orders")
      .select("id, grand_amount, created_at")
      .eq("restaurant_id", restaurantId)
      .gte("created_at", previousStartDate)
      .lt("created_at", previousEndDate);

    if (previousError) {
      throw previousError;
    }

    return {currentData, previousData};
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

export async function getUsersApi(timeRange) {
  try {
    let startDate, endDate, previousStartDate, previousEndDate;

    switch (timeRange) {
      case "today":
        startDate = moment().format("YYYY-MM-DD");
        endDate = moment().add(1, "day").format("YYYY-MM-DD");
        previousStartDate = moment().subtract(1, "day").format("YYYY-MM-DD");
        previousEndDate = moment().format("YYYY-MM-DD");
        break;
      case "week":
        startDate = moment().startOf("week").format("YYYY-MM-DD");
        endDate = moment().endOf("week").add(1, "day").format("YYYY-MM-DD");
        previousStartDate = moment()
          .subtract(1, "week")
          .startOf("week")
          .format("YYYY-MM-DD");
        previousEndDate = moment()
          .subtract(1, "week")
          .endOf("week")
          .add(1, "day")
          .format("YYYY-MM-DD");
        break;
      case "month":
        startDate = moment().startOf("month").format("YYYY-MM-DD");
        endDate = moment().endOf("month").add(1, "day").format("YYYY-MM-DD");
        previousStartDate = moment()
          .subtract(1, "month")
          .startOf("month")
          .format("YYYY-MM-DD");
        previousEndDate = moment()
          .subtract(1, "month")
          .endOf("month")
          .add(1, "day")
          .format("YYYY-MM-DD");
        break;
      case "year":
        startDate = moment().startOf("year").format("YYYY-MM-DD");
        endDate = moment().endOf("year").add(1, "day").format("YYYY-MM-DD");
        previousStartDate = moment()
          .subtract(1, "year")
          .startOf("year")
          .format("YYYY-MM-DD");
        previousEndDate = moment()
          .subtract(1, "year")
          .endOf("year")
          .add(1, "day")
          .format("YYYY-MM-DD");
        break;
      default:
        throw new Error("Invalid time range");
    }

    const {data: currentData, error: currentError} = await supabase
      .from("users")
      .select("id, deviceToken, is_active")
      .eq("restaurant_id", restaurantId)
      .gte("created_at", startDate)
      .lt("created_at", endDate);

    if (currentError) {
      throw currentError;
    }

    const {data: previousData, error: previousError} = await supabase
      .from("users")
      .select("id, deviceToken")
      .eq("restaurant_id", restaurantId)
      .gte("created_at", previousStartDate)
      .lt("created_at", previousEndDate);

    if (previousError) {
      throw previousError;
    }

    return {currentData, previousData};
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
        startDate = moment().subtract(7, "day").format("YYYY-MM-DD");
        endDate = moment().add(1, "day").format("YYYY-MM-DD");
        break;
      case "year":
        startDate = moment().subtract(12, "month").format("YYYY-MM-DD");
        endDate = moment().add(1, "day").format("YYYY-MM-DD");
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

export async function getUserChartApi(timeRange) {
  try {
    let startDate;
    let endDate;

    switch (timeRange) {
      case "week":
        startDate = moment().subtract(7, "day").format("YYYY-MM-DD");
        endDate = moment().add(1, "day").format("YYYY-MM-DD");
        break;
      case "year":
        startDate = moment().subtract(12, "month").format("YYYY-MM-DD");
        endDate = moment().add(1, "day").format("YYYY-MM-DD");
        break;
      default:
        throw new Error("Invalid time range");
    }

    const {data, error} = await supabase
      .from("users")
      .select("created_at, id, deviceToken")
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

export async function getRevenueChartApi(timeRange) {
  try {
    let startDate;
    let endDate;

    switch (timeRange) {
      case "week":
        startDate = moment().subtract(7, "day").format("YYYY-MM-DD");
        endDate = moment().add(1, "day").format("YYYY-MM-DD");
        break;
      case "year":
        startDate = moment().subtract(12, "month").format("YYYY-MM-DD");
        endDate = moment().add(1, "day").format("YYYY-MM-DD");
        break;
      default:
        throw new Error("Invalid time range");
    }

    const {data, error} = await supabase
      .from("orders")
      .select("created_at, id, grand_amount, total_amount, tax_amount, fooditem_ids")
      .eq("restaurant_id", restaurantId)
      .gte("created_at", startDate)
      .lt("created_at", endDate);

    if (error) {
      throw error;
    } else {
      console.log("data", data);
      return data;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}
