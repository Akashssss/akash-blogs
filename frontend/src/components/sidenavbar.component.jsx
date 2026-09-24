import React, { useContext, useEffect, useRef, useState } from 'react';
import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import { UserContext } from '../App';
import {
    LayoutDashboard,
    FileText,
    Bell,
    PenSquare,
    User,
    Lock,
    Menu
} from 'lucide-react';

export default function SideNav() {
    const location = useLocation();
    const currentSubpath = location.pathname.split('/')[2] || 'analytics';
    const [pageState, setPageState] = useState(currentSubpath);

    const activeTabLine = useRef();
    const sideBarIconTab = useRef();
    const pageStateTab = useRef();
    const [showSideNav, setShowSideNav] = useState(false);

    const changePageState = (e) => {
        const { offsetWidth, offsetLeft } = e.target;
        if (activeTabLine.current) {
            activeTabLine.current.style.width = `${offsetWidth}px`;
            activeTabLine.current.style.left = `${offsetLeft}px`;
        }
        if (e.target === sideBarIconTab.current) {
            setShowSideNav(true);
        } else {
            setShowSideNav(false);
        }
    };

    const { userAuth: { access_token, new_notification_available } } = useContext(UserContext);

    useEffect(() => {
        setShowSideNav(false);
        pageStateTab.current?.click();
    }, [pageState]);

    return access_token == null ? (
        <Navigate to='/signin' />
    ) : (
        <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8'>
            <div className='flex gap-8 xl:gap-12 min-h-[calc(100vh-140px)] max-md:flex-col'>
                {/* Sidebar Navigation */}
                <div className='sticky top-[72px] z-30 md:w-60 shrink-0'>
                    {/* Mobile Tab Header */}
                    <div className='md:hidden bg-background py-2 border-b border-border flex flex-nowrap overflow-x-auto'>
                        <button onClick={changePageState} ref={sideBarIconTab} className='p-3 capitalize flex items-center text-muted-foreground'>
                            <Menu className='w-5 h-5 pointer-events-none' />
                        </button>
                        <button onClick={changePageState} ref={pageStateTab} className='p-3 capitalize text-sm font-semibold text-foreground'>
                            {pageState}
                        </button>
                        <hr ref={activeTabLine} className='absolute bottom-0 duration-300 border-purple' />
                    </div>

                    {/* Sidebar Navigation Panel */}
                    <aside
                        className={`w-full md:w-60 md:sticky top-24 overflow-y-auto p-4 md:p-0 md:pr-4 md:border-border/60 md:border-r absolute max-md:top-[60px] bg-background max-md:left-0 max-md:right-0 max-md:px-6 duration-200 ${
                            !showSideNav ? "max-md:opacity-0 max-md:pointer-events-none" : "opacity-100 pointer-events-auto"
                        }`}
                    >
                        <h2 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-3'>
                            Studio
                        </h2>

                        <div className='space-y-1'>
                            <NavLink
                                to='/dashboard/analytics'
                                className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
                                onClick={() => setPageState('Analytics')}
                            >
                                <LayoutDashboard className='w-4 h-4' />
                                <span>Analytics</span>
                            </NavLink>

                            <NavLink
                                to='/dashboard/blogs'
                                className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
                                onClick={() => setPageState('Blogs')}
                            >
                                <FileText className='w-4 h-4' />
                                <span>Stories</span>
                            </NavLink>

                            <NavLink
                                to='/dashboard/notifications'
                                className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
                                onClick={() => setPageState('Notifications')}
                            >
                                <div className='relative flex items-center'>
                                    <Bell className='w-4 h-4' />
                                    {new_notification_available && (
                                        <span className='bg-red w-2 h-2 rounded-full absolute -top-1 -right-1 ring-2 ring-background' />
                                    )}
                                </div>
                                <span>Notifications</span>
                            </NavLink>

                            <NavLink
                                to='/editor'
                                className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
                                onClick={() => setPageState('Write')}
                            >
                                <PenSquare className='w-4 h-4 text-purple' />
                                <span className='text-purple font-medium'>Write Story</span>
                            </NavLink>
                        </div>

                        <h2 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-8 mb-3 px-3'>
                            Settings
                        </h2>

                        <div className='space-y-1'>
                            <NavLink
                                to='/settings/edit-profile'
                                className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
                                onClick={() => setPageState('Edit profile')}
                            >
                                <User className='w-4 h-4' />
                                <span>Edit Profile</span>
                            </NavLink>

                            <NavLink
                                to='/settings/change-password'
                                className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
                                onClick={() => setPageState('Change password')}
                            >
                                <Lock className='w-4 h-4' />
                                <span>Change Password</span>
                            </NavLink>
                        </div>
                    </aside>
                </div>

                {/* Main Content Area */}
                <main className='flex-1 min-w-0'>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
