import supabase from "@/configs/supabase";

const restaurantId = localStorage.getItem("restaurants_id");

export async function getOrdersApi(timeRange) {
  try {
    const today = new Date();
    let startDate;
    let endDate;

    switch (timeRange) {
      case "today":
        startDate = new Date(today);
        endDate = new Date(today);
        endDate.setDate(today.getDate() + 1);
        break;
      case "week":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay()); // Start of the week
        endDate = new Date(today);
        endDate.setDate(startDate.getDate() + 7); // End of the week
        break;
      case "month":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1); // Start of the month
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 1); // Start of the next month
        break;
      case "year":
        startDate = new Date(today.getFullYear(), 0, 1); // Start of the year
        endDate = new Date(today.getFullYear() + 1, 0, 1); // Start of the next year
        break;
      default:
        throw new Error("Invalid time range");
    }

    const {data, error} = await supabase
      .from("orders")
      .select("id, grand_amount")
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

export async function getUsersApi(timeRange) {
  try {
    const today = new Date();
    let startDate;
    let endDate;

    switch (timeRange) {
      case "today":
        startDate = new Date(today);
        endDate = new Date(today);
        endDate.setDate(today.getDate() + 1);
        break;
      case "week":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay()); // Start of the week
        endDate = new Date(today);
        endDate.setDate(startDate.getDate() + 7); // End of the week
        break;
      case "month":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1); // Start of the month
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 1); // Start of the next month
        break;
      case "year":
        startDate = new Date(today.getFullYear(), 0, 1); // Start of the year
        endDate = new Date(today.getFullYear() + 1, 0, 1); // Start of the next year
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
