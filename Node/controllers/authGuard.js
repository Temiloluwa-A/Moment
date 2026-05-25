import React from 'react'
import { Navigate, Outlet} from 'react-router-dom'


const authGuard = ({isAuth, redirectTo ='/login', children}) => {
    if (!isAuth) {
        return <Navigate to={redirectTo} replace={true} />
    }
    else {        
        return (children? children:<Outlet/>)
    }
  return (
    <div>Continue to page</div>
  )
}

export default authGuard