import supabase from "@/configs/supabase";
import QRCode from "qrcode";
import {uploadImageToCloudinary} from "./cloudinary-upload";
import html2canvas from "html2canvas";
import {WEB_CONFIG} from "@/configs/website-config";

import QRbg from "/QRbg.jpg";

export async function getAllTables(page, pageSize, status, searchQuery) {
  const restaurantId = localStorage.getItem("restaurants_id");
  try {
    let query = supabase
      .from("tables")
      .select(`*,restaurant_id(*),order_id(*, status_id(*), user_id(*))`, {
        count: "exact",
      })
      .eq("restaurant_id", restaurantId)
      .order("is_booked", {ascending: false})
      .order("table_no", {ascending: true})
      .range((page - 1) * pageSize, page * pageSize - 1)
      .limit(pageSize);

    if (status !== "all") {
      query = query.eq("is_booked", status === "true");
    }
    if (searchQuery) {
      query = query.eq("table_no", searchQuery);
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

export async function endSession(tableId, orderId) {
  try {
    const tableUpdatePromise = supabase
      .from("tables")
      .update({is_booked: false, order_id: null, persons: null})
      .eq("id", tableId)
      .select();

    let orderUpdatePromise = Promise.resolve();
    if (orderId) {
      orderUpdatePromise = supabase
        .from("orders")
        .update({is_abandoned: true, status_id: "bb59ee8e-f74c-4d0a-a422-655a2bb1053e"})
        .eq("id", orderId)
        .select();
    }

    const [tableResult, orderResult] = await Promise.all([
      tableUpdatePromise,
      orderUpdatePromise,
    ]);

    if (tableResult.error) {
      throw tableResult.error;
    }
    if (orderResult && orderResult.error) {
      throw orderResult.error;
    }

    return tableResult.data;
  } catch (error) {
    throw error;
  }
}

export async function getTableCounts() {
  const restaurantId = localStorage.getItem("restaurants_id");
  try {
    const {data, error} = await supabase
      .from("tables")
      .select("is_booked")
      .eq("restaurant_id", restaurantId);

    if (error) {
      throw error;
    }

    const totalTables = data.length;
    const bookedTables = data.filter((table) => table.is_booked).length;
    const availableTables = totalTables - bookedTables;

    return {
      totalTables,
      bookedTables,
      availableTables,
    };
  } catch (error) {
    console.error("Error fetching table counts:", error);
    throw error;
  }
}

export async function insertTables(numberOfTables) {
  const restaurantId = localStorage.getItem("restaurants_id");
  const restaurant_name = localStorage.getItem("restaurantName");
  try {
    const highestTableNo = await getHighestTableNo();
    const newTables = [];

    for (let i = 1; i <= numberOfTables; i++) {
      const table_No = highestTableNo + i;
      const tableNo = parseInt(table_No, 10);
      const formattedTableNo = tableNo < 10 ? `0${tableNo}` : `${tableNo}`;

      newTables.push({
        table_no: formattedTableNo,
        is_booked: false,
        persons: null,
        qr_image: null,
        restaurant_id: restaurantId,
        is_available: true,
        order_id: null,
      });
    }

    const {data, error} = await supabase.from("tables").insert(newTables).select();

    if (error) {
      throw error;
    } else {
      for (const table of data) {
        const formattedTableNo = String(table.table_no).padStart(2, "0");
        const qrCodeDataUrl = await generateQRCode(restaurant_name, table.id);
        const qrImageUrl = await generateQRTemplateImage(formattedTableNo, qrCodeDataUrl);
        const cloudinaryUrl = await uploadImageToCloudinary(qrImageUrl);
        await updateTableQRCode(table.id, cloudinaryUrl);
      }

      return data;
    }
  } catch (error) {
    console.error("Error inserting tables:", error);
    throw error;
  }
}

async function generateQRTemplateImage(table_no, qr_code) {
  const element = document.createElement("div");
  element.innerHTML = `
   <div style="width: 500px; height: 750px; background-color: rgba(106, 176, 74, 0.3); background-image: url(${QRbg}); background-size: cover; background-position: center; display: flex; flex-direction: column; position: relative; margin: 0 auto; line-height: 0px;">
            <div style="width: 100%; height: 6%;  border-radius: 0px 0px 20px 20px; background-color: #6ab04a;"></div>
            <div style="display: flex; flex-direction: column; width: 100%; height: 94%; align-items: center; gap: 20px; position: relative;">
              <div style="width: 100%; height: 20%; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 0px 0px 20px 20px;">
                <div style="width: 26%; height: 100%; background-color: #FF9A04; display: flex; flex-direction: column; border-radius: 0px 0px 20px 20px; align-items: center; gap: 35px;">
                  <h2 style="text-transform: uppercase; text-align: center; font-size: 1.1rem; font-weight: 600; color: #ffffff; font-family: Montserrat; padding-top: 20px;">
                    Table
                  </h2>
                  <h2 style="text-transform: uppercase; text-align: center; font-size: 3rem; font-weight: 800; color: #ffffff; font-family: Montserrat;">
                    ${table_no}
                  </h2>
                </div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 2px; flex-direction: column;">
                <img src="/contact.png" alt="QR Code" style="width: 130px;" />
                <h3 style="font-size: 1.7rem; font-weight: 600; color: #404040; padding-top: 0.5em; font-family: Montserrat; text-transform: uppercase; padding-bottom: 15px;">
                  MENU + ORDER
                </h3>
              </div>
              <div style="background-color: #fff; border-radius: 2rem; padding: 20px; border: 6px solid #6ab04a;">
                <img src="${qr_code}" alt="QR Code" style="width: 160px;" />
              </div>
              <div style="width: 60%; height: 10%; background-color: #FF9A04; border-radius: 20px 20px 0px 0px; position: absolute; bottom: 15px;"></div>
              <div style="background-color: #6ab04a; display: flex; width: 100%; height: 11%; justify-content: space-between; align-items: center; bottom: 0; gap: 16px; padding: 0px 20px; position: absolute;">
                <div style="width: 100%;">
                  <img src="/QRWhite.png" alt="Logo" style="width: 90px;" />
                </div>
                <div style="padding: 2px; height: 100%; position: relative; background-color: #fff;"></div>
                <div style="background-color: #d08; width: 100%;">
                  <h3 style="font-size: 1rem; font-weight: 500; color: #fff; font-family: Montserrat;">
                    www.qrcuisine.com
                  </h3>
                </div>
              </div>
            </div>
          </div>
`;

  document.body.appendChild(element);

  const canvas = await html2canvas(element, {
    scale: 5,
    windowWidth: "500px",
    windowHeight: "750px",
  });
  const dataUrl = canvas.toDataURL();

  document.body.removeChild(element);

  return dataUrl;
}

async function generateQRCode(restaurantId, tableId) {
  const baseUrl = WEB_CONFIG.isProduction
    ? WEB_CONFIG.productionBaseUrl
    : WEB_CONFIG.developementBaseUrl;
  const url = `${baseUrl}/${restaurantId}/${tableId}`;
  try {
    const qrCodeDataURL = await QRCode.toDataURL(url);
    return qrCodeDataURL;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw error;
  }
}

async function updateTableQRCode(tableId, qrCodeUrl) {
  try {
    const {error} = await supabase
      .from("tables")
      .update({qr_image: qrCodeUrl})
      .eq("id", tableId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error updating table QR code:", error);
    throw error;
  }
}

export async function getHighestTableNo() {
  const restaurantId = localStorage.getItem("restaurants_id");
  try {
    const {data, error} = await supabase
      .from("tables")
      .select("table_no")
      .order("table_no", {ascending: false})
      .eq("restaurant_id", restaurantId)
      .limit(1)
      .single();

    if (error) {
      return 0;
    } else {
      return data?.table_no || 0;
    }
  } catch (error) {
    console.error("Error fetching highest table_no:", error);
    throw error;
  }
}
