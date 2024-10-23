import supabase from "@/configs/supabase";
import {WEB_CONFIG} from "@/configs/website-config";
import {
  ArrowLongRightIcon,
  EnvelopeIcon,
  LockClosedIcon,
} from "@heroicons/react/24/solid";
import {Input, Button, Typography} from "@material-tailwind/react";
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {toast} from "react-toastify";

export function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({email: "", password: ""});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    let valid = true;
    let errors = {};

    if (!email) {
      errors.email = "Email is required";
      valid = false;
    }

    if (!password) {
      errors.password = "Password is required";
      valid = false;
    }

    setErrors(errors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    const baseUrl = WEB_CONFIG.isProduction
      ? WEB_CONFIG?.productionBaseUrl
      : WEB_CONFIG?.developementBaseUrl;

    try {
      const response = await fetch(`${baseUrl}/api/sign-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          toast.error(result.error);
        } else if (response.status === 403) {
          toast.warning(
            <div className="w-full flex flex-col select-none cursor-move">
              <Typography variant="paragraph" className="font-medium" color="blue-gray">
                Your account is currently under verification.
              </Typography>
              <Typography
                variant="small"
                className="font-normal opacity-70"
                color="blue-gray">
                The verification process may take up to 5 to 10 days. You will be notified
                once it's complete. Thank you for your patience.
              </Typography>
            </div>,
          );
        } else {
          toast.error("Something went wrong!");
        }
        return;
      }

      localStorage.setItem(
        "accessToken",
        JSON.stringify(result.data.session.access_token),
      );

      await fetchRestaurantData(result.data.user.id);
    } catch (error) {
      toast.error("An error occurred while processing your request.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRestaurantData = async (adminId) => {
    const {data, error} = await supabase
      .from("restaurants")
      .select("*")
      .eq("admin_id", adminId)
      .single();

    if (!data) {
      throw error;
    } else {
      localStorage.setItem("restaurants_id", data.id);
      localStorage.setItem("cloudName", data.cloud_name);
      localStorage.setItem("uploadPreset", data.upload_preset);
      localStorage.setItem("restaurantName", data.unique_name);

      navigate("/dashboard/home");
    }
  };

  return (
    <section className=" flex flex-col lg:flex-row h-screen overflow-hidden xl:gap-20 gap-10 p-8  justify-center items-center">
      <div className="hidden lg:flex lg:w-1/2 h-full justify-center items-center relative rounded-3xl">
        <img
          src="/login.jpg"
          className="h-full w-full object-cover rounded-3xl object-top"
        />
        <div className="w-full h-full bg-gradient-to-t from-green-500/100 via-green-500/50 to-green-500/5 absolute top-0 rounded-3xl" />

        <div className="w-full absolute bottom-0 px-5 py-10 justify-center flex flex-col items-center z-30 gap-3">
          <Typography
            variant="h6"
            className="font-normal uppercase text-center"
            color="white">
            One Platform for all restaurant statistics
          </Typography>
          <Typography variant="h2" className="font-medium text-center" color="white">
            Food Menu, Manage Orders, Analytics
          </Typography>
          <Typography variant="h5" className="font-normal text-center" color="white">
            <span className="text-green-50 font-bold">Qrcuisine </span>
            Most Efficient Restaurant Management Tools
          </Typography>
        </div>
      </div>
      <div className="w-full lg:w-1/2 h-full  flex flex-col justify-center gap-8  pr-0">
        <img
          src="/login.jpg"
          className="h-32 w-full object-cover rounded-3xl mb-5 lg:hidden flex"
        />
        <img src={WEB_CONFIG?.logo} alt="logo" title="logo" className="w-48" />
        <div className="flex flex-col gap-2">
          <Typography variant="h1" className="font-medium" color="blue-gray">
            Dashboard Log In
          </Typography>
          <Typography variant="h6" className="font-normal opacity-75" color="blue-gray">
            Enter your email address and password for log in.
          </Typography>
        </div>
        <form className="w-full" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            <Input
              type="email"
              size="lg"
              label="Email Address"
              placeholder="example@gmail.com"
              icon={<EnvelopeIcon />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <Typography variant="small" color="red" className="-mt-4">
                {errors.email}
              </Typography>
            )}
            <Input
              type="password"
              size="lg"
              label="Password"
              placeholder="example123"
              icon={<LockClosedIcon />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && (
              <Typography variant="small" color="red" className="-mt-4">
                {errors.password}
              </Typography>
            )}
          </div>
          <Button
            loading={isLoading}
            color="green"
            type="submit"
            className="mt-8 flex items-center justify-center gap-3"
            fullWidth
            size="lg">
            Log In
            <ArrowLongRightIcon className="h-6 w-6" />
          </Button>
        </form>
      </div>
    </section>
  );
}

export default SignIn;
