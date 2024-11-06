import React, { useState } from 'react';
import { IoClose } from "react-icons/io5";
import { Link, useNavigate } from 'react-router-dom';
import uploadFile from '../helpers/uploadFile';
import axios from 'axios';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    profile_pic: ""
  });
  const [uploadPhoto, setUploadPhoto] = useState("");
  const navigate = useNavigate();

  const handleOnChange = (e) => {
    const { name, value } = e.target;

    setData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];
    const uploadPhoto = await uploadFile(file);
    setUploadPhoto(file);
    setData((prev) => ({
      ...prev,
      profile_pic: uploadPhoto?.url
    }));
  };

  const handleClearUploadPhoto = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setUploadPhoto(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const URL = `${process.env.REACT_APP_BACKEND_URL}/api/register`;

    try {
      const response = await axios.post(URL, data);
      toast.success(response.data.message);

      if (response.data.success) {
        setData({
          name: "",
          email: "",
          password: "",
          profile_pic: ""
        });
        navigate('/email');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  return (
    <div className='mt-10 flex justify-center items-center min-h-screen bg-gray-100'>
      <div className='bg-white w-full max-w-lg shadow-md rounded-lg p-6'>
        <h3 className="text-2xl font-semibold text-center text-gray-800 mb-6">Welcome to Chat App!</h3>
        
        <form className='grid gap-4' onSubmit={handleSubmit}>
          <div className='flex flex-col gap-2'>
            <label htmlFor='name' className='text-gray-600 font-medium'>Name :</label>
            <input
              type='text'
              id='name'
              name='name'
              placeholder='Enter your name'
              className='bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-primary'
              value={data.name}
              onChange={handleOnChange}
              required
            />
          </div>

          <div className='flex flex-col gap-2'>
            <label htmlFor='email' className='text-gray-600 font-medium'>Email :</label>
            <input
              type='email'
              id='email'
              name='email'
              placeholder='Enter your email'
              className='bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-primary'
              value={data.email}
              onChange={handleOnChange}
              required
            />
          </div>

          <div className='flex flex-col gap-2'>
            <label htmlFor='password' className='text-gray-600 font-medium'>Password :</label>
            <input
              type='password'
              id='password'
              name='password'
              placeholder='Enter your password'
              className='bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-primary'
              value={data.password}
              onChange={handleOnChange}
              required
            />
          </div>

          <div className='flex flex-col gap-2'>
            <label htmlFor='profile_pic' className='text-gray-600 font-medium'>Photo :</label>
            <div className='h-14 bg-gray-100 border border-gray-300 flex justify-between items-center px-4 rounded-lg cursor-pointer'>
              <p className='text-sm truncate'>{uploadPhoto?.name || "Upload profile photo"}</p>
              {uploadPhoto?.name && (
                <button className='text-lg text-gray-500 hover:text-red-600' onClick={handleClearUploadPhoto}>
                  <IoClose />
                </button>
              )}
            </div>
            <input
              type='file'
              id='profile_pic'
              name='profile_pic'
              className='hidden'
              onChange={handleUploadPhoto}
            />
          </div>

          <button
            className='bg-blue-500 text-lg px-4 py-2 rounded-lg mt-4 font-bold text-white transition duration-200 hover:bg-blue-600'
          >
            Register
          </button>
        </form>

        <p className='mt-6 text-center text-gray-600'>Already have an account? 
          <Link to={"/email"} className='text-blue-500 font-semibold ml-1 hover:underline'>Login</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
