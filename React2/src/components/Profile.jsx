import { useState, useEffect } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import Avatar from './Avatar'

const Profile = () => {
    
    // Creates a state variable to hold the user data. It starts as null because we haven't fetched the data yet.
    const [userData, setUserData] = useState(null) 

    // useEffect with an empty array [] runs exactly once when the component first loads.
    useEffect(() => {
        const getUserProfile = async () => {
            // Retrieves the saved JWT token from the browser's cookies to prove who is logged in.
            const token = Cookies.get('token')

            try {
                // Makes a secure GET request to the backend, passing the token in the headers for authentication.
                const result = await axios.get('https://moment-1-h67x.onrender.com/api/v1/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                })
                
                // Saves the user data returned from the backend into our userData state variable.
                setUserData(result.data.data)
            } catch (error) {
                console.error("Failed to get profile", error)
            }
        }
    
        // Calls the function we just defined to actually perform the fetch.
        getUserProfile()

    }, [])


    // Clears the token and forces the user back to the login page
    const handleSignOut = () => {
        Cookies.remove('token')
        window.location.href = '/login'
    }

  return (
    <div className="absolute top-10 right-0 mt-2 w-64 bg-stone-900 border border-white/10 shadow-2xl rounded-2xl p-5 flex flex-col z-50">
        {userData ? (
            <>
                <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-2">
                    <Avatar 
                        seed={userData.email} 
                        avatarStyle={userData.avatarStyle} 
                        options={userData.avatarOptions} 
                    />
                    <div className="flex flex-col overflow-hidden">
                        <span className="font-headline font-bold text-orange-50 text-xl truncate">{userData.fullName}</span>
                        <span className="text-sm text-orange-100/60 font-light truncate">@{userData.userName}</span>
                        <span className="text-xs text-orange-100/40 mt-1 truncate">{userData.email}</span>
                    </div>
                </div>
                <button onClick={handleSignOut} className="text-left text-sm font-label uppercase tracking-widest text-red-400 hover:text-red-300 hover:bg-white/5 px-3 py-3 rounded-lg transition-colors mt-2">
                    Sign Out
                </button>
            </>
        ) : (
            <div className="text-center text-sm text-orange-100/50 py-4 animate-pulse">Loading...</div>
        )}
    </div>
  )
}

export default Profile