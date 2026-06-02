import React from 'react'

const NavBarMobile = () => {
    return (
        <div>
            <div class="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-6 pb-6 pt-3 bg-[#142449]/40 backdrop-blur-2xl rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
                <div class="flex flex-col items-center justify-center text-[#dee5ff]/40">
                    <span class="material-symbols-outlined">edit_note</span>
                    <span class="font-['Manrope'] text-[10px] font-medium">Home</span>
                </div>
                <div class="flex flex-col items-center justify-center text-[#dee5ff]/40">
                    <span class="material-symbols-outlined">auto_awesome</span>
                    <span class="font-['Manrope'] text-[10px] font-medium">Create</span>
                </div>
                <div class="flex flex-col items-center justify-center text-[#dee5ff]/40">
                    <span class="material-symbols-outlined">dynamic_feed</span>
                    <span class="font-['Manrope'] text-[10px] font-medium">Explore</span>
                </div>
                <div class="flex flex-col items-center justify-center bg-[#9392ff]/20 text-[#38debb] rounded-full px-5 py-2">
                    <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">auto_stories</span>
                    <span class="font-['Manrope'] text-[10px] font-medium">My Moments</span>
                </div>
            </div>
        </div>
    )
}

export default NavBarMobile