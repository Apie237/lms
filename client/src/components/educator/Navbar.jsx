import React from 'react';
import { Link } from 'react-router-dom';
import { useClerk, UserButton, useUser } from '@clerk/clerk-react';
import {assets,  dummyEducatorData } from '../../assets/assets';


const Navbar = () => {
  const educatorData = dummyEducatorData[0];
  const { user } = useUser()
  return (
    <div className='flex items-center justify-between px-4 md:px-8 border-b border-gray-500 py-3'>
      <Link to='/' className='text-2xl font-bold text-gray-800'>
      <img src={assets.logo} alt="Logo" className='w-28 lg-w-32' />
      </Link>
      <div className='flex items-center gap-5 text-gray-500 relative'>
        <p>Hi {user? user.fullName : 'Developers'}</p>
        {user ? <UserButton/> : <img src={assets.profile_img} alt="Profile" className='max-w-8' />}
      </div>
    </div>
  );
}

export default Navbar;
