import supabase from "@/configs/supabase";
import {Input, Checkbox, Button, Typography} from "@material-tailwind/react";
import {useState} from "react";
import {useNavigate} from "react-router-dom";

export function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({email: "", password: ""});

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

    const {data, error} = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (!data) {
      throw error;
    } else {
      const accessToken = data.session.access_token;
      localStorage.setItem("accessToken", accessToken);
      await fetchRestaurantData(data.user.id);
    }
  };

  const fetchRestaurantData = async (adminId) => {
    const {data, error} = await supabase
      .from("restaurants")
      .select("id, upload_preset, cloud_name, unique_name")
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
    <section className="flex flex-col lg:flex-row h-screen overflow-hidden gap-4 p-8">
      <div className="w-full lg:w-3/5 flex h-full flex-col justify-center">
        <div className="text-center">
          <Typography variant="h2" className="font-bold mb-4">
            Sign In
          </Typography>
          <Typography
            variant="paragraph"
            color="blue-gray"
            className="text-lg font-normal">
            Enter your email and password to Sign In.
          </Typography>
        </div>
        <form
          className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2"
          onSubmit={handleSubmit}>
          <div className="mb-1 flex flex-col gap-5">
            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              Your email
            </Typography>
            <Input
              size="lg"
              placeholder="example@mail.com"
              className="!border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <Typography variant="small" color="red" className="-mt-4">
                {errors.email}
              </Typography>
            )}
            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              Password
            </Typography>
            <Input
              type="password"
              size="lg"
              placeholder="********"
              className="!border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && (
              <Typography variant="small" color="red" className="-mt-4">
                {errors.password}
              </Typography>
            )}
          </div>
          <Checkbox
            label={
              <Typography
                variant="small"
                color="gray"
                className="flex items-center justify-start font-medium">
                I agree to the&nbsp;
                <a
                  href="#"
                  className="font-normal text-black transition-colors hover:text-gray-900 underline">
                  Terms and Conditions
                </a>
              </Typography>
            }
            containerProps={{className: "-ml-2.5"}}
          />
          <Button type="submit" className="mt-6" fullWidth>
            Sign In
          </Button>
        </form>
      </div>
      <div className="hidden lg:flex lg:w-2/5 h-full justify-center items-center">
        <img src="/img/pattern.png" className="h-full w-full object-cover rounded-3xl" />
      </div>
    </section>
  );
}

export default SignIn;
