// import React from 'react'

const Avatar = ({ seed, avatarStyle = 'lorelei', options = {}, className = "w-14 h-14 rounded-full bg-white/5 border border-white/10 shrink-0" }) => {
    // Fix the 'lorlei' typo dynamically and construct the URL
    const safeStyle = avatarStyle === 'lorlei' ? 'lorelei' : avatarStyle;
    const queryParams = new URLSearchParams(options).toString();
    const avatarUrl = `https://api.dicebear.com/9.x/${safeStyle}/svg?seed=${seed}&${queryParams}`;

  return (
    <img src={avatarUrl} alt="Avatar" className={className} />
  )
}

export default Avatar