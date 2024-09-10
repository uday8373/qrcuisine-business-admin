import PropTypes from "prop-types";
import {Link, NavLink} from "react-router-dom";
import {XMarkIcon} from "@heroicons/react/24/outline";
import {Button, Chip, IconButton, Typography} from "@material-tailwind/react";
import {useMaterialTailwindController, setOpenSidenav} from "@/context";
import {useEffect, useState} from "react";
import {getOrdersCounts} from "@/apis/order-apis";
import supabase from "@/configs/supabase";
import {getTableCounts} from "@/apis/tables-apis";

export function Sidenav({routes}) {
  const [newOrder, setNewOrder] = useState(0);
  const [bookedCount, setBookedCount] = useState(0);
  const [controller, dispatch] = useMaterialTailwindController();
  const {sidenavColor, sidenavType, openSidenav} = controller;
  const sidenavTypes = {
    dark: "bg-gradient-to-br from-gray-800 to-gray-900",
    white: "bg-white shadow-sm",
    transparent: "bg-transparent",
  };

  const fetchOrdersCount = async () => {
    const result = await getOrdersCounts();
    if (result) {
      setNewOrder(result.unAvailable);
    }
  };

  const fetchBookedTablesCount = async () => {
    console.log("callling booked tables");
    const result = await getTableCounts();
    if (result) {
      setBookedCount(result.bookedTables);
    }
  };

  useEffect(() => {
    fetchOrdersCount();
    const restaurantId = (localStorage.getItem("restaurants_id"));

    const orderSubscription = supabase
      .channel("orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        async (payload) => {
          fetchOrdersCount();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(orderSubscription);
    };
  }, []);

  useEffect(() => {
    fetchBookedTablesCount();
    const restaurantId = (localStorage.getItem("restaurants_id"));

    const tableSubscription = supabase
      .channel("tables")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tables",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        async (payload) => {
          fetchBookedTablesCount;
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tableSubscription);
    };
  }, []);

  return (
    <aside
      className={`${sidenavTypes[sidenavType]} ${
        openSidenav ? "translate-x-0" : "-translate-x-80"
      } fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-xl transition-transform duration-300 xl:translate-x-0 border border-blue-gray-100`}>
      <div className={`relative`}>
        <Link to="/" className="my-10 px-8 flex justify-center">
          <img src="/img/logo-long.svg" className="w-40" />
        </Link>
        <IconButton
          variant="text"
          color="white"
          size="sm"
          ripple={false}
          className="absolute right-0 top-0 grid rounded-br-none rounded-tl-none xl:hidden"
          onClick={() => setOpenSidenav(dispatch, false)}>
          <XMarkIcon strokeWidth={2.5} className="h-5 w-5 text-white" />
        </IconButton>
      </div>
      <div className="m-4">
        {routes
          .filter(({layout}) => layout !== "auth")
          .map(({layout, title, pages}, key) => (
            <ul key={key} className="mb-4 flex flex-col gap-1">
              {title && (
                <li className="mx-3.5 mt-4 mb-2">
                  <Typography
                    variant="small"
                    color={sidenavType === "dark" ? "white" : "blue-gray"}
                    className="font-black uppercase opacity-75">
                    {title}
                  </Typography>
                </li>
              )}
              {pages
                .filter(({name}) => name !== "sign in" && name !== "profile")
                .map(({icon, name, path}) => (
                  <li key={name}>
                    <NavLink to={`/${layout}${path}`}>
                      {({isActive}) => (
                        <Button
                          variant={isActive ? "gradient" : "text"}
                          color={
                            isActive
                              ? sidenavColor
                              : sidenavType === "dark"
                              ? "white"
                              : "blue-gray"
                          }
                          className="flex items-center gap-4 px-4 capitalize"
                          fullWidth>
                          {icon}
                          <Typography color="inherit" className="font-medium capitalize">
                            {name !== "orders" && name !== "tables" ? (
                              name
                            ) : (
                              <>
                                <div className="flex justify-center items-center gap-3">
                                  {name}
                                  {name === "orders" && newOrder !== 0 && (
                                    <Chip color="green" value={newOrder} />
                                  )}
                                  {name === "tables" && bookedCount !== 0 && (
                                    <Chip
                                      variant="filled"
                                      color="green"
                                      value={bookedCount}
                                    />
                                  )}
                                </div>
                              </>
                            )}
                          </Typography>
                        </Button>
                      )}
                    </NavLink>
                  </li>
                ))}
            </ul>
          ))}
      </div>
    </aside>
  );
}

Sidenav.defaultProps = {
  brandImg: "/logo-business.svg",
  brandName: "QrCuisine",
};

Sidenav.propTypes = {
  brandImg: PropTypes.string,
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Sidenav.displayName = "/src/widgets/layout/sidnave.jsx";

export default Sidenav;
