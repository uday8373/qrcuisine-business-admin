import supabase from "@/configs/supabase";

const restaurantId = localStorage.getItem("restaurants_id");
export async function getAllOrders(page, pageSize, status, searchQuery) {
  try {
    let query = supabase
      .from("orders")
      .select(`*,table_id(*),waiter_id(*),status_id(*),user_id(*)`, {count: "exact"})
      .eq("restaurant_id", restaurantId)
      .order("created_at", {ascending: false})
      .range((page - 1) * pageSize, page * pageSize - 1)
      .limit(pageSize);

    // Adjusted to correctly filter based on status
    if (status === "undelivered") {
      query = query.eq("is_delivered", true); // Orders that are delivered
    } else if (status === "delivered") {
      query = query.eq("is_delivered", false); // Orders that are not delivered
    }

    if (searchQuery) {
      query = query.ilike("order_id", `%${searchQuery}%`);
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

export async function updateOrder(value) {
  try {
    const updates = {
      preparation_time: value.preparation_time,
      status_id: value.status_id,
      waiter_id: value.waiter_id,
    };

    if (value.sorting === 3) {
      updates.is_delivered = true;
    }

    const {data, error} = await supabase
      .from("orders")
      .update(updates)
      .eq("id", value.id)
      .select();

    if (error) {
      throw error;
    } else {
      return data;
    }
  } catch (error) {
    console.error("Error updating data:", error);
    throw error;
  }
}

export async function getWaiters() {
  try {
    const {data, error} = await supabase
      .from("waiters")
      .select(`*`)
      .eq("restaurant_id", restaurantId)
      .order("name", {ascending: true});

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

export async function getStatuses() {
  try {
    const {data, error} = await supabase
      .from("status_table")
      .select(`*`)
      .order("sorting", {ascending: true});

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
