import {uploadImageToCloudinary} from "@/apis/cloudinary-upload";
import {
  deleteFood,
  getAdditionalSideId,
  getAllFoods,
  getCategories,
  getFoodCounts,
  getQuantityId,
  getQuickInstructionId,
  getSideId,
  insertFood,
  updateFood,
} from "@/apis/food-apis";
import {AddFoodModal} from "@/components/food-modal/add-food";
import {DeleteFoodModal} from "@/components/food-modal/delete-food";
import {UpdateFoodModal} from "@/components/food-modal/update-food";
import {WEB_CONFIG} from "@/configs/website-config";
import {MagnifyingGlassIcon, ChevronUpDownIcon} from "@heroicons/react/24/outline";
import {PencilIcon, PlusCircleIcon, TrashIcon} from "@heroicons/react/24/solid";
import {
  Card,
  CardHeader,
  Input,
  Typography,
  Button,
  CardBody,
  Chip,
  CardFooter,
  Tabs,
  TabsHeader,
  Tab,
  Avatar,
  IconButton,
  Tooltip,
  Spinner,
} from "@material-tailwind/react";
import React, {useEffect, useState} from "react";

const TABLE_HEAD = [
  "Title",
  "Category",
  "Price",
  "Food Type",
  "Is Special",
  "Status",
  "Action",
];

