import React, {useEffect, useState} from "react";
import {Card, CardBody, CardHeader, Spinner, Typography} from "@material-tailwind/react";

import {getActivityTableApis} from "@/apis/activity-table-api";
import ActivityTableView from "@/components/message-table/Activity-Table-View";
import supabase from "@/configs/supabase";

export default function ActivityTable() {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);

  const fetchTablesData = async () => {
    const tablesResult = await getActivityTableApis();
    if (tablesResult) {
      const sortedTables = tablesResult.data.sort((a, b) => {
        const latestMessageA = a.created_at ? new Date(a.created_at) : new Date(0);
        const latestMessageB = b.created_at ? new Date(b.created_at) : new Date(0);
        return latestMessageB - latestMessageA;
      });

      setTableData(sortedTables);

      // Select the first table by default
      setSelectedTable(sortedTables[0]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTablesData();
    const restaurantId = localStorage.getItem("restaurants_id");
    const tableDataSubscription = supabase
      .channel("tables_msg")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tables",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        async () => {
          fetchTablesData();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tableDataSubscription);
    };
  }, []);

  const handleTableClick = (table) => {
    setSelectedTable(table);
  };

  return (
    <div>
      <Card className="mt-5 shadow-sm border border-gray-300">
        <CardHeader floated={false} shadow={false} className="rounded-none pb-3">
          <Typography variant="h5" color="blue-gray">
            Real Time Table Activity{" "}
          </Typography>
          <Typography color="gray" className="font-normal">
            Track each table's activity and history
          </Typography>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
        <Card className="w-full relative py-5 min-h-[612px] shadow-sm border border-gray-300">
          {loading && (
            <div className="flex w-full h-full justify-center items-center">
              <Spinner className="h-8 w-8" />
            </div>
          )}
          {error && (
            <div className="w-full flex justify-center items-center">
              <Typography variant="h6" color="red">
                {error}
              </Typography>
            </div>
          )}

          {!loading && tableData.length > 0 && (
            <div className="w-full relative rounded-[20px]">
              <div className="p-0 h-[100vh] space-y-0.5 overflow-y-auto scrollbar-hidden w-full">
                {tableData.map((data, index) => {
                  return (
                    <div
                      className="relative w-full cursor-pointer"
                      key={index}
                      onClick={() => handleTableClick(data)}>
                      <div className="w-full flex rounded-none">
                        <div
                          className={`w-28 pt-3 pb-2 ${
                            data.is_booked ? "bg-orange-400" : "bg-gray-400"
                          } `}>
                          <div className="flex items-center gap-3 justify-end">
                            <div className="flex flex-col items-center relative w-full justify-center">
                              <Typography
                                variant="small"
                                color="white"
                                className="font-semibold uppercase text-xs">
                                Table No
                              </Typography>
                              <Typography
                                variant="h2"
                                color="white"
                                className="font-black text-[42px] tracking-wide leading-none">
                                {data?.table_no.toString().padStart(2, "0")}
                              </Typography>
                            </div>
                          </div>
                        </div>
                        <div className="w-full relative">
                          <div
                            className={`flex bg-gradient-to-r justify-center h-full to-white pl-6 w-full flex-col
                            ${
                              selectedTable?.id === data?.id
                                ? "from-green-100"
                                : "from-gray-100"
                            }
                           `}>
                            <Typography
                              variant="h5"
                              color="blue-gray"
                              className="font-bold uppercase">
                              {data?.order_id
                                ? data?.order_id?.status_id?.title
                                : data?.is_booked
                                ? "Booked"
                                : "Vacant"}
                            </Typography>
                            {/* {selectedTable?.id === data?.id && (
                              <Chip
                                size="sm"
                                variant="ghost"
                                value="Selected"
                                className="absolute right-3 text-xs capitalize"
                              />
                            )} */}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>

        <Card className="w-full col-span-2 relative py-5 min-h-[612px] shadow-sm border border-gray-300">
          {!loading && tableData.length > 0 && (
            <div className="w-full ">
              {/* Conditionally pass selectedTable */}
              {selectedTable ? (
                <ActivityTableView
                  tableId={selectedTable.id}
                  tableNo={selectedTable.table_no}
                  isBooked={selectedTable?.is_booked}
                  selectedTable={selectedTable}
                />
              ) : (
                <Typography>Select a table to view its details.</Typography>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
