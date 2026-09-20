import React from 'react';
import { getDay } from './../common/date';
import { Link } from 'react-router-dom';
import { Heart, Clock } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function BlogPostCard({ content, author }) {
    const { publishedAt, tags = [], title, des, banner, activity: { total_likes = 0 } = {}, blog_id: id, read_time } = content || {};
    const { fullname, username, profile_img } = author || {};
    const readTimeMinutes = read_time?.minutes || Math.max(1, Math.ceil((des?.length || 100) / 150));
    const initials = (fullname || username || 'U').slice(0, 2).toUpperCase();

    return (
        <Link
            to={`/blog/${id}`}
            className="w-full block border-b border-border/60 pb-6 mb-5 p-3 sm:p-4 rounded-2xl hover:bg-muted/30 transition-all duration-200 group"
        >
            {/* Author Info */}
            <div className="flex gap-2.5 items-center mb-3 text-xs text-muted-foreground">
                <Avatar className="w-6 h-6 ring-1 ring-border shrink-0">
                    <AvatarImage src={profile_img} alt={username} />
                    <AvatarFallback className="text-[9px]">{initials}</AvatarFallback>
                </Avatar>
                <span className="font-semibold text-foreground truncate max-w-[140px] sm:max-w-[200px]">{fullname || username}</span>
                <span className="opacity-60 hidden xs:inline">@{username}</span>
                <span className="opacity-40">•</span>
                <span className="min-w-fit">{getDay(publishedAt)}</span>
            </div>

            {/* Content Row: Text on Left, Compact Thumbnail on Right */}
            <div className="flex items-start justify-between gap-4 sm:gap-6">
                <div className="flex-1 min-w-0">
                    {/* Title */}
                    <h2 className="text-base sm:text-xl font-bold font-inter text-foreground group-hover:text-purple duration-150 line-clamp-2 leading-snug">
                        {title}
                    </h2>

                    {/* Description */}
                    {des && (
                        <p className="my-1.5 sm:my-2 text-xs sm:text-sm font-gelasio text-muted-foreground leading-relaxed line-clamp-2">
                            {des}
                        </p>
                    )}

                    {/* Footer Badges & Stats */}
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3 text-xs text-muted-foreground">
                        {tags[0] && (
                            <Badge variant="secondary" className="text-[11px] py-0.5 px-2.5 capitalize group-hover:bg-purple/10 group-hover:text-purple transition-colors">
                                {tags[0]}
                            </Badge>
                        )}
                        <span className="flex items-center gap-1.5 font-medium">
                            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                            {readTimeMinutes} min read
                        </span>
                        <span className="flex items-center gap-1 font-medium">
                            <Heart className="w-3.5 h-3.5 text-muted-foreground group-hover:text-rose-500 transition-colors" />
                            {total_likes}
                        </span>
                    </div>
                </div>

                {/* Banner Thumbnail */}
                {banner && (
                    <div className="w-20 h-20 sm:w-36 sm:h-24 md:w-44 md:h-28 shrink-0 rounded-xl sm:rounded-2xl overflow-hidden bg-muted shadow-sm group-hover:shadow-md duration-200">
                        <img
                            className="w-full h-full object-cover group-hover:scale-105 duration-300"
                            src={banner}
                            alt={title}
                            loading="lazy"
                            onError={(e) => {
                                if (e.currentTarget?.parentElement) {
                                    e.currentTarget.parentElement.style.display = 'none';
                                }
                            }}
                        />
                    </div>
                )}
            </div>
        </Link>
    );
}
