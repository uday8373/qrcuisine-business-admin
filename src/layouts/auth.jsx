import {Routes, Route, useNavigate} from "react-router-dom";
import routes from "@/routes";
import {useEffect, useState} from "react";
import {ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function Auth() {
  const navigation = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const isLooged = (localStorage.getItem("accessToken"));
    if (isLooged) {
      navigation("/dashboard/home");
    }
    setIsLoading(false);
  }, []);

  return (
    <div className="relative min-h-screen w-full">
      <ToastContainer draggable stacked autoClose={false} style={{width: "500px"}} />
      {isLoading ? (
        <div className="flex justify-center w-full items-center h-screen">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      ) : (
        <Routes>
          {routes.map(
            ({layout, pages}) =>
              layout === "auth" &&
              pages.map(({path, element}) => (
                <Route exact path={path} element={element} />
              )),
          )}
        </Routes>
      )}
    </div>
  );
}

Auth.displayName = "/src/layout/Auth.jsx";

export default Auth;
