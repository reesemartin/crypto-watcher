import React, { useEffect, useState } from "react";

type SideNavItem = {
  link: string
  children: React.ReactNode
}

function SideNavItem({link, children}:SideNavItem) {
  return (
    <li><a href={link} className="block py-2 px-6 whitespace-nowrap border-gray-500 border-b hover:text-orange hover:bg-gray-700 transition-all">{children}</a></li>
  );
}

type SideNavLinks = {
  link: string
  label: string
}

function SideNav() {
  const [showNav, setShowNav] = useState<boolean>(false)
  const [sideNavLinks, setSideNavLinks] = useState<SideNavLinks[]>([
    // {
    //   link: '#',
    //   label: "Item 1",
    // },
  ])

  const closeSideNav = (e: KeyboardEvent) => {

    let keycode = e.key
    if (keycode === 'Escape') {
      setShowNav(false)
    }
  }

  useEffect(() => {
    document.body.addEventListener('keydown', closeSideNav)

    // cleanup this component
    return () => {
      document.body.removeEventListener('keydown', closeSideNav)
    };
  }, [])

  return (
    <div>
      { sideNavLinks.length > 0 && <div className="group mr-6" onClick={()=>{setShowNav(!showNav)}}>
        <svg className="group-hover:text-orange cursor-pointer h-8 w-8 float-right" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M0 0h24v24H0z" fill="none"/><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
      </div> }
      <div className={`h-full w-full md:w-96 fixed z-50 top-0 right-0 bg-gray-800 transition-all duration-500 ${showNav ? "" : "-right-full"}`}>
        <div className='text-right md:pt-2 md:pr-2'>
          <div className="inline-block text-gray-400 group text-2xl cursor-pointer p-2" tabIndex={-1} onClick={() => setShowNav(false)}>
            <svg className="group-hover:text-orange h-14 w-14 md:h-8 md:w-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </div>
        </div>
        <div className='mx-4 text-gray-300 text-left'>
          <ul>
            {sideNavLinks.map((x, i) => {
              return <SideNavItem key={i} link={x.link}>{x.label}</SideNavItem>
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default SideNav;
