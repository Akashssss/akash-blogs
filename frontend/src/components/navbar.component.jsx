import { useContext, useState, useEffect } from 'react';
import darkLogo from '../imgs/logo-dark.png';
import lightLogo from '../imgs/logo-light.png';
import { Link, Outlet } from 'react-router-dom';
import { ThemeContext, UserContext } from '../App';
import UserNavigationPanel from './user-navigation.component';
import CommandPalette from './command-palette.component';
import axios from 'axios';
import { Search, Moon, Sun, Bell, PenSquare } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

export default function Navbar() {
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const { userAuth, setUserAuth, userAuth: { access_token, new_notification_available } } = useContext(UserContext);
    const { theme, setTheme } = useContext(ThemeContext);

    // Global keyboard shortcut for Command Palette (Cmd+K / Ctrl+K)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setIsCommandPaletteOpen((prev) => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const changeTheme = () => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    useEffect(() => {
        if (access_token) {
            axios.get(`${import.meta.env.VITE_SERVER_DOMAIN}/new-notification`, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            }).then(({ data }) => {
                setUserAuth((prev) => ({ ...prev, ...data }));
            }).catch((error) => {
                console.error('Notification check failed:', error);
            });
        }
    }, [access_token]);

    return (
        <TooltipProvider delayDuration={200}>
            <CommandPalette
                isOpen={isCommandPaletteOpen}
                onClose={() => setIsCommandPaletteOpen(false)}
            />

            <nav className='navbar z-40 sticky top-0 border-b border-border bg-background/95 backdrop-blur-md'>
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-full">
                    {/* Left Section: Brand Logo & Search */}
                    <div className="flex items-center gap-3 sm:gap-5">
                        <Link to='/' className='flex-shrink-0 flex items-center justify-center hover:opacity-90 transition-opacity'>
                            <img
                                src={theme === 'light' ? darkLogo : lightLogo}
                                alt='logo'
                                className='w-9 h-9 sm:w-10 sm:h-10 object-contain'
                            />
                        </Link>

                        {/* Instant Search Bar Triggering Command Palette */}
                        <div
                            onClick={() => setIsCommandPaletteOpen(true)}
                            className="hidden sm:flex items-center gap-3 bg-muted/60 hover:bg-muted hover:border-purple/30 border border-border px-4 py-2 rounded-full cursor-pointer w-64 md:w-80 transition-all duration-150"
                        >
                            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm text-muted-foreground flex-grow select-none">Search or type command...</span>
                            <span className="text-xs bg-background text-muted-foreground px-2 py-0.5 rounded-md font-mono border border-border shadow-2xs">⌘K</span>
                        </div>

                        {/* Mobile Search Button */}
                        <button
                            onClick={() => setIsCommandPaletteOpen(true)}
                            className="sm:hidden w-9 h-9 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Open command palette"
                        >
                            <Search className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Right Section: Actions */}
                    <div className='flex items-center gap-2 sm:gap-4 flex-shrink-0'>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link to='/editor' className='flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground px-2.5 sm:px-3.5 py-2 rounded-xl hover:bg-muted transition-colors duration-150' aria-label="Write new story">
                                    <PenSquare className='w-4 h-4 text-purple shrink-0' />
                                    <span className='hidden sm:inline'>Write</span>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent>Create new story</TooltipContent>
                        </Tooltip>

                        {/* Dark/Light Theme Switcher */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={changeTheme}
                                    aria-label="Toggle theme"
                                    className='w-9 h-9 rounded-full bg-muted/60 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-150'
                                >
                                    {theme === 'light' ? (
                                        <Moon className='w-4 h-4 text-purple' />
                                    ) : (
                                        <Sun className='w-4 h-4 text-amber-400' />
                                    )}
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>{theme === 'light' ? 'Switch to Dark mode' : 'Switch to Light mode'}</TooltipContent>
                        </Tooltip>

                        {access_token ? (
                            <>
                                {/* Notification Bell */}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link to='/dashboard/notifications' className="relative">
                                            <button className='w-9 h-9 rounded-full bg-muted/60 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-150' aria-label="Notifications">
                                                <Bell className='w-4 h-4' />
                                                {new_notification_available && (
                                                    <span className='absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full ring-2 ring-background animate-pulse' />
                                                )}
                                            </button>
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent>Notifications</TooltipContent>
                                </Tooltip>

                                {/* User Avatar Dropdown */}
                                <UserNavigationPanel />
                            </>
                        ) : (
                            <div className="flex items-center gap-2.5">
                                <Button asChild size="sm" className="rounded-full px-5 font-semibold text-xs bg-foreground text-background hover:opacity-90">
                                    <Link to='/signin'>Sign In</Link>
                                </Button>
                                <Button asChild variant="outline" size="sm" className="rounded-full px-5 font-semibold text-xs border-border hidden md:inline-flex">
                                    <Link to='/signup'>Sign Up</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
            <Outlet />
        </TooltipProvider>
    );
}
