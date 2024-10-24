import supabase from "@/configs/supabase";
import QRCode from "qrcode";
import {uploadImageToCloudinary} from "./cloudinary-upload";
import html2canvas from "html2canvas";
import {WEB_CONFIG} from "@/configs/website-config";

import QRbg from "/QRbg.jpg";
import QRCodeStyling from "qr-code-styling";

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

export async function insertTables(numberOfTables, maxCapacity) {
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
        max_capacity: maxCapacity,
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
   <div style="width: 1180px; height: 1800px; background-color: rgba(106, 176, 74, 0.3); background-image: url(${QRbg}); background-size: cover; background-position: center; display: flex; flex-direction: column; position: relative; margin: 0 auto; line-height: 0rem;">
<div style="width: 100%; height: 5%;  border-radius: 0px 0px 3rem 3rem; background-color: #6ab04a;"></div>
<div style="display: flex; flex-direction: column; width: 100%; height: 95%; align-items: center; gap: 20px; position: relative;">
   <div style="width: 100%; height: 21%;  display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 0px 0px 3rem 3rem; ">
      <div style="width: 30%; height: 100%; background-color: #FF9A04; display: flex; flex-direction: column; border-radius: 0px 0px 3rem 3rem; align-items: center;  justify-content: start; gap: 6rem">
         <h2 style="text-transform: uppercase; padding-top: 4rem; text-align: center; font-size: 4rem; font-weight: 600; color: #ffffff; font-family: Montserrat;">
            Table
         </h2>
         <h2 style="text-transform: uppercase; text-align: center; font-size: 10rem; font-weight: 800; color: #ffffff; font-family: Montserrat;  letter-spacing: 0.03em;">
            ${table_no}
         </h2>
      </div>
   </div>
   <div style="display: flex; justify-content: space-between; align-items: center; gap: 2px; flex-direction: column;">
      <img src="/contact.png" alt="QR Code" style="width: 400px; padding-top: 3rem;" />
      <h3 style="font-size: 5rem; font-weight: 600; color: #404040; font-family: Montserrat; text-transform: uppercase; padding-top: 3rem;">
         MENU + ORDER
      </h3>
   </div>
   <div style="background-color: #fff; border-radius: 3rem; padding: 15px; border: 20px solid #6ab04a; margin-top: 10rem;">
      <img src="${qr_code}" alt="QR Code" style="width: 510px;" />
   </div>
   <div style="width: 60%; height: 10%; justify-content: center; display: flex; background-color: #FF9A04; border-radius: 3rem 3rem 0px 0px; position: absolute; bottom: 15px; padding-top: 1rem;">
      <h3 style="font-size: 2rem; font-weight: 500; color: #fff; font-family: Montserrat; ">
         www.qrcuisine.com
      </h3>
   </div>
   <div style="background-color: #6ab04a; border-radius: 3rem 3rem 0px 0px ; display: flex; width: 100%; height: 7%; justify-content: center; align-items: center; bottom: 0; position: absolute;">
      <img src="/QRWhite.png" alt="Logo" style="width: 200px;" />
   </div>
</div>
`;

  document.body.appendChild(element);

  const canvas = await html2canvas(element, {
    windowWidth: "1200px",
    windowHeight: "1800px",
  });
  const dataUrl = canvas.toDataURL();

  document.body.removeChild(element);

  return dataUrl;
}

async function getBase64FromQRCode(qrCode, format) {
  return new Promise((resolve, reject) => {
    qrCode
      .getRawData(format)
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result); // Return the base64 data URL
        };
        reader.onerror = (err) => {
          reject(err);
        };
        reader.readAsDataURL(blob); // Convert the blob to base64
      })
      .catch((error) => {
        reject(error);
      });
  });
}

async function generateQRCode(restaurantId, tableId) {
  const baseUrl = WEB_CONFIG.isProduction
    ? WEB_CONFIG.productionBaseUrl
    : WEB_CONFIG.developementBaseUrl;
  const url = `${baseUrl}/${restaurantId}/${tableId}`;
  try {
    // const qrCodeDataURL = await QRCode.toDataURL(url, {
    //   scale: 10,
    //   maskPattern: 7,
    //   color: {
    //     dark: "#404040",
    //     light: "#ffffff",
    //   },
    // });

    const qrCodeDataURL = new QRCodeStyling({
      width: 300,
      height: 300,
      data: url,
      dotsOptions: {
        color: "#0a0a0a",
        type: "extra-rounded",
      },
      backgroundOptions: {
        color: "#fff",
      },
    });

    const base64Image = await getBase64FromQRCode(qrCodeDataURL, "png");

    return base64Image;
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
