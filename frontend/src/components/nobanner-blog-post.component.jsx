import React from 'react';
import { Link } from 'react-router-dom';
import { getDay } from '../common/date';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export default function MinimalBlogPost({ blog, index }) {
    const {
        title,
        blog_id: id,
        author: { personal_info: { fullname, username, profile_img } = {} } = {},
        publishedAt
    } = blog;

    const formattedIndex = index < 9 ? `0${index + 1}` : `${index + 1}`;
    const initials = (fullname || username || 'U').slice(0, 2).toUpperCase();

    return (
        <Link
            to={`/blog/${id}`}
            className="flex items-start gap-3.5 p-2.5 rounded-xl hover:bg-muted/40 transition-all duration-150 group"
        >
            <span className="font-mono text-xl font-black text-muted-foreground/35 group-hover:text-purple transition-colors shrink-0 w-7 pt-0.5">
                {formattedIndex}
            </span>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 text-xs text-muted-foreground">
                    <Avatar className="w-4 h-4 ring-1 ring-border">
                        <AvatarImage src={profile_img} alt={username} />
                        <AvatarFallback className="text-[8px]">{initials}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-foreground truncate max-w-[110px]">
                        {fullname || username}
                    </span>
                    <span className="opacity-40">•</span>
                    <span className="shrink-0">{getDay(publishedAt)}</span>
                </div>

                <h3 className="text-sm font-bold font-inter text-foreground group-hover:text-purple transition-colors line-clamp-2 leading-snug">
                    {title}
                </h3>
            </div>
        </Link>
    );
}
