import supabase from "@/configs/supabase";

// Initialize real-time updates for messages
export function subscribeToMessages(callback) {
  const restaurantId = localStorage.getItem("restaurants_id");
  const channel = supabase
    .channel(`messagesEvent`)
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
    .subscribe((status) => {
      console.log(`Subscription status: ${status}`); // Log subscription status
    });

  return channel;
}
export async function getMessageApis() {
  const restaurantId = localStorage.getItem("restaurants_id");

  try {
    let query = supabase
      .from("messages")
      .select(
        `*, users(name,mobile), restaurants(restaurant_name, owner_name,logo), tables(table_no, id, is_booked, qr_image, is_available),orders(*), user_id(*)`,
        {count: "exact"},
      )
      .eq("restaurant_id", restaurantId);

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
