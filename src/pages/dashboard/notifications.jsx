import React from "react";

export function Notifications() {
  const table_no = 24;
  const qr_code = "/qr.png";
  return (
    <div className="mx-auto my-20 flex max-w-screen-lg flex-col gap-8">
      <div
        style={{
          width: "412px",
          height: "512px",
          backgroundColor: "#101026",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          margin: "0 auto",
        }}>
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
          }}>
          <div
            style={{
              width: "70%",
              backgroundColor: "#fff",
              display: "flex",
              height: "144px",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px",
            }}>
            <h2
              style={{
                textTransform: "uppercase",
                fontSize: "1.7rem",
                fontWeight: 500,
                color: "#101026",
                letterSpacing: "0.07em",
                fontFamily: "Montserrat",
              }}>
              Contactless
            </h2>
            <h2
              style={{
                textTransform: "uppercase",
                fontSize: "1.6rem",
                fontWeight: 800,
                color: "#101026",
                letterSpacing: "0.03em",
                fontFamily: "Montserrat",
              }}>
              Menu + Order
            </h2>
          </div>
          <div
            style={{
              width: "30%",
              height: "144px",
              backgroundColor: "#FF9A04",
              padding: "10px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}>
            <h2
              style={{
                textTransform: "uppercase",
                fontSize: "1.25rem",
                fontWeight: 600,
                paddingTop: "12px",
                color: "#101026",
                fontFamily: "Montserrat",
              }}>
              Table
            </h2>
            <h2
              style={{
                marginTop: "-12px",
                textTransform: "uppercase",
                fontSize: "3rem",
                fontWeight: 900,
                color: "#101026",
                letterSpacing: "0.03em",
                fontFamily: "Montserrat",
              }}>
              {table_no}
            </h2>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
            gap: "20px",
            padding: "10px",
            position: "relative",
          }}>
          <img
            src="/polygon.svg"
            style={{position: "absolute", top: "-20px", width: "50px"}}
          />
          <h3
            style={{
              fontSize: "1.5rem",
              fontWeight: 500,
              color: "#FF9A04",
              fontFamily: "Dancing Script",
            }}>
            Scan now and check our menu
          </h3>
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "0.5rem",
              padding: "10px",
            }}>
            <img src={qr_code} style={{width: "180px"}} />
          </div>
          <img src="/logo.svg" style={{width: "100px", marginTop: "5px"}} />
        </div>
      </div>
    </div>
  );
}

export default Notifications;
