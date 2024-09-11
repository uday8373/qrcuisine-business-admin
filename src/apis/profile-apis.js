import supabase from "@/configs/supabase";

export async function getRestaurant() {
  const restaurantId = localStorage.getItem("restaurants_id");
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
