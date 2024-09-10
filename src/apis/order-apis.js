import supabase from "@/configs/supabase";

const restaurantId = JSON.parse(localStorage.getItem("restaurants_id"));

export async function getAllOrders(page, pageSize, status, searchQuery) {
  try {
    let query = supabase
      .from("orders")
      .select(`*,table_id(*),waiter_id(*),status_id(*),user_id(*)`, {count: "exact"})
      .eq("restaurant_id", restaurantId)
      .order("is_delivered", {ascending: true})
      .order("created_at", {ascending: false})
      .range((page - 1) * pageSize, page * pageSize - 1)
      .limit(pageSize);

    if (status !== "all") {
      query = query.eq("is_delivered", status === "true");
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

export async function getOrdersCounts() {
  try {
    const {data, error} = await supabase
      .from("orders")
      .select("is_delivered")
      .eq("restaurant_id", restaurantId);

    if (error) {
      throw error;
    }

    const total = data.length;
    const available = data.filter((item) => item.is_delivered).length;
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

export async function updateOrder(value) {
  try {
    const updates = {
      preparation_time: value.preparation_time,
      status_id: value.status_id,
      waiter_id: value.waiter_id,
    };

    if (value.sorting === 3) {
      updates.is_delivered = true;
      updates.delivered_time = new Date().toISOString();
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
