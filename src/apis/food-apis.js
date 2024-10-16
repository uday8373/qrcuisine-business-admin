import supabase from "@/configs/supabase";

export async function getAllFoods(page, pageSize, status, searchQuery) {
  const restaurantId = localStorage.getItem("restaurants_id");
  try {
    let query = supabase
      .from("food_menus")
      .select(`*,category(category_name, id)`, {count: "exact"})
      .eq("restaurant_id", restaurantId)
      .order("is_available", {ascending: false})
      .order("created_at", {ascending: false})
      .range((page - 1) * pageSize, page * pageSize - 1)
      .limit(pageSize);
    if (status !== "all") {
      query = query.eq("is_available", status === "true");
    }
    if (searchQuery) {
      query = query.ilike("food_name", `%${searchQuery}%`);
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

export async function getFoodCounts() {
  const restaurantId = localStorage.getItem("restaurants_id");
  try {
    const {data, error} = await supabase
      .from("food_menus")
      .select("is_available")
      .eq("restaurant_id", restaurantId);

    if (error) {
      throw error;
    }

    const total = data.length;
    const available = data.filter((table) => table.is_available).length;
    const unAvailable = total - available;

    return {
      total,
      available,
      unAvailable,
    };
  } catch (error) {
    console.error("Error fetching counts:", error);
    throw error;
  }
}

export async function getCategories() {
  const restaurantId = localStorage.getItem("restaurants_id");
  try {
    const {data, error} = await supabase
      .from("menu_category")
      .select(`*`)
      .eq("restaurant_id", restaurantId)
      .order("category_name", {ascending: true});

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
export async function getQuantityId() {
  try {
    const {data, error} = await supabase.from("food_quantity_group").select(`*`);
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
export async function getQuickInstructionId() {
  try {
    const {data, error} = await supabase.from("quick_instruction_group").select(`*`);
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
export async function getSideId() {
  try {
    const {data, error} = await supabase.from("side_group").select(`*`);
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
export async function getAdditionalSideId() {
  try {
    const {data, error} = await supabase.from("additional_sides_group").select(`*`);
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

export async function insertFood(value) {
  const restaurantId = localStorage.getItem("restaurants_id");
  try {
    const {data, error} = await supabase
      .from("food_menus")
      .insert([
        {
          food_name: value.title,
          quantity: value.quantity,
          price: value.price,
          category: value.category,
          is_veg: value.foodType,
          isSpecial: value.isSpecial,
          is_available: value.status,
          image: value.image,
          is_customized: value.is_customized,
          quantity_id: value.quantity_id,
          quick_instruction_id: value.quick_instruction_id,
          side_id: value.side_id,
          additional_side_id: value.additional_side_id,
          is_temperature: value.is_temperature,
          restaurant_id: restaurantId,
        },
      ])
      .select();
    if (error) {
      throw error;
    } else {
      return data;
    }
  } catch (error) {
    console.error("Error inserting data:", error);
    throw error;
  }
}

export async function updateFood(value) {
  try {
    const {data, error} = await supabase
      .from("food_menus")
      .update([
        {
          food_name: value.title,
          quantity: value.quantity,
          price: value.price,
          category: value.category,
          is_veg: value.foodType,
          isSpecial: value.isSpecial,
          is_available: value.status,
          image: value.image,
          is_customized: value.is_customized,
          quantity_id: value.quantity_id,
          quick_instruction_id: value.quick_instruction_id,
          side_id: value.side_id,
          additional_side_id: value.additional_side_id,
          is_temperature: value.is_temperature,
        },
      ])
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

export async function deleteFood(value) {
  try {
    const {data, error} = await supabase
      .from("food_menus")
      .delete()
      .eq("id", value.id)
      .select();
    if (error) {
      throw error;
    } else {
      return data;
    }
  } catch (error) {
    console.error("Error deleting data:", error);
    throw error;
  }
}
