import React from 'react';
import { getFullDay } from '../common/date';
import { Calendar, Globe } from 'lucide-react';

export default function AboutUser({ bio, social_links = {}, joinedAt, className }) {
    return (
        <div className={`space-y-6 ${className}`}>
            <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">About</h3>
                <p className="text-sm sm:text-base leading-relaxed text-foreground font-gelasio">
                    {bio && bio.length ? bio : "No bio provided yet."}
                </p>
            </div>

            {social_links && Object.values(social_links).some(Boolean) && (
                <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Connect</h3>
                    <div className='flex gap-3 flex-wrap items-center'>
                        {Object.keys(social_links).map((key) => {
                            const rawLink = social_links[key];
                            if (!rawLink) return null;
                            const formattedUrl = rawLink.startsWith('http') ? rawLink : `https://${rawLink}`;

                            return (
                                <a
                                    key={key}
                                    href={formattedUrl}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted hover:bg-purple/15 text-muted-foreground hover:text-purple border border-border transition-all duration-150 text-xs font-medium capitalize'
                                    aria-label={key}
                                >
                                    {key === "website" ? (
                                        <Globe className="w-3.5 h-3.5" />
                                    ) : (
                                        <i className={`fi fi-brands-${key} text-sm`}></i>
                                    )}
                                    <span>{key}</span>
                                </a>
                            );
                        })}
                    </div>
                </div>
            )}

            {joinedAt && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Member since {getFullDay(joinedAt)}</span>
                </div>
            )}
        </div>
    );
}
