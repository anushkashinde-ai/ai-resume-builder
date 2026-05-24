import React from 'react';
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import {useSelector} from 'react-redux';
import Loader from '../components/Loader';
import Login from './Login';
import ErrorBoundary from '../components/ErrorBoundary';

const Layout = () => {

  const {user, loading} = useSelector(state => state.auth)

  if(loading){
    return <Loader />
  }
  return (
    <div>
      { user ? (
        <div className='min-h-screen bg-gray-50'>
          <Navbar />
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      ) : <Login /> }
      
    </div>
  )
}

export default Layout
