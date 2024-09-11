import supabase from "@/configs/supabase";
import QRCode from "qrcode";
import {uploadImageToCloudinary} from "./cloudinary-upload";
import html2canvas from "html2canvas";

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

export async function endSession(tableId) {
  try {
    const {data, error} = await supabase
      .from("tables")
      .update({is_booked: false, order_id: null, persons: null})
      .eq("id", tableId)
      .select();

    if (error) {
      throw error;
    }
    if (data) {
      return data;
    }
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
  <div style="
    width: 412px;
    height: 512px;
    background-color: rgba(106, 176, 74, 0.3);
    display: flex;
    flex-direction: column;
    position: relative;
    margin: 0 auto;
    line-height: 0px;
  ">
    <div style="
      width: 100%;
      height: 164px;
      display: flex;
    ">
      <div style="
        width: 70%;
        height: 100%;
        background-color: #fff;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: start;
        gap: 40px;
      ">
        <h2 style="
          text-transform: uppercase;
          font-size: 1.7rem;
          font-weight: 500;
          color: #101026;
          letter-spacing: 0.07em;
          font-family: Montserrat;
          padding-top: 28px;
        ">
          Contactless
        </h2>
        <h2 style="
          text-transform: uppercase;
          font-size: 1.6rem;
          font-weight: 800;
          color: #101026;
          letter-spacing: 0.03em;
          font-family: Montserrat;
        ">
          Menu + Order
        </h2>
      </div>
      <div style="
        width: 30%;
        height: 100%;
        background-color: #FF9A04;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: start;
        gap: 30px;
        padding-right: 15px;
      ">
        <h2 style="
          text-transform: uppercase;
          font-size: 1.25rem;
          font-weight: 600;
          color: #ffffff;
          font-family: Montserrat;
          padding-top: 28px;
        ">
          Table
        </h2>
        <h2 style="
          text-transform: uppercase;
          font-size: 3rem;
          font-weight: 900;
          color: #ffffff;
          letter-spacing: 0.03em;
          font-family: Montserrat;
        ">
          ${table_no}
        </h2>
      </div>
    </div>
    <div style="
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      justify-content: center;
      align-items: center;
      gap: 25px;
      position: relative;
      padding-top: 0.5em;
      padding-right: 15px;
    ">
      <img src="/polygon.svg" style="position: absolute; top: -20px; width: 50px;" />
      <h3 style="
        font-size: 1.2rem;
        font-weight: 600;
        color: #6ab04a;
        padding-top: 0.5em;
       font-family: Montserrat;
       text-transform: uppercase;
       padding-bottom: 20px;
      ">
        Scan now to order
      </h3>
      <div style="
        background-color: #fff;
        border-radius: 0.8rem;
        padding: 6px;
      ">
        <img src=${qr_code} style="width: 180px;" />
      </div>
      <div style="
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 15px;
      position: relative;
    ">
        <img src="/logoNew.png" style="width: 80px;" />
        <h3 style="
        font-size: 0.6rem;
        font-weight: 500;
        color: #808080;
       font-family: Montserrat;
      ">
          www.qrcuisine.com
        </h3>
      </div>
    </div>
  </div>
`;
  document.body.appendChild(element);

  const canvas = await html2canvas(element, {
    scale: 10,
    windowWidth: "412px",
    windowHeight: "512px",
  });
  const dataUrl = canvas.toDataURL();

  document.body.removeChild(element);

  return dataUrl;
}

async function generateQRCode(restaurantId, tableId) {
  const url = `https://qrcuisine.com/${restaurantId}/${tableId}`;
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
