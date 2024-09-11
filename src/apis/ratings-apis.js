import supabase from "@/configs/supabase";

export async function getRatingsApis(page, pageSize, activeTab, searchQuery) {
  const restaurantId = localStorage.getItem("restaurants_id");
  try {
    let query = supabase
      .from("ratings")
      .select(`*, users!inner(name), orders(order_id) `, {count: "exact"})
      .eq("restaurant_id", restaurantId)
      .range((page - 1) * pageSize, page * pageSize - 1)
      .limit(pageSize);

    if (activeTab !== "all") {
      query = query.eq("rating_star", activeTab);
    }
    if (searchQuery) {
      query = query.ilike("users.name", `%${searchQuery}%`);
    }

    const {data, count, error} = await query;
    if (error) {
      throw error;
    } else {
      return {data, count};
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}
