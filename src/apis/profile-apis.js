import supabase from "@/configs/supabase";

const restaurantId = localStorage.getItem("restaurants_id");
export async function getRestaurant() {
  try {
    const {data, error} = await supabase
      .from("restaurants")
      .select("*")
      .eq("id", restaurantId)
      .single();

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
