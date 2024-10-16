import supabase from "@/configs/supabase";

export async function getActivityTableApis() {
  const restaurantId = localStorage.getItem("restaurants_id");

  try {
    const {data, error} = await supabase
      .from("tables")
      .select(`*,messages(*)`)
      .eq("restaurant_id", restaurantId);

    if (error) {
      throw error;
    } else {
      return {data};
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

export async function getOrderTableApis() {
  const restaurantId = localStorage.getItem("restaurants_id"); // Ensure this is a UUID

  try {
    const {data, error} = await supabase.rpc("group_orders_by_date", {
      restaurant_id: restaurantId,
    });

    if (error) {
      throw error;
    } else {
      return {data};
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}
