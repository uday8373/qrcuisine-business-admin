import React, {useEffect, useState} from "react";
import {Card, CardBody, Spinner, Typography} from "@material-tailwind/react";

import {getActivityTableApis} from "@/apis/activity-table-api";
import ActivityTableView from "@/components/message-table/Activity-Table-View";

function timeAgo(createdDate) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(createdDate)) / 1000);
  if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

export default function ActivityTable() {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);

  const fetchTablesData = async () => {
    const tablesResult = await getActivityTableApis();
    if (tablesResult) {
      const tablesWithSortedMessages = tablesResult.data.map((table) => ({
        ...table,
        messages: table.messages.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        ),
      }));

      const sortedTables = tablesWithSortedMessages.sort((a, b) => {
        const latestMessageA = a.messages[0]?.created_at
          ? new Date(a.messages[0]?.created_at)
          : new Date(0); // Default to the earliest date if no messages
        const latestMessageB = b.messages[0]?.created_at
          ? new Date(b.messages[0]?.created_at)
          : new Date(0);
        return latestMessageB - latestMessageA;
      });

      setTableData(sortedTables);

      // Select the first table by default
      setSelectedTable({
        id: sortedTables[0]?.id,
        table_no: sortedTables[0]?.table_no,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTablesData();
  }, []);

  const handleTableClick = (table) => {
    setSelectedTable({
      id: table.id,
      table_no: table.table_no,
    });
  };

  return (
    <div>
      <Card className="mt-5 bg-gray-300 rounded-[20px]">
        <CardBody className="flex flex-col items-start justify-center text-start px-5 py-5">
          <Typography className="uppercase tracking-wide" variant="h4" color="black">
            Real Time Table Activity{" "}
          </Typography>
          <Typography className="tracking-wide" variant="lead">
            Track each table's activity and history
          </Typography>
        </CardBody>
      </Card>
      <Card className="h-full w-full overflow-hidden mt-5 rounded-[20px] bg-gray-300">
        <CardBody className="grid grid-cols-1 md:grid-cols-3 px-5 gap-5">
          {loading && (
            <div className="flex w-full h-96 justify-center items-center">
              <Spinner className="h-8 w-8" />
            </div>
          )}

          <div className="w-full pt-2 relative">
            {error && (
              <div className="w-full flex justify-center items-center">
                <Typography variant="h6" color="red">
                  {error}
                </Typography>
              </div>
            )}

            {!loading && tableData.length > 0 && (
              <div className="w-full relative bg-white py-10 rounded-[20px]">
                <div className="p-0 h-[100vh] space-y-2 overflow-y-auto scrollbar-hidden w-full">
                  {tableData.map((data, index) => (
                    <div
                      className="relative w-full cursor-pointer"
                      key={index}
                      onClick={() => handleTableClick(data)} // Pass the whole data object
                    >
                      <div className="w-full flex rounded-none">
                        <div
                          className={`w-36 pt-2 pb-1 ${
                            data.is_booked ? "bg-orange-400" : "bg-gray-500"
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
                                className="font-black text-[42px] tracking-wide">
                                {data?.table_no}
                              </Typography>
                            </div>
                          </div>
                        </div>
                        <div className="w-full relative">
                          <div
                            className={`${
                              data?.is_booked
                                ? "bg-green-400"
                                : selectedTable?.table_no === data?.table_no
                                ? "bg-blue-400"
                                : "bg-gray-400"
                            } absolute w-2 h-full`}></div>
                          <div
                            className={`flex bg-gradient-to-r justify-center h-full gap-1 pl-8 w-full flex-col ${
                              selectedTable?.table_no === data.table_no
                                ? " from-blue-200"
                                : "from-gray-200"
                            }
                            ${
                              data?.is_booked
                                ? "from-green-100"
                                : selectedTable?.table_no === data?.table_no
                                ? "from-blue-100"
                                : "from-gray-100"
                            }
                            `}>
                            <Typography
                              variant="h4"
                              color="blue-gray"
                              className="font-bold uppercase">
                              Table
                            </Typography>

                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal">
                              Last activity {timeAgo(data?.messages[0]?.created_at)}
                            </Typography>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-full col-span-2 mt-2 relative bg-white py-10 rounded-[20px]">
            {!loading && tableData.length > 0 && (
              <div className="w-full ">
                {/* Conditionally pass selectedTable */}
                {selectedTable ? (
                  <ActivityTableView
                    tableId={selectedTable.id}
                    tableNo={selectedTable.table_no}
                  />
                ) : (
                  <Typography>Select a table to view its details.</Typography>
                )}
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
