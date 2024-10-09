import supabase from "@/configs/supabase";

export async function getActivityTableApis() {
  const restaurantId = localStorage.getItem("restaurants_id");

  console.log("object", restaurantId);
  try {
    const {data, error} = await supabase
      .from("tables")
      .select(`*`)
      .eq("restaurant_id", restaurantId);

    if (error) {
      throw error;
    } else {
      console.log("object", data);
      return {data};
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}
export async function getOrderTableApis() {
  const restaurantId = localStorage.getItem("restaurants_id");

  console.log("object", restaurantId);
  try {
    const {data, error} = await supabase
      .from("orders")
      .select(`*,table_id(*),waiter_id(*),status_id(*),user_id(*),cancelled_reason(*)`)
      .eq("restaurant_id", restaurantId);

    if (error) {
      throw error;
    } else {
      console.log("object", data);
      return {data};
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}
