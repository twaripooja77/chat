import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PiUserCircle } from "react-icons/pi";
import axios from 'axios';
import toast from 'react-hot-toast';

const CheckEmailPage = () => {
  const [data, setData] = useState({
    email: "",
  });
  const navigate = useNavigate();

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const URL = `${process.env.REACT_APP_BACKEND_URL}/api/email`;

    try {
      const response = await axios.post(URL, data);
      toast.success(response.data.message);

      if (response.data.success) {
        setData({ email: "" });
        navigate('/password', {
          state: response?.data?.data
        });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-8 ">
      <div className="bg-white w-full max-w-lg shadow-lg rounded-lg p-8 mx-auto">
        <div className="w-fit mx-auto mb-6 ">
        <PiUserCircle size={100} style={{ color: "#a060ff" }} />
        </div>

        <h3 className="text-3xl font-semibold text-center text-gray-800 mb-6">Welcome!</h3>

        <form className="grid gap-6" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-gray-700 font-medium">Enter your Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
              value={data.email}
              onChange={handleOnChange}
              required
            />
          </div>

          <button
            className="bg-[#a060ff] text-xl px-5 py-3 mt-6 rounded-lg font-bold text-white transition duration-200 hover:bg-blue-600"
          >
            Let's Go
          </button>
        </form>

        <p className="mt-8 text-center text-gray-600">
          New to Chat App? <Link to="/register" className="font-semibold hover:underline" style={{ color: "#a060ff" }}>Register Here</Link>
        </p>
      </div>
    </div>
  );
};

export default CheckEmailPage;
