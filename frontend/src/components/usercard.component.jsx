import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export default function UserCard({ user }) {
    const { personal_info: { fullname, username, profile_img } = {} } = user || {};
    const initials = (fullname || username || 'U').slice(0, 2).toUpperCase();

    return (
        <Link
            to={`/user/${username}`}
            className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-muted/60 transition-all duration-150 group mb-1"
        >
            <Avatar className="w-11 h-11 ring-1 ring-border group-hover:ring-purple/40 duration-150">
                <AvatarImage src={profile_img} alt={username} />
                <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-foreground group-hover:text-purple transition-colors truncate">
                    {fullname}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                    @{username}
                </p>
            </div>
        </Link>
    );
}
