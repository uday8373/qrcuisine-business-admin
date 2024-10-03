import supabase from "@/configs/supabase";

export async function getAllOrders(page, pageSize, status, searchQuery) {
  const restaurantId = localStorage.getItem("restaurants_id");
  try {
    let query = supabase
      .from("orders")
      .select(`*,table_id(*),waiter_id(*),status_id(*),user_id(*),cancelled_reason(*)`, {
        count: "exact",
      })
      .eq("restaurant_id", restaurantId)
      .order("is_delivered", {ascending: true})
      .order("created_at", {ascending: false})
      .range((page - 1) * pageSize, page * pageSize - 1)
      .limit(pageSize);

    // Apply filters based on status
    if (status === "active") {
      query = query
        .eq("is_delivered", false)
        .eq("is_cancelled", false)
        .eq("is_abandoned", false);
    } else if (status === "delivered") {
      query = query.eq("is_delivered", true);
    } else if (status === "cancelled") {
      query = query.eq("is_cancelled", true);
    } else if (status === "abandoned") {
      query = query.eq("is_abandoned", true);
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
  const restaurantId = localStorage.getItem("restaurants_id");
  try {
    const {data, error} = await supabase
      .from("orders")
      .select("is_delivered, is_cancelled, is_abandoned")
      .eq("restaurant_id", restaurantId);

    if (error) {
      throw error;
    }

    const total = data.length;
    const available = data.filter((item) => item.is_delivered).length;
    const active = data.filter(
      (item) => !item.is_delivered && !item.is_cancelled && !item.is_abandoned,
    ).length;
    const unAvailable = total - available;
    const cancelled = data.filter((item) => item.is_cancelled).length;
    const abandoned = data.filter((item) => item.is_abandoned).length;

    return {
      total,
      available,
      unAvailable,
      active,
      cancelled,
      abandoned,
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

export async function updatePaymentOrder(value) {
  try {
    const updates = {
      is_paid: value.is_paid,
    };

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

export async function updateWaiterOrder(value) {
  const restaurantId = localStorage.getItem("restaurants_id");
  try {
    const updates = {
      waiter_id: value.waiter_id,
    };

    const {data, error} = await supabase
      .from("orders")
      .update(updates)
      .eq("id", value.id)
      .select();

    if (error) {
      throw error;
    }

    const message = "Waiter Assigned!";
    const subMessage = `${value.name} assigned as a waiter`;

    if (message) {
      const {error: messageError} = await supabase.from("messages").insert({
        order_id: value.id,
        message: message,
        sub_message: subMessage,
        table_id: value.table_id,
        restaurant_id: restaurantId,
        user_id: value.user_id,
        waiter_id: value.waiter_id.id,
        is_read: true,
        user_read: false,
      });

      if (messageError) {
        throw messageError;
      }
    }

    return data;
  } catch (error) {
    console.error("Error updating data:", error);
    throw error;
  }
}

export async function updateStatusOrder(value) {
  const restaurantId = localStorage.getItem("restaurants_id");
  try {
    const updates = {
      status_id: value.status_id,
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
    }

    let message;
    let subMessage;
    if (value.sorting === 1) {
      message = "Order Confirmed!";
      subMessage = "Your Order has been confirmed.";
    } else if (value.sorting === 2) {
      message = "Order Preparing!";
      subMessage = "Your Order has been Preparing.";
    } else if (value.sorting === 3) {
      message = "Order Delivered!";
      subMessage = "Your Order has been delivered.";
    }

    if (message) {
      const {error: messageError} = await supabase.from("messages").insert({
        order_id: value.id,
        message: message,
        sub_message: subMessage,
        table_id: value.table_id,
        restaurant_id: restaurantId,
        user_id: value.user_id,
        waiter_id: null,
        is_read: true,
        user_read: false,
      });

      if (messageError) {
        throw messageError;
      }
    }

    return data;
  } catch (error) {
    console.error("Error updating data:", error);
    throw error;
  }
}

export async function updateCancelStatusOrder({selectedReason, value}) {
  const restaurantId = localStorage.getItem("restaurants_id");

  try {
    const updates = {
      status_id: value.status_id,
      is_cancelled: true,
      cancelled_reason: selectedReason,
    };

    // Use Promise.all to handle both updates concurrently
    const [orderUpdateResult, tableUpdateResult] = await Promise.all([
      supabase.from("orders").update(updates).eq("id", value.id).select(),
      supabase
        .from("tables")
        .update({is_booked: false, order_id: null, persons: null})
        .eq("id", value.table_id)
        .select(),
    ]);

    const {data: orderData, error: orderError} = orderUpdateResult;
    const {data: tableData, error: tableError} = tableUpdateResult;

    // Handle any errors from the update operations
    if (orderError || tableError) {
      throw orderError || tableError;
    }

    const message = "Order Cancelled!";
    const subMessage = "Your order has been cancelled.";

    // Insert message only if needed
    if (message) {
      const messageInsertResult = await supabase.from("messages").insert({
        order_id: value.id,
        message: message,
        sub_message: subMessage,
        table_id: value.table_id,
        restaurant_id: restaurantId,
        user_id: value.user_id,
        waiter_id: null,
        is_read: true,
        user_read: false,
      });

      const {error: messageError} = messageInsertResult;

      if (messageError) {
        throw messageError;
      }
    }

    // Return the order data
    return orderData;
  } catch (error) {
    console.error("Error updating data:", error);
    throw error;
  }
}

export async function getWaiters() {
  const restaurantId = localStorage.getItem("restaurants_id");
  try {
    const {data, error} = await supabase
      .from("waiters")
      .select(`*`)
      .eq("restaurant_id", restaurantId)
      .eq("status", true)
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

export async function getCancelledReason() {
  try {
    const {data, error} = await supabase
      .from("cancelled_reason")
      .select(`*`)
      .eq("is_admin", true)
      .order("title", {ascending: true});

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
