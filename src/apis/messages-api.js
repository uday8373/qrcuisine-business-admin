import supabase from "@/configs/supabase";

// Initialize real-time updates for messages
export function subscribeToMessages(callback) {
  const restaurantId = localStorage.getItem("restaurants_id");
  const channel = supabase
    .channel(`messages:restaurant_id=eq.${restaurantId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `restaurant_id=eq.${restaurantId}`,
      },
      (payload) => {
        callback("INSERT", payload.new);
      },
    )
    .subscribe();

  return channel;
}
export async function getMessageApis(searchQuery) {
  const restaurantId = localStorage.getItem("restaurants_id");
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const todayString = today.toISOString().split("T")[0];
  const tomorrowString = tomorrow.toISOString().split("T")[0];
  try {
    let query = supabase
      .from("messages")
      .select(
        `*, users(name), restaurants(restaurant_name, owner_name,logo), tables(table_no, id, is_booked, qr_image, is_available)`,
        {count: "exact"},
      )
      .eq("restaurant_id", restaurantId)
      .gte("created_at", todayString)
      .lt("created_at", tomorrowString)
      .limit(10);

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
  const restaurantId = localStorage.getItem("restaurants_id");
  try {
    const {error} = await supabase
      .from("messages")
      .update({is_read: true})
      .eq("restaurant_id", restaurantId)
      .eq("table_id", tableId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error marking messages as read:", error);
    throw error;
  }
}

export async function getMessageCounts() {
  const restaurantId = localStorage.getItem("restaurants_id");
  try {
    const {data, error} = await supabase
      .from("messages")
      .select("is_read")
      .eq("restaurant_id", restaurantId);

    if (error) {
      throw error;
    }

    const total = data.length;
    const available = data.filter((item) => item.is_read).length;
    const unAvailable = total - available;

    return {
      total,
      available,
      unAvailable,
    };
  } catch (error) {
    console.error("Error fetching table counts:", error);
    throw error;
  }
}
