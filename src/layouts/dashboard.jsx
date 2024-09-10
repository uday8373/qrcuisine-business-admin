import {Routes, Route, useNavigate} from "react-router-dom";
import {Sidenav, DashboardNavbar, Configurator, Footer} from "@/widgets/layout";
import routes from "@/routes";
import {useMaterialTailwindController} from "@/context";
import {useEffect, useState} from "react";

export function Dashboard() {
  const [controller] = useMaterialTailwindController();
  const {sidenavType} = controller;
  const navigation = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const isLooged = JSON.parse(localStorage.getItem("accessToken"));
    if (!isLooged) {
      navigation("/auth/sign-in");
    }
    setIsLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-blue-gray-50/50 relative">
      <Sidenav
        routes={routes}
        brandImg={sidenavType === "dark" ? "/img/logo-ct.png" : "/img/logo-ct-dark.png"}
      />
      <div className="p-4 xl:ml-80 min-h-screen flex flex-col">
        <DashboardNavbar />
        <Configurator />
        {isLoading ? (
          <div className="flex justify-center w-full items-center min-h-screen relative">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        ) : (
          <Routes>
            {routes.map(
              ({layout, pages}) =>
                layout === "dashboard" &&
                pages.map(({path, element}) => (
                  <Route exact path={path} element={element} />
                )),
            )}
          </Routes>
        )}
        <div className="text-blue-gray-600 mt-auto py-3">
          <Footer />
        </div>
      </div>
    </div>
  );
}

Dashboard.displayName = "/src/layout/dashboard.jsx";

export default Dashboard;
