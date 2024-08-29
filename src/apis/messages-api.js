import supabase from "@/configs/supabase";

const restaurantId = localStorage.getItem("restaurants_id");

export async function getMessageApis(page, pageSize, activeTab, searchQuery) {
  try {
    let query = supabase
      .from("messages")
      .select(
        `*, users(name) , restaurants(restaurant_name,owner_name) , tables(table_no) `,
      ) // for use pagination // {count: "exact"} users!inner(name)
      .eq("restaurant_id", restaurantId);
    //   .range((page - 1) * pageSize, page * pageSize - 1)
    //   .limit(pageSize);

    // if (activeTab !== "all") {
    //   query = query.eq("rating_star", activeTab);
    // }
    // if (searchQuery) {
    //   query = query.ilike("users.name", `%${searchQuery}%`);
    // }

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
