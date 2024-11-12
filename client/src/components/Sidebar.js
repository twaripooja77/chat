import React, { useEffect, useState } from 'react'
import { IoChatbubbleEllipses } from "react-icons/io5";
import { FaUserPlus } from "react-icons/fa";
import { NavLink, useNavigate } from 'react-router-dom';
import { BiLogOut } from "react-icons/bi";
import Avatar from './Avatar'
import { useDispatch, useSelector } from 'react-redux';
import EditUserDetails from './EditUserDetails';
import Divider from './Divider';
import { FiArrowUpLeft } from "react-icons/fi";
import SearchUser from './SearchUser';
import { FaImage } from "react-icons/fa6";
import { FaVideo } from "react-icons/fa6";
import { logout } from '../redux/userSlice';

const Sidebar = () => {
    const user = useSelector(state => state?.user)
    const [editUserOpen, setEditUserOpen] = useState(false)
    const [allUser, setAllUser] = useState([])
    const [openSearchUser, setOpenSearchUser] = useState(false)
    const socketConnection = useSelector(state => state?.user?.socketConnection)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    useEffect(() => {
        if (socketConnection) {
            socketConnection.emit('sidebar', user._id)

            socketConnection.on('conversation', (data) => {
                const conversationUserData = data.map((conversationUser, index) => {
                    if (conversationUser?.sender?._id === conversationUser?.receiver?._id) {
                        return {
                            ...conversationUser,
                            userDetails: conversationUser?.sender
                        }
                    }
                    else if (conversationUser?.receiver?._id !== user?._id) {
                        return {
                            ...conversationUser,
                            userDetails: conversationUser.receiver
                        }
                    } else {
                        return {
                            ...conversationUser,
                            userDetails: conversationUser.sender
                        }
                    }
                })

                setAllUser(conversationUserData)
            })
        }
    }, [socketConnection, user])

    const handleLogout = () => {
        dispatch(logout())
        navigate("/email")
        localStorage.clear()
    }

    return (
        <div className='w-full h-full grid grid-cols-[60px,1fr] bg-white border-r border-gray-200'>
            {/* Sidebar */}
            <div className='bg-[#ffffff] w-16 h-full py-6 text-slate-600 flex flex-col justify-between border-r border-gray-200'>
                <div className="flex flex-col items-center gap-4">

                <button className='mx-auto' title={user?.name} onClick={() => setEditUserOpen(true)}>
                        <Avatar
                            width={40}
                            height={40}
                            name={user?.name}
                            imageUrl={user?.profile_pic}
                            userId={user?._id}
                        />
                    </button>

                </div>

                {/* Avatar and Logout */}
                <div className='flex flex-col items-center'>

               
                    <div
                        title='add friend'
                        onClick={() => setOpenSearchUser(true)}
                        className='w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-slate-200 rounded'>
                        <FaUserPlus size={20} />
                    </div>
                    <NavLink
                        className='w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-slate-200 rounded'
                        title='chat'
                    >
                        <IoChatbubbleEllipses size={20} />
                    </NavLink>



                    <button
                        title='logout'
                        className='w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-slate-200 rounded'
                        onClick={handleLogout}>
                        <BiLogOut size={20} />
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div className='w-full'>
                <div className='h-16 flex items-center'>
                    <h2 className='text-xl font-bold p-4 text-slate-800'>Message</h2>
                </div>
                <div className='bg-slate-200 p-[0.5px]'></div>

                <div className='h-[calc(100vh-65px)] overflow-x-hidden overflow-y-auto scrollbar'>
                    {
                        allUser.length === 0 && (
                            <div className='mt-12'>
                                <div className='flex justify-center items-center my-4 text-slate-500'>
                                    <FiArrowUpLeft size={50} />
                                </div>
                                <p className='text-lg text-center text-slate-400'>Explore users to start a conversation with.</p>
                            </div>
                        )
                    }

                    {
                        allUser.map((conv, index) => (
                            <NavLink
                                to={"/" + conv?.userDetails?._id}
                                key={conv?._id}
                                className='flex items-center gap-2 py-3 px-4 border-b border-gray-200 hover:border-primary rounded hover:bg-slate-100 cursor-pointer'>
                                <Avatar
                                    imageUrl={conv?.userDetails.profile_pic}
                                    name={conv?.userDetails?.name}
                                    width={40}
                                    height={40}
                                />
                                <div>
                                    <h3 className='text-ellipsis line-clamp-1 font-semibold text-base'>{conv?.userDetails?.name}</h3>
                                    <div className='text-slate-500 text-xs flex items-center gap-1'>
                                        {
                                            conv?.lastMsg?.imageUrl && (
                                                <div className='flex items-center gap-1'>
                                                    <span><FaImage /></span>
                                                    {!conv?.lastMsg?.text && <span>Image</span>}
                                                </div>
                                            )
                                        }
                                        {
                                            conv?.lastMsg?.videoUrl && (
                                                <div className='flex items-center gap-1'>
                                                    <span><FaVideo /></span>
                                                    {!conv?.lastMsg?.text && <span>Video</span>}
                                                </div>
                                            )
                                        }
                                        <p className='text-ellipsis line-clamp-1'>{conv?.lastMsg?.text}</p>
                                    </div>
                                </div>
                                {
                                    Boolean(conv?.unseenMsg) && (
                                        <p className='text-xs w-6 h-6 flex justify-center items-center ml-auto p-1 bg-primary text-white font-semibold rounded-full'>{conv?.unseenMsg}</p>
                                    )
                                }
                            </NavLink>
                        ))
                    }
                </div>
            </div>

            {/* Edit user details */}
            {editUserOpen && (
                <EditUserDetails onClose={() => setEditUserOpen(false)} user={user} />
            )}

            {/* Search user */}
            {openSearchUser && (
                <SearchUser onClose={() => setOpenSearchUser(false)} />
            )}

        </div>
    )
}




export default Sidebar
