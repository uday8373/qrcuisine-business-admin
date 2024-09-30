import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Chip,
  IconButton,
  CardFooter,
  Spinner,
  Tooltip,
  Tabs,
  TabsHeader,
  Tab,
  Input,
  Avatar,
} from "@material-tailwind/react";
import {
  CloudArrowDownIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import React, {useEffect, useState} from "react";
import {endSession, getAllTables, getTableCounts, insertTables} from "@/apis/tables-apis";
import {AddTableModal} from "@/components/table-modal/add-table";
import jsPDF from "jspdf";
import supabase from "@/configs/supabase";
import {EndSession} from "@/components/table-modal/end-session";
import {QRShowModal} from "@/components/qr-modal/qr-modal";

const TABLE_HEAD = [
  "Table No",
  "Status",
  "Order ID",
  "Order Status",
  "Number Of Customer",
  "Customer Info",
  "QR Code",
  "action",
];

export function Tables() {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maxItems, setMaxItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [maxRow, setMaxRow] = useState(10);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    numberOfTable: "",
    table_no: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [openAddModal, setOpenAddModal] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [tabs, setTabs] = useState([
    {
      label: "All",
      value: "all",
      count: 0,
    },
    {
      label: "Booked",
      value: "true",
      count: 0,
    },
    {
      label: "Available",
      value: "false",
      count: 0,
    },
  ]);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openQrModal, setOpenQrModal] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [sessionLoading, setSessionLoading] = useState(false);
  const [selectedQr, setSelectedQr] = useState("");

  const resetFormData = () => {
    setFormData({numberOfTable: "", table_no: ""});
  };

  const fetchTablesData = async () => {
    const tablesResult = await getAllTables(currentPage, maxRow, activeTab, searchQuery);
    if (tablesResult) {
      setTableData(tablesResult.data);
      setMaxItems(tablesResult.count);
    }
    setLoading(false);
  };

  const fetchTableCount = async () => {
    const result = await getTableCounts();
    if (result) {
      setTabs([
        {label: "All", value: "all", count: result.totalTables},
        {label: "Booked", value: "true", count: result.bookedTables},
        {label: "Available", value: "false", count: result.availableTables},
      ]);
    }
  };

  useEffect(() => {
    fetchTablesData();
    fetchTableCount();

    const restaurantId = localStorage.getItem("restaurants_id");
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
          fetchTablesData();
          fetchTableCount();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tableSubscription);
    };
  }, [maxRow, currentPage, loading, activeTab, searchQuery]);

  const totalPages = Math.ceil(maxItems / maxRow);

  const handleTabChange = (value) => {
    setActiveTab(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setLoading(true);
    setCurrentPage(page);
  };

  const toogleAddModal = () => {
    resetFormData();
    setOpenAddModal(!openAddModal);
    setErrors({});
  };

  const handleSubmit = async () => {
    const isValid = validateForm();
    if (!isValid) return;
    setFormLoading(true);
    try {
      await insertTables(parseInt(formData.numberOfTable, 10));
    } catch (error) {
      console.error("Error adding tables:", error);
    } finally {
      resetFormData();
      setFormLoading(false);
      toogleAddModal();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.numberOfTable || formData.numberOfTable.trim() === "") {
      newErrors.numberOfTable = "Number of tables is required";
    } else {
      const tableNo = parseInt(formData.numberOfTable.trim(), 10);
      if (isNaN(tableNo) || tableNo < 1 || tableNo > 20) {
        newErrors.numberOfTable = "Number of table must be between 1 and 20";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDownload = (qrImageUrl, tableNo) => {
    fetch(qrImageUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `table-${tableNo}-qr.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => console.error("Error downloading the image:", error));
  };

  const handleDownloadAll = async () => {
    setDownloadLoading(true);
    const doc = new jsPDF();

    const promises = tableData.map(async (table, index) => {
      if (table.qr_image !== "Null") {
        try {
          const response = await fetch(table.qr_image);
          const blob = await response.blob();
          const imgData = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });

          const img = new Image();
          img.src = imgData;

          await new Promise((resolve) => {
            img.onload = () => {
              const originalWidth = img.width;
              const originalHeight = img.height;
              const quality = 0.7;
              const canvas = document.createElement("canvas");
              canvas.width = originalWidth;
              canvas.height = originalHeight;
              const ctx = canvas.getContext("2d");
              ctx.drawImage(img, 0, 0, originalWidth, originalHeight);
              const compressedImgData = canvas.toDataURL("image/jpeg", quality);

              doc.setPage(index + 1);
              doc.internal.pageSize.setWidth(originalWidth);
              doc.internal.pageSize.setHeight(originalHeight);

              const x = 0;
              const y = 0;

              if (index !== 0) {
                doc.addPage([originalWidth, originalHeight]);
              }

              doc.addImage(
                compressedImgData,
                "JPEG",
                x,
                y,
                originalWidth,
                originalHeight,
              );

              resolve();
            };
          });
        } catch (error) {
          console.error(`Error processing QR code for table ${table.table_no}:`, error);
        }
      }
    });

    await Promise.all(promises);

    setDownloadLoading(false);
    doc.save("table-qrcodes.pdf");
  };

  const toggleDeleteModal = () => {
    setOpenDeleteModal(!openDeleteModal);
  };

  const toggleQRModal = () => {
    setOpenQrModal(!openQrModal);
  };

  const handleDelete = (value, orderId) => {
    setSelectedId(value);
    setSelectedOrderId(orderId);
    toggleDeleteModal();
  };

  const handleQrOpen = (value) => {
    setSelectedQr(value);
    toggleQRModal();
  };

  const handleCloseSession = async () => {
    setSessionLoading(true);
    try {
      await endSession(selectedId, selectedOrderId);
    } catch (error) {
      throw error;
    } finally {
      setSessionLoading(false);
      toggleDeleteModal();
    }
  };

  return (
    <div className="mt-6 mb-8 flex flex-col gap-12 min-h-[100vh]">
      <Card className="h-full w-full">
        <CardHeader floated={false} shadow={false} className="rounded-none pb-8">
          <div className="mb-5 flex items-center justify-between gap-8">
            <div>
              <Typography variant="h5" color="blue-gray">
                Restaurant Table list
              </Typography>
              <Typography color="gray" className="mt-1 font-normal">
                See information about all tables
              </Typography>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <Button
                loading={downloadLoading}
                onClick={handleDownloadAll}
                variant="outlined"
                className="flex items-center gap-3"
                size="sm">
                <CloudArrowDownIcon strokeWidth={2} className="h-4 w-4" /> Download QR
              </Button>
              <Button
                onClick={toogleAddModal}
                className="flex items-center gap-3"
                size="sm">
                <PlusCircleIcon strokeWidth={2} className="h-4 w-4" /> Generate Tables
              </Button>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <Tabs value={activeTab} className="w-full md:w-max">
              <TabsHeader>
                {tabs.map(({label, value, count}) => (
                  <Tab
                    className="flex whitespace-nowrap"
                    key={value}
                    value={value}
                    onClick={() => handleTabChange(value)}>
                    <div className="flex items-center gap-2">
                      {label}
                      <Chip variant="ghost" value={count} size="sm" />
                    </div>
                  </Tab>
                ))}
              </TabsHeader>
            </Tabs>
            <div className="w-full md:w-72">
              <Input
                label="Search by table number"
                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setLoading(true);
                    setCurrentPage(1);
                  }
                }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-5 flex gap-4">
            <div className="flex gap-2 items-center text-sm">
              <div className="w-4 h-4 bg-green-500 rounded-md" />
              Table Booked
            </div>
            <div className="flex gap-2 items-center text-sm">
              <div className="w-4 h-4 bg-gray-500 rounded-md" />
              Table Available
            </div>
          </div>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          {loading ? (
            <div className="flex w-full h-[350px] justify-center items-center">
              <Spinner className="h-8 w-8" />
            </div>
          ) : (
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {TABLE_HEAD.map((head, index) => (
                    <th
                      key={head}
                      className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 transition-colors">
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="flex text-[11px] uppercase items-center justify-between gap-2 font-bold leading-none text-blue-gray-400">
                        {head}{" "}
                        {/* {index !== TABLE_HEAD.length - 1 && (
                          <ChevronUpDownIcon strokeWidth={2} className="h-4 w-4" />
                        )} */}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody
                className={`${tableData.length === 0 && "h-[350px]"} relative w-full`}>
                {tableData.length === 0 ? (
                  <tr>
                    <td colSpan={TABLE_HEAD.length} className="text-center py-5">
                      <Typography variant="h6" color="blue-gray" className="font-normal">
                        No Table Found
                      </Typography>
                    </td>
                  </tr>
                ) : (
                  tableData.map((table, index) => {
                    const className = `py-3 px-5 relative ${
                      index === tableData.length - 1 ? "" : "border-b border-blue-gray-50"
                    }`;

                    return (
                      <tr key={index}>
                        <td
                          className={`${className} bg-orange-400 relative w-28 border-r`}>
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
                                {table.table_no.toString().padStart(2, "0")}
                              </Typography>
                            </div>
                          </div>
                        </td>
                        <td
                          className={`${className} ${
                            table?.is_booked
                              ? "from-green-500/20 to-white"
                              : "from-gray-500/20 to-white"
                          } bg-gradient-to-r relative w-28`}>
                          <div
                            className={`w-2 h-full top-0 absolute left-0  ${
                              table?.is_booked ? "bg-green-500" : "bg-gray-500"
                            }`}
                          />
                          <div className="flex w-full justify-center">
                            <div className="flex items-center gap-3 relative w-fit ">
                              {table.is_booked && (
                                <div className="absolute -top-1 -right-1 z-20">
                                  <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                  </span>
                                </div>
                              )}
                              <Chip
                                variant="ghost"
                                color={table?.is_booked ? "green" : "gray"}
                                value={table?.is_booked ? "Booked" : "Available"}
                                className="justify-center items-center w-24"
                              />
                            </div>
                          </div>
                        </td>
                        <td className={className}>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal">
                            {table?.order_id?.order_id
                              ? table?.order_id?.order_id
                              : "N/A"}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Chip
                            variant="ghost"
                            size="md"
                            color={
                              table?.order_id?.status_id?.sorting === 1
                                ? "blue"
                                : table?.order_id?.status_id?.sorting === 2
                                ? "green"
                                : table?.order_id?.status_id?.sorting === 3
                                ? "orange"
                                : table?.order_id?.status_id?.sorting === 4
                                ? "green"
                                : "gray"
                            }
                            value={
                              table?.order_id?.status_id?.title
                                ? table?.order_id?.status_id?.title
                                : "N/A"
                            }
                            className="flex justify-center"
                          />
                        </td>
                        <td className={className}>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal">
                            {table?.persons ? `${table?.persons} persons` : "N/A"}
                          </Typography>
                        </td>
                        <td className={className}>
                          {table?.order_id?.user_id ? (
                            <div className="flex flex-col gap-1">
                              <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-normal">
                                {table?.order_id?.user_id?.name}
                              </Typography>{" "}
                              <Typography
                                variant="small"
                                color="blue"
                                className="font-normal">
                                +91 {table?.order_id?.user_id?.mobile}
                              </Typography>
                            </div>
                          ) : (
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal">
                              N/A
                            </Typography>
                          )}
                        </td>
                        <td className={className}>
                          <div
                            onClick={() => {
                              handleQrOpen(table?.qr_image);
                            }}
                            className="cursor-pointer">
                            <Avatar
                              src={`${table?.qr_image?.replace(
                                "/upload/",
                                "/upload/c_scale,w_100/",
                              )}`}
                              variant="rounded"
                            />
                          </div>
                        </td>
                        <td className={`${className} w-28`}>
                          <div className="flex">
                            <Tooltip content="End Session">
                              <IconButton
                                onClick={() => {
                                  handleDelete(table?.id, table?.order_id?.id);
                                }}
                                variant="text">
                                <TrashIcon className="h-5 w-5" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip content="Download Qr Code">
                              <IconButton
                                onClick={() =>
                                  handleDownload(table?.qr_image, table?.table_no)
                                }
                                variant="text">
                                <CloudArrowDownIcon className="h-5 w-5" />
                              </IconButton>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </CardBody>
        <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
          <Typography variant="small" color="blue-gray" className="font-normal">
            Page {currentPage} of {totalPages}
          </Typography>
          <div className="flex items-center gap-2 mt-4">
            {(() => {
              const pages = [];
              if (totalPages <= 5) {
                for (let i = 1; i <= totalPages; i++) {
                  pages.push(i);
                }
              } else {
                if (currentPage <= 3) {
                  pages.push(1, 2, 3, 4, "...");
                } else if (currentPage >= totalPages - 2) {
                  pages.push(
                    "...",
                    totalPages - 3,
                    totalPages - 2,
                    totalPages - 1,
                    totalPages,
                  );
                } else {
                  pages.push("...", currentPage - 1, currentPage, currentPage + 1, "...");
                }
              }

              return pages.map((page, index) => (
                <React.Fragment key={index}>
                  {page === "..." ? (
                    <span className="text-blue-gray-500">...</span>
                  ) : (
                    <IconButton
                      variant={page === currentPage ? "filled" : "text"}
                      disabled={page === currentPage}
                      size="sm"
                      onClick={() => handlePageChange(page)}>
                      {page}
                    </IconButton>
                  )}
                </React.Fragment>
              ));
            })()}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outlined"
              size="sm"
              className="w-24"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}>
              Previous
            </Button>
            <Button
              variant="outlined"
              size="sm"
              className="w-24"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}>
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
      <AddTableModal
        open={openAddModal}
        setOpen={setOpenAddModal}
        formData={formData}
        setFormData={setFormData}
        handleOpen={toogleAddModal}
        handleSubmit={handleSubmit}
        loading={formLoading}
        errors={errors}
      />

      <EndSession
        open={openDeleteModal}
        setOpen={setOpenDeleteModal}
        handleOpen={toggleDeleteModal}
        handleSubmit={handleCloseSession}
        loading={sessionLoading}
      />
      <QRShowModal
        open={openQrModal}
        setOpen={setOpenQrModal}
        handleOpen={toggleQRModal}
        selectedQr={selectedQr}
      />
    </div>
  );
}

export default Tables;