export function FoodItems() {
  const [foodData, setFoodData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [quantityId, setQuantityId] = useState([]);
  const [quickInstructionId, setQuickInstructionId] = useState([]);
  const [sideId, setSideId] = useState([]);
  const [additionalSideId, setAdditionalSideId] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maxItems, setMaxItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [maxRow, setMaxRow] = useState(10);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [openAddModal, setOpenAddModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    status: true,
    foodType: true,
    category: "",
    price: "",
    isSpecial: false,
    image: "",
    quantity: "",
    is_customized: false,
    quantity_id: "",
    quick_instruction_id: "",
    side_id: "",
    additional_side_id: "",
    is_temperature: false,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [tabs, setTabs] = useState([
    {
      label: "All",
      value: "all",
      count: 0,
    },
    {
      label: "Available",
      value: "true",
      count: 0,
    },
    {
      label: "Unavailable",
      value: "false",
      count: 0,
    },
  ]);

  const resetFormData = () => {
    setFormData({
      title: "",
      status: true,
      foodType: true,
      category: "",
      price: "",
      isSpecial: false,
      image: "",
      quantity: "",
      is_customized: false,
      quantity_id: "",
      quick_instruction_id: "",
      side_id: "",
      additional_side_id: "",
      is_temperature: false,
    });
  };

  const fetchFoodData = async () => {
    const foodResult = await getAllFoods(currentPage, maxRow, activeTab, searchQuery);
    if (foodResult) {
      setFoodData(foodResult.data);
      setMaxItems(foodResult.count);
    }
    setLoading(false);
  };

  const fetchCategoryData = async () => {
    const categoryResult = await getCategories();
    if (categoryResult) {
      setCategoryData(categoryResult);
    }
  };
  const fetchQuantityIdData = async () => {
    const quantityIdResult = await getQuantityId();
    if (quantityIdResult) {
      setQuantityId(quantityIdResult);
    }
  };
  const fetchQuickInstructionIdData = async () => {
    const quickInstructionIdResult = await getQuickInstructionId();
    if (quickInstructionIdResult) {
      setQuickInstructionId(quickInstructionIdResult);
    }
  };
  const fetchSideIdData = async () => {
    const sideIdResult = await getSideId();
    if (sideIdResult) {
      setSideId(sideIdResult);
    }
  };
  const fetchAdditionalSideIdData = async () => {
    const additionalSideIdResult = await getAdditionalSideId();
    if (additionalSideIdResult) {
      setAdditionalSideId(additionalSideIdResult);
    }
  };
  const fetchCount = async () => {
    const result = await getFoodCounts();
    if (result) {
      setTabs([
        {label: "All", value: "all", count: result.total},
        {label: "Available", value: "true", count: result.available},
        {label: "Unavailable", value: "false", count: result.unAvailable},
      ]);
    }
  };

  useEffect(() => {
    fetchFoodData();
    fetchCategoryData();
    fetchQuantityIdData();
    fetchQuickInstructionIdData();
    fetchSideIdData();
    fetchAdditionalSideIdData();
    fetchCount();
  }, [maxRow, currentPage, loading, activeTab, searchQuery]);
  const totalPages = Math.ceil(maxItems / maxRow);

  const handlePageChange = (page) => {
    setLoading(true);
    setCurrentPage(page);
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    setCurrentPage(1);
  };

  const toogleAddModal = () => {
    resetFormData();
    setOpenAddModal(!openAddModal);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title || formData.title.trim() === "") {
      newErrors.title = "Title is required";
    }
    if (formData.category === "") {
      newErrors.category = "Category is required";
    }

    if (!formData.price || isNaN(formData.price) || formData.price <= 0) {
      newErrors.price = "Price must be a positive number";
    }

    if (!formData.image) {
      newErrors.image = "Image is required";
    }

    if (formData.quantity === "") {
      newErrors.quantity = "Quantity is required";
    }

    if (formData.foodType === "") {
      newErrors.foodType = "Food Type must be Vegetarian or Non-Vegetarian";
    }

    if (formData.isSpecial === "") {
      newErrors.isSpecial = "Is Special must be Yes or No";
    }

    if (formData.status === "") {
      newErrors.status = "Status must be Available or Unavailable";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    const isValid = validateForm();
    if (!isValid) return;
    setFormLoading(true);
    try {
      const imageUrl = await uploadImageToCloudinary(formData.image);

      const dataToInsert = {
        ...formData,
        image: imageUrl,
      };

      await insertFood(dataToInsert);
    } catch (error) {
      console.error("Error adding food:", error);
    } finally {
      resetFormData();
      setFormLoading(false);
      toogleAddModal();
      fetchFoodData();
      fetchCount();
    }
  };

  const toggleUpdateModal = () => {
    setOpenUpdateModal(!openUpdateModal);
    setErrors({});
  };

  const handleUpdate = (value) => {
    setFormData({
      title: value.title,
      status: value.status,
      foodType: value.foodType,
      category: value.category,
      price: value.price,
      isSpecial: value.isSpecial,
      image: value.image,
      quantity: value.quantity,
      id: value.id,
      is_customized: value.is_customized,
      quantity_id: value.quantity_id,
      quick_instruction_id: value.quick_instruction_id,
      side_id: value.side_id,
      additional_side_id: value.additional_side_id,
      is_temperature: value.is_temperature,
    });
    toggleUpdateModal();
  };

  const handleUpdateSubmit = async () => {
    const isValid = validateForm();
    if (!isValid) return;
    setFormLoading(true);
    try {
      await updateFood(formData);
    } catch (error) {
      console.error("Error updating food:", error);
    } finally {
      resetFormData();
      setFormLoading(false);
      toggleUpdateModal();
      fetchFoodData();
      fetchCount();
    }
  };

  const toggleDeleteModal = () => {
    setOpenDeleteModal(!openDeleteModal);
  };

  const handleDelete = (value) => {
    setFormData({
      id: value.id,
    });
    toggleDeleteModal();
  };

  const handleDeleteSubmit = async () => {
    setFormLoading(true);
    try {
      await deleteFood(formData);
    } catch (error) {
      console.error("Error deleting category:", error);
    } finally {
      resetFormData();
      setFormLoading(false);
      toggleDeleteModal();
      fetchFoodData();
      fetchCount();
    }
  };

  return (
    <div className="mt-6 mb-8 flex flex-col gap-12">
      <Card className="h-full w-full">
        <CardHeader floated={false} shadow={false} className="rounded-none">
          <div className="mb-8 flex items-center justify-between gap-8">
            <div>
              <Typography variant="h5" color="blue-gray">
                Food Items list
              </Typography>
              <Typography color="gray" className="mt-1 font-normal">
                See information about all food items
              </Typography>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <Button
                onClick={toogleAddModal}
                className="flex items-center gap-3"
                size="sm">
                <PlusCircleIcon strokeWidth={2} className="h-4 w-4" /> Add food items
              </Button>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <Tabs value="all" className="w-full md:w-max">
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
                label="Search by title"
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
              <div className="w-5 h-5 bg-green-500 rounded-md" />
              Available
            </div>
            <div className="flex gap-2 items-center text-sm">
              <div className="w-5 h-5 bg-gray-700 rounded-md" />
              Unavailable
            </div>
          </div>
        </CardHeader>
        <CardBody className="overflow-scroll px-0">
          {loading ? (
            <div className="flex w-full h-[350px] justify-center items-center">
              <Spinner className="h-8 w-8" />
            </div>
          ) : (
            <table className="mt-4 w-full min-w-max table-auto text-left">
              <thead>
                <tr>
                  {TABLE_HEAD.map((head, index) => (
                    <th
                      key={head}
                      className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 transition-colors">
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="flex items-center justify-between gap-2 font-normal leading-none opacity-70">
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
                className={`${foodData.length === 0 && "h-[350px]"} relative w-full`}>
                {foodData.length === 0 ? (
                  <div className="w-full absolute flex justify-center items-center h-full">
                    <Typography variant="h6" color="blue-gray" className="font-normal">
                      No FoodItem Found
                    </Typography>
                  </div>
                ) : (
                  foodData.map(
                    (
                      {
                        food_name,
                        quantity,
                        price,
                        category,
                        is_veg,
                        isSpecial,
                        is_available,
                        image,
                        id,
                        is_customized,
                        quantity_id,
                        quick_instruction_id,
                        side_id,
                        additional_side_id,
                        is_temperature,
                      },
                      index,
                    ) => {
                      const isLast = index === foodData.length - 1;
                      const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

                      return (
                        <tr key={index}>
                          <td
                            className={`${classes} ${
                              is_available ? "bg-green-500" : "bg-gray-700"
                            } bg-opacity-20 relative`}>
                            <div
                              className={`w-2 h-full top-0 absolute left-0  ${
                                is_available ? "bg-green-500" : "bg-gray-700"
                              }`}
                            />
                            <div className="flex items-center gap-3 ml-2">
                              <div className="flex items-center gap-3 relative w-fit">
                                {is_available && (
                                  <div className="absolute -top-1 -right-1 z-20">
                                    <span class="relative flex h-3 w-3">
                                      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                      <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                    </span>
                                  </div>
                                )}
                                <Avatar
                                  src={`${image?.replace(
                                    "/upload/",
                                    "/upload/c_scale,w_100/",
                                  )}`}
                                  alt={food_name}
                                  size="sm"
                                  variant="rounded"
                                />
                              </div>
                              <div className="flex flex-col">
                                <Typography
                                  variant="small"
                                  color="blue-gray"
                                  className="font-normal">
                                  {food_name}
                                </Typography>
                              </div>
                            </div>
                          </td>
                          <td className={classes}>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal">
                              {category?.category_name}
                            </Typography>
                          </td>
                          <td className={classes}>
                            <div className="flex gap-2">
                              <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-normal">
                                {WEB_CONFIG?.currencySymbol} {price}.00
                              </Typography>
                              <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-normal">
                                ( {quantity} )
                              </Typography>
                            </div>
                          </td>
                          <td className={classes}>
                            <div className="w-max">
                              <Chip
                                variant="ghost"
                                size="sm"
                                value={is_veg ? "Veg" : "Non Veg"}
                                color={is_veg ? "green" : "deep-orange"}
                                className="w-24 justify-center"
                              />
                            </div>
                          </td>
                          <td className={classes}>
                            <div className="w-max">
                              <Chip
                                variant="ghost"
                                size="sm"
                                value={isSpecial ? "Special" : "None"}
                                color={isSpecial ? "blue" : "blue-gray"}
                                className="w-24 justify-center"
                              />
                            </div>
                          </td>
                          <td className={classes}>
                            <div className="w-max">
                              <Chip
                                variant="ghost"
                                size="sm"
                                value={is_available ? "Available" : "Unavailable"}
                                color={is_available ? "green" : "blue-gray"}
                                className="w-24 justify-center"
                              />
                            </div>
                          </td>

                          <td className={`${classes} w-28`}>
                            <Tooltip content="Edit Food">
                              <IconButton
                                onClick={() =>
                                  handleUpdate({
                                    id: id,
                                    title: food_name,
                                    status: is_available,
                                    foodType: is_veg,
                                    category: category.id,
                                    price: price,
                                    isSpecial: isSpecial,
                                    image: image,
                                    quantity: quantity,
                                    is_customized: is_customized,
                                    quantity_id: quantity_id,
                                    quick_instruction_id: quick_instruction_id,
                                    side_id: side_id,
                                    additional_side_id: additional_side_id,
                                    is_temperature: is_temperature,
                                  })
                                }
                                variant="text">
                                <PencilIcon className="h-4 w-4" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip content="Delete Food">
                              <IconButton
                                onClick={() =>
                                  handleDelete({
                                    id: id,
                                  })
                                }
                                variant="text">
                                <TrashIcon className="h-4 w-4" />
                              </IconButton>
                            </Tooltip>
                          </td>
                        </tr>
                      );
                    },
                  )
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
      <AddFoodModal
        open={openAddModal}
        setOpen={setOpenAddModal}
        formData={formData}
        setFormData={setFormData}
        handleOpen={toogleAddModal}
        categoryData={categoryData}
        quantityId={quantityId}
        quickInstructionId={quickInstructionId}
        sideId={sideId}
        additionalSideId={additionalSideId}
        handleSubmit={handleSubmit}
        loading={formLoading}
        errors={errors}
      />
      <UpdateFoodModal
        open={openUpdateModal}
        setOpen={setOpenUpdateModal}
        formData={formData}
        setFormData={setFormData}
        handleOpen={toggleUpdateModal}
        handleSubmit={handleUpdateSubmit}
        loading={formLoading}
        errors={errors}
        categoryData={categoryData}
        quantityId={quantityId}
        quickInstructionId={quickInstructionId}
        sideId={sideId}
        additionalSideId={additionalSideId}
      />
      <DeleteFoodModal
        open={openDeleteModal}
        setOpen={setOpenDeleteModal}
        handleOpen={toggleDeleteModal}
        handleSubmit={handleDeleteSubmit}
        loading={formLoading}
      />
    </div>
  );
}
