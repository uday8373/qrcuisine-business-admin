import supabase from "@/configs/supabase";

const restaurantId = localStorage.getItem("restaurants_id");

export async function getMessageApis(searchQuery) {
  try {
    let query = supabase
      .from("messages")
      .select(
        `*, users(name), restaurants(restaurant_name, owner_name), tables(table_no, id, is_booked, qr_image, is_available)`,
        {count: "exact"},
      )
      .eq("restaurant_id", restaurantId);

    // Apply search query if provided
    if (searchQuery) {
      query = query.ilike("tables.table_no", `%${searchQuery}%`);
    }

    // Fetch all messages without pagination
    const {data: messages, count, error} = await query;

    if (error) {
      throw error;
    } else {
      return {data: messages, count};
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

export async function markMessagesAsRead(tableId) {
  try {
    const {error} = await supabase
      .from("messages")
      .update({is_read: true})
      .eq("restaurant_id", restaurantId)
      .eq("table_id", tableId); // Use table_id instead of table_no

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error marking messages as read:", error);
    throw error;
  }
}
