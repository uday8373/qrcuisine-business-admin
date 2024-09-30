import {Routes, Route, useNavigate} from "react-router-dom";
import {Sidenav, DashboardNavbar, Configurator, Footer} from "@/widgets/layout";
import routes from "@/routes";
import {useMaterialTailwindController} from "@/context";
import {useEffect, useRef, useState} from "react";
import supabase from "@/configs/supabase";
import {Flip, toast, ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {Typography} from "@material-tailwind/react";
import moment from "moment";

export function Dashboard() {
  const [controller] = useMaterialTailwindController();
  const {sidenavType} = controller;
  const navigation = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const toastIdRef = useRef([]);

  useEffect(() => {
    const isLooged = localStorage.getItem("accessToken");
    if (!isLooged) {
      navigation("/auth/sign-in");
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const restaurantId = localStorage.getItem("restaurants_id");

    const playNotificationSound = async () => {
      const audio = new Audio("/notification2.mp3");
      audio.play();
    };

    const messageSubscriptionNew = supabase
      .channel("messagesNew")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        async (payload) => {
          if (payload.new.is_read === false) {
            await playNotificationSound();

            if (toastIdRef.current.length >= 3) {
              const oldestToastId = toastIdRef.current.shift();
              toast.dismiss(oldestToastId);
            }

            const newToastId = toast.success(
              <div className="w-full flex flex-col select-none cursor-move">
                <Typography variant="paragraph" className="font-medium" color="blue-gray">
                  {payload.new.message}
                </Typography>
                <Typography
                  variant="small"
                  className="font-normal opacity-70 w-full relative"
                  color="blue-gray">
                  {payload.new.sub_message}{" "}
                  <span className="absolute right-0">
                    {moment(payload.new.created_at).fromNow(true)} ago
                  </span>
                </Typography>
              </div>,
              {
                icon: <span>🔔</span>,
              },
            );
            toastIdRef.current.push(newToastId);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageSubscriptionNew);
    };
  }, []);

  return (
    <div className="min-h-screen bg-blue-gray-50/50 relative">
      <ToastContainer draggable stacked autoClose={false} style={{width: "500px"}} />
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
