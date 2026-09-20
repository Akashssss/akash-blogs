import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import { removeFromSession } from '../common/session';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
    User,
    LayoutDashboard,
    FileText,
    Bell,
    PenSquare,
    Settings,
    KeyRound,
    LogOut
} from 'lucide-react';

export default function UserNavigationPanel() {
    const { userAuth, setUserAuth } = useContext(UserContext);
    const { username, fullname, profile_img } = userAuth || {};
    const navigate = useNavigate();

    const signOutUser = () => {
        removeFromSession("user");
        setUserAuth({ access_token: null });
        navigate('/signin');
    };

    const initials = (fullname || username || 'U').slice(0, 2).toUpperCase();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-purple/30 hover:ring-purple/60 focus:outline-none focus:ring-2 focus:ring-purple transition-all duration-150 block"
                    aria-label="User navigation menu"
                >
                    <Avatar className="w-10 h-10">
                        <AvatarImage src={profile_img} alt={fullname || username} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-64 p-2 shadow-2xl rounded-2xl border-border bg-popover text-popover-foreground" align="end" sideOffset={8}>
                <DropdownMenuLabel className="p-2 font-normal">
                    <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                            <AvatarImage src={profile_img} alt={fullname || username} />
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-0.5 overflow-hidden">
                            <span className="text-sm font-semibold text-foreground truncate">
                                {fullname || username}
                            </span>
                            <span className="text-xs text-muted-foreground truncate">
                                @{username}
                            </span>
                        </div>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="my-1.5" />

                <DropdownMenuItem asChild>
                    <Link to={`/user/${username}`} className="flex items-center gap-2.5 px-3 py-2 cursor-pointer rounded-lg hover:bg-muted">
                        <User className="w-4 h-4 text-purple" />
                        <span className="text-sm font-medium">Public Profile</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link to="/dashboard/analytics" className="flex items-center gap-2.5 px-3 py-2 cursor-pointer rounded-lg hover:bg-muted">
                        <LayoutDashboard className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium">Studio Analytics</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link to="/dashboard/blogs" className="flex items-center gap-2.5 px-3 py-2 cursor-pointer rounded-lg hover:bg-muted">
                        <FileText className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-medium">My Stories</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link to="/dashboard/notifications" className="flex items-center gap-2.5 px-3 py-2 cursor-pointer rounded-lg hover:bg-muted">
                        <Bell className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-medium">Notifications</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="md:hidden">
                    <Link to="/editor" className="flex items-center gap-2.5 px-3 py-2 cursor-pointer rounded-lg hover:bg-muted">
                        <PenSquare className="w-4 h-4 text-purple" />
                        <span className="text-sm font-medium text-purple">Write Story</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1.5" />

                <DropdownMenuItem asChild>
                    <Link to="/settings/edit-profile" className="flex items-center gap-2.5 px-3 py-2 cursor-pointer rounded-lg hover:bg-muted">
                        <Settings className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Edit Profile</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link to="/settings/change-password" className="flex items-center gap-2.5 px-3 py-2 cursor-pointer rounded-lg hover:bg-muted">
                        <KeyRound className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Security & Password</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1.5" />

                <DropdownMenuItem
                    onClick={signOutUser}
                    className="flex items-center gap-2.5 px-3 py-2 cursor-pointer rounded-lg text-red focus:bg-red/10 focus:text-red hover:bg-red/10 hover:text-red transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Sign Out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
