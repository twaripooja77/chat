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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white w-full max-w-md shadow-lg rounded-lg p-6 mx-auto">
        <div className="w-fit mx-auto mb-4">
          <PiUserCircle size={80} className="text-blue-500" />
        </div>

        <h3 className="text-2xl font-semibold text-center text-gray-800 mb-4">Welcome ! </h3>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-gray-600 font-medium">Enter your Email :</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              value={data.email}
              onChange={handleOnChange}
              required
            />
          </div>

          <button
            className="bg-blue-500 text-lg px-4 py-2 mt-4 rounded-lg font-bold text-white transition duration-200 hover:bg-blue-600"
          >
            Let's Go
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          New User? <Link to="/register" className="text-blue-500 font-semibold hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default CheckEmailPage;
