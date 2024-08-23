import {
  deleteCategory,
  getAllCategories,
  insertCategory,
  updateCategory,
} from "@/apis/category-apis";
import {AddCategoryModal} from "@/components/category-modal/add-category";
import {DeleteCategoryModal} from "@/components/category-modal/delete-category";
import {UpdateCategoryModal} from "@/components/category-modal/update-category";
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
  IconButton,
  Tooltip,
  Spinner,
} from "@material-tailwind/react";
import React, {useEffect, useState} from "react";

const TABS = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "Available",
    value: "true",
  },
  {
    label: "Unavailable",
    value: "false",
  },
];

const TABLE_HEAD = ["Title", "Status", "Created", "Action"];

export function Category() {
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maxItems, setMaxItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [maxRow, setMaxRow] = useState(10);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    status: true,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const fetchCategoryData = async () => {
    const categoryResult = await getAllCategories(
      currentPage,
      maxRow,
      activeTab,
      searchQuery,
    );
    if (categoryResult) {
      setCategoryData(categoryResult.data);
      setMaxItems(categoryResult.count);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategoryData();
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

  const resetFormData = () => {
    setFormData({title: "", status: true});
  };

  const toogleAddModal = () => {
    resetFormData();
    setOpenAddModal(!openAddModal);
    setErrors({});
  };

  const handleUpdate = (value) => {
    setFormData({
      title: value.title,
      status: value.status,
      id: value.id,
    });
    toggleUpdateModal();
  };

  const toggleUpdateModal = () => {
    setOpenUpdateModal(!openUpdateModal);
    setErrors({});
  };

  const handleSubmit = async () => {
    const isValid = validateForm();
    if (!isValid) return;
    setFormLoading(true);
    try {
      await insertCategory(formData);
    } catch (error) {
      console.error("Error adding category:", error);
    } finally {
      resetFormData();
      setFormLoading(false);
      toogleAddModal();
      fetchCategoryData();
    }
  };

  const handleUpdateSubmit = async () => {
    const isValid = validateForm();
    if (!isValid) return;
    setFormLoading(true);
    try {
      await updateCategory(formData);
    } catch (error) {
      console.error("Error updating category:", error);
    } finally {
      resetFormData();
      setFormLoading(false);
      toggleUpdateModal();
      fetchCategoryData();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title || formData.title.trim() === "") {
      newErrors.title = "Title is required";
    }

    if (formData.status !== "true" && formData.status !== "false") {
      newErrors.status = "Status must be Available or Unavailable";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      await deleteCategory(formData);
    } catch (error) {
      console.error("Error deleting category:", error);
    } finally {
      resetFormData();
      setFormLoading(false);
      toggleDeleteModal();
      fetchCategoryData();
    }
  };

  return (
    <div className="mt-8 mb-8 flex flex-col gap-12">
      <Card className="h-full w-full">
        <CardHeader floated={false} shadow={false} className="rounded-none">
          <div className="mb-5 flex items-center justify-between gap-8">
            <div>
              <Typography variant="h5" color="blue-gray">
                Categories list
              </Typography>
              <Typography color="gray" className="mt-1 font-normal">
                See information about all categories
              </Typography>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <Button
                onClick={toogleAddModal}
                className="flex items-center gap-3"
                size="sm">
                <PlusCircleIcon strokeWidth={2} className="h-4 w-4" /> Add category
              </Button>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <Tabs value={activeTab} className="w-full md:w-max">
              <TabsHeader>
                {TABS.map(({label, value}) => (
                  <Tab key={value} value={value} onClick={() => handleTabChange(value)}>
                    &nbsp;&nbsp;{label}&nbsp;&nbsp;
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
                      className="cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 transition-colors hover:bg-blue-gray-50">
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="flex items-center justify-between gap-2 font-normal leading-none opacity-70">
                        {head}{" "}
                        {index !== TABLE_HEAD.length - 1 && (
                          <ChevronUpDownIcon strokeWidth={2} className="h-4 w-4" />
                        )}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody
                className={`${categoryData.length === 0 && "h-[300px]"} relative w-full`}>
                {categoryData.length === 0 ? (
                  <div className="w-full absolute flex justify-center items-center h-full">
                    <Typography variant="h6" color="blue-gray" className="font-normal">
                      No Category Found
                    </Typography>
                  </div>
                ) : (
                  categoryData.map(({created_at, category_name, status, id}, index) => {
                    const isLast = index === categoryData.length - 1;
                    const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

                    return (
                      <tr key={index}>
                        <td className={classes}>
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col">
                              <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-normal">
                                {category_name}
                              </Typography>
                            </div>
                          </div>
                        </td>

                        <td className={classes}>
                          <div className="w-max">
                            <Chip
                              variant="ghost"
                              size="sm"
                              value={status ? "Available" : "Unavailable"}
                              color={status ? "green" : "blue-gray"}
                              className="w-24 justify-center"
                            />
                          </div>
                        </td>
                        <td className={classes}>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal">
                            {new Date(created_at)
                              .toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                              .replace(/-/g, " ")}
                          </Typography>
                        </td>
                        <td className={`${classes} w-28`}>
                          <Tooltip content="Edit Category">
                            <IconButton
                              onClick={() =>
                                handleUpdate({
                                  id: id,
                                  title: category_name,
                                  status: status,
                                })
                              }
                              variant="text">
                              <PencilIcon className="h-4 w-4" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip content="Delete Category">
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
      <AddCategoryModal
        open={openAddModal}
        setOpen={setOpenAddModal}
        formData={formData}
        setFormData={setFormData}
        handleOpen={toogleAddModal}
        handleSubmit={handleSubmit}
        loading={formLoading}
        errors={errors}
      />
      <UpdateCategoryModal
        open={openUpdateModal}
        setOpen={setOpenUpdateModal}
        formData={formData}
        setFormData={setFormData}
        handleOpen={toggleUpdateModal}
        handleSubmit={handleUpdateSubmit}
        loading={formLoading}
        errors={errors}
      />
      <DeleteCategoryModal
        open={openDeleteModal}
        setOpen={setOpenDeleteModal}
        handleOpen={toggleDeleteModal}
        handleSubmit={handleDeleteSubmit}
        loading={formLoading}
      />
    </div>
  );
}
