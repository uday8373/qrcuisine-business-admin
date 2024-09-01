import {uploadImageToCloudinary} from "@/apis/cloudinary-upload";
import {getRestaurant} from "@/apis/profile-apis";
import {useLocation} from "react-router-dom";
import supabase from "@/configs/supabase";
import {
  CalendarDaysIcon,
  HomeModernIcon,
  PencilIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import {
  Button,
  Card,
  Chip,
  Input,
  Option,
  Select,
  Switch,
  Tab,
  Tabs,
  TabsHeader,
  Textarea,
  Typography,
} from "@material-tailwind/react";
import React, {useEffect, useState} from "react";

const tabs = [
  {
    label: "Restaurant Info",
    value: "restaurantInfo",
    icon: HomeModernIcon,
  },
  {
    label: "Owner Info",
    value: "ownerInfo",
    icon: UserIcon,
  },
  {
    label: "Opening Times",
    value: "openingTimes",
    icon: CalendarDaysIcon,
  },
];

const Settings = () => {
  const location = useLocation();
  const {tab} = location.state || {};

  const [activeTab, setActiveTab] = useState(tab ? tab : "restaurantInfo");
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchRestaurantData = async () => {
    const restaurantResult = await getRestaurant();

    if (restaurantResult) {
      setData(restaurantResult);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRestaurantData();
  }, [activeTab]);

  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  return (
    <div className="mt-8 mb-8 flex flex-col gap-8">
      <Tabs value={activeTab} onChange={handleTabChange} className="w-full lg:w-max">
        <TabsHeader>
          {tabs.map(({label, value, icon}) => (
            <Tab
              key={value}
              value={value}
              onClick={() => handleTabChange(value)}
              className="px-10 whitespace-nowrap text-base">
              <div className="flex items-center gap-2">
                {React.createElement(icon, {className: "w-4 h-4"})}
                {label}
              </div>
            </Tab>
          ))}
        </TabsHeader>
      </Tabs>
      {activeTab === "restaurantInfo" && (
        <RestaurantInfo data={data} fetchRestaurantData={fetchRestaurantData} />
      )}
      {activeTab === "ownerInfo" && (
        <OwnerInfo data={data} fetchRestaurantData={fetchRestaurantData} />
      )}
      {activeTab === "openingTimes" && (
        <OpeningTimes data={data} fetchRestaurantData={fetchRestaurantData} />
      )}
    </div>
  );
};

export default Settings;

const RestaurantInfo = ({data, fetchRestaurantData}) => {
  const [formData, setFormData] = useState({
    restaurant_name: "",
    restaurant_email: "",
    restaurant_address: "",
    total_tables: "",
    restaurant_mobile: "",
    is_open: "",
    restaurant_information: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageData, setImageData] = useState({
    logo: "",
    background_image: "",
  });

  useEffect(() => {
    if (data) {
      setFormData({
        id: data.id || "",
        restaurant_name: data.restaurant_name || "",
        restaurant_email: data.restaurant_email || "",
        restaurant_address: data.restaurant_address || "",
        total_tables: data.total_tables || "",
        restaurant_mobile: data.restaurant_mobile || "",
        is_open: data.is_open,
        restaurant_information: data.restaurant_information || "",
      });
      setImageData({
        logo: data.logo || "",
        background_image: data.background_image || "",
      });
    }
  }, [data]);

  const validateForm = () => {
    let formErrors = {};

    if (!formData.restaurant_name.trim()) {
      formErrors.restaurant_name = "Restaurant name is required";
    }

    if (!formData.restaurant_email.trim()) {
      formErrors.restaurant_email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.restaurant_email)) {
      formErrors.restaurant_email = "Email is invalid";
    }

    if (!formData.restaurant_mobile.trim()) {
      formErrors.restaurant_mobile = "Mobile number is required";
    } else if (formData.restaurant_mobile.length < 10) {
      formErrors.restaurant_mobile = "Mobile number should be at least 10 digits";
    }

    if (!formData.restaurant_address.trim()) {
      formErrors.restaurant_address = "Restaurant Location is required";
    }
    if (!formData.restaurant_information.trim()) {
      formErrors.restaurant_information = "Restaurant Description is required";
    }

    if (!formData.total_tables.trim()) {
      formErrors.total_tables = "Number of tables is required";
    } else if (isNaN(formData.total_tables) || formData.total_tables <= 0) {
      formErrors.total_tables = "Number of tables should be a positive number";
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const {name, value} = e.target;
    setFormData({...formData, [name]: value});
  };

  const handleStatusChange = (value) => {
    console.log("object", value);
    setFormData({
      ...formData,
      is_open: value,
    });
  };

  const handleRestaurantSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    const {data, error} = await supabase
      .from("restaurants")
      .update(formData)
      .eq("id", formData.id)
      .select();

    if (error) {
      console.error("Error updating restaurant info:", error);
    } else {
      fetchRestaurantData();
    }
    setLoading(false);
  };

  const handleImageChange = (e, imageType) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageData((prevState) => ({
          ...prevState,
          [imageType]: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRestaurantImageSubmit = async () => {
    setIsLoading(true);
    try {
      const logoUrl = await uploadImageToCloudinary(imageData.logo);
      const backgroundUrl = await uploadImageToCloudinary(imageData.background_image);

      const dataToInsert = {
        ...imageData,
        logo: logoUrl,
        background_image: backgroundUrl,
      };
      const {data, error} = await supabase
        .from("restaurants")
        .update(dataToInsert)
        .eq("id", formData.id)
        .select();

      if (error) {
        console.error("Error updating restaurant info:", error);
      } else {
        fetchRestaurantData();
      }
    } catch (error) {
      console.error("Error updating restaurant info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-6 mr-3">
      <Card shadow={false} className="border col-span-2 p-5 gap-6">
        <Typography variant="h3" className="text-lg font-bold">
          Restaurant Information
        </Typography>
        <div className="grid grid-cols-2 gap-6">
          <div className="w-full col-span-1 gap-6 flex flex-col">
            <div>
              <Input
                type="text"
                label="Restaurant Name"
                name="restaurant_name"
                value={formData.restaurant_name}
                onChange={handleInputChange}
                error={errors.restaurant_name}
              />
              {errors.restaurant_name && (
                <Typography variant="small" color="red" className="mt-1">
                  {errors.restaurant_name}
                </Typography>
              )}
            </div>
            <div>
              <Input
                type="email"
                label="Email"
                name="restaurant_email"
                value={formData.restaurant_email}
                onChange={handleInputChange}
                error={errors.restaurant_email}
              />
              {errors.restaurant_email && (
                <Typography variant="small" color="red" className="mt-1">
                  {errors.restaurant_email}
                </Typography>
              )}
            </div>
            <div>
              <Input
                type="text"
                label="Location"
                name="restaurant_address"
                value={formData.restaurant_address}
                onChange={handleInputChange}
                error={errors.restaurant_address}
              />
              {errors.restaurant_address && (
                <Typography variant="small" color="red" className="mt-1">
                  {errors.restaurant_address}
                </Typography>
              )}
            </div>
          </div>
          <div className="w-full col-span-1 gap-6 flex flex-col">
            <div>
              <Input
                type="number"
                label="Number Of Table"
                name="total_tables"
                value={formData.total_tables}
                onChange={handleInputChange}
                error={errors.total_tables}
              />
              {errors.total_tables && (
                <Typography variant="small" color="red" className="mt-1">
                  {errors.total_tables}
                </Typography>
              )}
            </div>
            <div>
              <Input
                type="number"
                label="Mobile Number"
                name="restaurant_mobile"
                value={formData.restaurant_mobile}
                onChange={handleInputChange}
                error={errors.restaurant_mobile}
              />

              {errors.restaurant_mobile && (
                <Typography variant="small" color="red" className="mt-1">
                  {errors.restaurant_mobile}
                </Typography>
              )}
            </div>
            <Select
              label="Status"
              name="is_open"
              value={formData.is_open}
              onChange={handleStatusChange}>
              <Option value={true}>Open</Option>
              <Option value={false}>Close</Option>
            </Select>
          </div>
        </div>
        <div>
          <Textarea
            label="Message"
            name="restaurant_information"
            value={formData.restaurant_information}
            onChange={handleInputChange}
          />
          {errors.restaurant_information && (
            <Typography variant="small" color="red" className="mt-1">
              {errors.restaurant_information}
            </Typography>
          )}
        </div>
        <Button
          loading={loading}
          className="w-max self-end"
          onClick={handleRestaurantSubmit}>
          Save Changes
        </Button>
      </Card>
      <Card shadow={false} className="border col-span-1 p-5 h-full gap-6">
        <div className="flex flex-col gap-6 h-full">
          <Typography variant="h3" className="text-lg font-bold">
            Restaurant Photos
          </Typography>
          <div className="flex w-full justify-center items-end h-full relative">
            <div className="w-full h-60 rounded-xl relative flex">
              <div className="w-full h-full relative flex">
                <img
                  src={imageData?.background_image}
                  className="object-cover rounded-xl w-full"
                  alt="Background"
                />
                <input
                  type="file"
                  accept="image/*"
                  style={{display: "none"}}
                  id="backgroundImageInput"
                  onChange={(e) => handleImageChange(e, "background_image")}
                />
                <button
                  size="sm"
                  color="white"
                  className="absolute top-2 right-2 rounded-full z-40 p-2 bg-white"
                  onClick={() => document.getElementById("backgroundImageInput").click()}>
                  <PencilIcon className="h-4 w-4 text-orange-600" />
                </button>
              </div>
            </div>
            <div className="w-28 h-28 rounded-xl absolute top-0 flex ">
              <div className="w-full h-full relative flex">
                <img
                  src={imageData?.logo}
                  className="object-cover rounded-xl w-full border-2 border-white"
                  alt="Logo"
                />
                <input
                  type="file"
                  accept="image/*"
                  style={{display: "none"}}
                  id="logoImageInput"
                  onChange={(e) => handleImageChange(e, "logo")}
                />
                <button
                  size="sm"
                  color="white"
                  className="absolute top-2 right-2 rounded-full p-2 bg-white"
                  onClick={() => document.getElementById("logoImageInput").click()}>
                  <PencilIcon className="h-4 w-4 text-orange-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
        <Button
          loading={isLoading}
          className="w-max self-end"
          onClick={handleRestaurantImageSubmit}
          disabled={loading}>
          Save Changes
        </Button>
      </Card>
    </div>
  );
};

const OwnerInfo = ({data, fetchRestaurantData}) => {
  const [formData, setFormData] = useState({
    restaurant_name: "",
    restaurant_email: "",
    restaurant_address: "",
    total_tables: "",
    restaurant_mobile: "",
    is_open: "",
    restaurant_information: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data) {
      setFormData({
        id: data.id || "",
        owner_name: data.owner_name || "",
        owner_email: data.owner_email || "",
        owner_address: data.owner_address || "",
        owner_mobile: data.owner_mobile || "",
      });
    }
  }, [data]);

  const validateForm = () => {
    let formErrors = {};

    if (!formData.owner_name.trim()) {
      formErrors.owner_name = "Owner name is required";
    }

    if (!formData.owner_email.trim()) {
      formErrors.owner_email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.owner_email)) {
      formErrors.owner_email = "Email is invalid";
    }

    if (!formData.owner_mobile.trim()) {
      formErrors.owner_mobile = "Mobile number is required";
    } else if (formData.owner_mobile.length < 10) {
      formErrors.owner_mobile = "Mobile number should be at least 10 digits";
    }

    if (!formData.owner_address.trim()) {
      formErrors.owner_address = "Location is required";
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const {name, value} = e.target;
    setFormData({...formData, [name]: value});
  };

  const handleOwnerSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    const {data, error} = await supabase
      .from("restaurants")
      .update(formData)
      .eq("id", formData.id)
      .select();

    if (error) {
      console.error("Error updating owner info:", error);
    } else {
      fetchRestaurantData();
    }
    setLoading(false);
  };

  return (
    <Card shadow={false} className="border col-span-2 p-5 gap-6 mr-3">
      <Typography variant="h3" className="text-lg font-bold">
        Owner Information
      </Typography>
      <div className="grid grid-cols-2 gap-6">
        <div className="w-full col-span-1 gap-6 flex flex-col">
          <div>
            <Input
              type="text"
              label="Owner Name"
              name="owner_name"
              value={formData.owner_name}
              onChange={handleInputChange}
              error={errors.owner_name}
            />
            {errors.owner_name && (
              <Typography variant="small" color="red" className="mt-1">
                {errors.owner_name}
              </Typography>
            )}
          </div>
          <div>
            <Input
              type="email"
              label="Email"
              name="owner_email"
              value={formData.owner_email}
              onChange={handleInputChange}
              error={errors.owner_email}
            />
            {errors.owner_email && (
              <Typography variant="small" color="red" className="mt-1">
                {errors.owner_email}
              </Typography>
            )}
          </div>
        </div>
        <div className="w-full col-span-1 gap-6 flex flex-col">
          <div>
            <Input
              type="number"
              label="Mobile"
              name="owner_mobile"
              value={formData.owner_mobile}
              onChange={handleInputChange}
              error={errors.owner_mobile}
            />
            {errors.owner_mobile && (
              <Typography variant="small" color="red" className="mt-1">
                {errors.owner_mobile}
              </Typography>
            )}
          </div>
          <div>
            <Input
              type="text"
              label="Location"
              name="owner_address"
              value={formData.owner_address}
              onChange={handleInputChange}
              error={errors.owner_address}
            />
            {errors.owner_address && (
              <Typography variant="small" color="red" className="mt-1">
                {errors.owner_address}
              </Typography>
            )}
          </div>
        </div>
      </div>
      <Button loading={loading} className="w-max self-end" onClick={handleOwnerSubmit}>
        Save Changes
      </Button>
    </Card>
  );
};
const OpeningTimes = ({data, fetchRestaurantData}) => {
  const [formData, setFormData] = useState({
    opening_times: null,
    id: data.id,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data) {
      setFormData({
        ...formData,
        opening_times: data.opening_times,
      });
    }
  }, [data]);

  const handleInputChange = (index, field, value) => {
    const updatedTimes = [...formData.opening_times];
    updatedTimes[index] = {
      ...updatedTimes[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      opening_times: updatedTimes,
    });
  };

  const handleTimeSubmit = async () => {
    setLoading(true);
    try {
      const {data, error} = await supabase
        .from("restaurants")
        .update({opening_times: formData.opening_times})
        .eq("id", formData.id)
        .select();

      if (error) {
        console.error("Error updating times:", error);
      } else {
        fetchRestaurantData();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateObj) => {
    if (!dateObj) return "";
    const hours = String(new Date(dateObj).getHours()).padStart(2, "0");
    const minutes = String(new Date(dateObj).getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleTimeChange = (index, field, value) => {
    const date = new Date(formData.opening_times[index][field]);
    const [hours, minutes] = value.split(":");
    date.setHours(hours, minutes);
    handleInputChange(index, field, date.toISOString());
  };

  const handleSwitchChange = (index, value) => {
    handleInputChange(index, "is_open", value);
  };

  return (
    <Card shadow={false} className="w-full p-5 border">
      <div className="w-full flex flex-col gap-5">
        <div className="w-full justify-between items-center flex mb-3">
          <Typography variant="h3" className="text-lg font-bold">
            Opening Times
          </Typography>
          <Button
            className="self-end"
            onClick={handleTimeSubmit}
            disabled={loading}
            loading={loading}>
            Save Changes
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-6">
          <Typography
            variant="small"
            className="font-medium uppercase text-blue-gray-400">
            Days
          </Typography>
          <Typography
            variant="small"
            className="font-medium uppercase text-blue-gray-400">
            Opening Time
          </Typography>
          <Typography
            variant="small"
            className="font-medium uppercase text-blue-gray-400">
            Closing Time
          </Typography>
          <Typography
            variant="small"
            className="font-medium uppercase text-blue-gray-400 text-center">
            Status
          </Typography>
        </div>
        {formData?.opening_times &&
          formData?.opening_times.map((day, index) => (
            <div key={index} className="grid grid-cols-4 gap-6">
              <Chip
                variant="ghost"
                value={day.day}
                size="lg"
                className="py-2 w-full justify-center"
              />

              <div className="relative inline-block">
                <input
                  type="time"
                  className="w-full px-4 py-2 border rounded-md"
                  value={formatTime(day.opening_time)}
                  onChange={(e) =>
                    handleTimeChange(index, "opening_time", e.target.value)
                  }
                />
              </div>

              <div className="relative inline-block">
                <input
                  type="time"
                  className="w-full px-4 py-2 border rounded-md"
                  value={formatTime(day.closing_time)}
                  onChange={(e) =>
                    handleTimeChange(index, "closing_time", e.target.value)
                  }
                />
              </div>
              <div className="flex items-center justify-center">
                <Switch
                  checked={day.is_open}
                  onChange={(e) => handleSwitchChange(index, e.target.checked)}
                  label={`Restaurant ${day?.is_open ? "open" : "closed"}`}
                />
              </div>
            </div>
          ))}
      </div>
    </Card>
  );
};
