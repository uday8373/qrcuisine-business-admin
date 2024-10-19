import React, {useRef} from "react";
import html2canvas from "html2canvas";
import QRbg from "/QRbg.jpg";
export default function QRView({table_no, qr_code}) {
  const elementRef = useRef(null);

  const handleGenerateCanvas = async () => {
    const element = elementRef.current;

    if (element) {
      const canvas = await html2canvas(element, {
        scale: 10,
        width: 412,
        height: 612,
      });

      const dataUrl = canvas.toDataURL();

      // Optionally display the generated image
      const img = document.createElement("img");
      img.src = dataUrl;
      document.body.appendChild(img);
    }
  };

  return (
    <div>
      {/* This div will be used to create the canvas */}
      <div
        ref={elementRef}
        style={{
          width: "412px",
          height: "572px",
          backgroundColor: "rgba(106, 176, 74, 0.3)",
          backgroundImage: `url(${QRbg})`, // Set the background image here
          backgroundSize: "cover", // Ensures the image covers the entire div
          backgroundPosition: "center", // Center the background image
          display: "flex",
          flexDirection: "column",
          position: "relative",
          margin: "0 auto",
          lineHeight: "0px",
        }}>
        {/* <div style={{width: "100%", height: "164px", display: "flex"}}>
          <div
            style={{
              width: "70%",
              height: "100%",
              backgroundColor: "#fff",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "start",
              gap: "40px",
            }}>
            <h2
              style={{
                textTransform: "uppercase",
                fontSize: "1.7rem",
                fontWeight: "500",
                color: "#101026",
                letterSpacing: "0.07em",
                fontFamily: "Montserrat",
                paddingTop: "28px",
              }}>
              Contactless
            </h2>
            <h2
              style={{
                textTransform: "uppercase",
                fontSize: "1.6rem",
                fontWeight: "800",
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
              height: "100%",
              backgroundColor: "#FF9A04",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "start",
              gap: "30px",
              paddingRight: "15px",
            }}>
            <h2
              style={{
                textTransform: "uppercase",
                fontSize: "1.25rem",
                fontWeight: "600",
                color: "#ffffff",
                fontFamily: "Montserrat",
                paddingTop: "28px",
              }}>
              Table
            </h2>
            <h2
              style={{
                textTransform: "uppercase",
                fontSize: "3rem",
                fontWeight: "900",
                color: "#ffffff",
                letterSpacing: "0.03em",
                fontFamily: "Montserrat",
              }}>
              {table_no}
            </h2>
          </div>
        </div> */}

        <div
          style={{
            width: "100%",
            height: "6%",
            borderRadius: "0px 0px 20px 20px",
            backgroundColor: "#6ab04a",
          }}></div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "94%",
            alignItems: "center",
            gap: "20px",
            position: "relative",
          }}>
          <div
            style={{
              width: "100%",
              height: "20%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "0px 0px 20px 20px",
            }}>
            <div
              style={{
                width: "26%",
                height: "100%",
                backgroundColor: "#FF9A04",
                display: "flex",
                flexDirection: "column",
                borderRadius: "0px 0px 20px 20px",
                alignItems: "center",
                gap: "35px",
              }}>
              <h2
                style={{
                  textTransform: "uppercase",
                  textAlign: "center",
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  color: "#ffffff",
                  fontFamily: "Montserrat",
                  paddingTop: "20px",
                }}>
                Table
              </h2>
              <h2
                style={{
                  textTransform: "uppercase",
                  textAlign: "center",
                  fontSize: "3rem",
                  fontWeight: "800",
                  color: "#ffffff",
                  fontFamily: "Montserrat",
                }}>
                {table_no}03
              </h2>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "2px",
              flexDirection: "column",
            }}>
            <img src="/contact.png" alt="QR Code" style={{width: "130px"}} />

            <h3
              style={{
                fontSize: "1.7rem",
                fontWeight: "600",
                color: "#404040",
                paddingTop: "0.5em",
                fontFamily: "Montserrat",
                textTransform: "uppercase",
                paddingBottom: "15px",
              }}>
              MENU + ORDER
            </h3>
          </div>
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "2rem",
              padding: "20px",
              border: "6px solid #6ab04a",
            }}>
            <img src="/qr.png" alt="QR Code" style={{width: "160px"}} />
          </div>

          <div
            style={{
              width: "60%",
              height: "10%",
              backgroundColor: "#FF9A04",
              borderRadius: " 20px 20px 0px 0px",
              position: "absolute",
              bottom: 15,
            }}></div>
          <div
            style={{
              backgroundColor: "#6ab04a",
              display: "flex",
              width: "100%",
              height: "11%",
              justifyContent: "space-between",
              alignItems: "center",
              bottom: "0",
              gap: "16px",
              padding: "0px 20px 0px 20px",
              position: "absolute",
            }}>
            <div style={{width: "100%"}}>
              <img src="/QRWhite.png" alt="Logo" style={{width: "90px"}} />
            </div>
            <div
              style={{
                padding: "2px",
                height: "100%",
                position: "relative",
                backgroundColor: "#fff",
              }}></div>
            <div style={{backgroundColor: "#d08", width: "100%"}}>
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: "500",
                  color: "#fff",
                  fontFamily: "Montserrat",
                }}>
                www.qrcuisine.com
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Button to generate canvas */}
      <button onClick={handleGenerateCanvas}>Generate Canvas</button>
    </div>
  );
}
