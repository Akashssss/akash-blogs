import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { UserContext } from '../App';
import AnimationWrapper from '../common/page-animation';
import { Link } from 'react-router-dom';
import {
    Eye,
    Heart,
    MessageSquare,
    FileText,
    TrendingUp,
    PenSquare,
    ArrowUpRight,
    Clock,
    Sparkles
} from 'lucide-react';
import { getDay } from '../common/date';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
    const { userAuth: { access_token } } = useContext(UserContext);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (access_token) {
            axios.get(`${import.meta.env.VITE_SERVER_DOMAIN}/api/v2/analytics`, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            }).then(({ data }) => {
                setAnalytics(data.data);
                setLoading(false);
            }).catch((err) => {
                console.error('Error fetching dashboard analytics:', err);
                setLoading(false);
            });
        }
    }, [access_token]);

    const overview = analytics?.overview || {
        totalReads: 0,
        totalLikes: 0,
        totalComments: 0,
        totalPosts: 0,
        publishedCount: 0,
        draftCount: 0,
        engagementRate: '0%'
    };

    const topBlogs = analytics?.topBlogs || [];

    const statCards = [
        {
            title: 'Total Reads',
            value: overview.totalReads.toLocaleString(),
            icon: Eye,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10'
        },
        {
            title: 'Total Likes',
            value: overview.totalLikes.toLocaleString(),
            icon: Heart,
            color: 'text-rose-500',
            bg: 'bg-rose-500/10'
        },
        {
            title: 'Total Comments',
            value: overview.totalComments.toLocaleString(),
            icon: MessageSquare,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10'
        },
        {
            title: 'Engagement Rate',
            value: overview.engagementRate,
            icon: TrendingUp,
            color: 'text-purple',
            bg: 'bg-purple/10'
        }
    ];

    return (
        <AnimationWrapper>
            <div className="w-full pb-16">
                {/* Header with greeting and quick action */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold font-inter text-foreground">
                            Author Studio & Analytics
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            Real-time insights into your stories, readership, and audience engagement
                        </p>
                    </div>

                    <Button asChild className="rounded-xl px-5 font-semibold text-xs gap-2 bg-purple hover:bg-purple/90 text-white shadow-md">
                        <Link to="/editor">
                            <PenSquare className="w-4 h-4" />
                            <span>Create New Story</span>
                        </Link>
                    </Button>
                </div>

                {loading ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} className="h-28 rounded-2xl" />
                            ))}
                        </div>
                        <Skeleton className="h-96 rounded-2xl" />
                    </div>
                ) : (
                    <>
                        {/* KPI Overview Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            {statCards.map((card) => {
                                const Icon = card.icon;
                                return (
                                    <Card
                                        key={card.title}
                                        className="p-5 border-border bg-card text-card-foreground shadow-sm rounded-2xl"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-medium text-muted-foreground">{card.title}</span>
                                            <div className={`w-8 h-8 rounded-xl ${card.bg} flex items-center justify-center ${card.color}`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                        </div>
                                        <div className="text-2xl sm:text-3xl font-bold font-inter text-foreground">
                                            {card.value}
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Publication Status & Top Performing Articles */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Column: Top Articles Table */}
                            <Card className="lg:col-span-2 border-border bg-card text-card-foreground shadow-sm rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-base sm:text-lg font-bold font-inter text-foreground flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-purple" />
                                        <span>Top Performing Stories</span>
                                    </h2>
                                    <Link to="/dashboard/blogs" className="text-xs text-purple font-medium hover:underline flex items-center gap-1">
                                        <span>View all ({overview.totalPosts})</span>
                                        <ArrowUpRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>

                                {topBlogs.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground text-sm">
                                        <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                        <p>No published stories yet. Publish your first story to see live metrics!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {topBlogs.map((post, idx) => (
                                            <div
                                                key={post.blog_id}
                                                className="flex items-center justify-between gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors duration-150"
                                            >
                                                <div className="flex items-center gap-3.5 truncate">
                                                    <span className="text-xs font-bold text-muted-foreground/60 font-mono w-5">
                                                        0{idx + 1}
                                                    </span>
                                                    <div className="truncate">
                                                        <Link
                                                            to={`/blog/${post.blog_id}`}
                                                            className="font-medium text-sm text-foreground hover:text-purple duration-150 truncate block"
                                                        >
                                                            {post.title}
                                                        </Link>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                            <span>{getDay(post.publishedAt)}</span>
                                                            <span>•</span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {post.readTime} min read
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 text-xs flex-shrink-0 text-muted-foreground">
                                                    <span className="flex items-center gap-1 font-semibold text-foreground">
                                                        <Eye className="w-3.5 h-3.5 text-blue-500" />
                                                        {post.reads}
                                                    </span>
                                                    <span className="flex items-center gap-1 font-semibold text-foreground">
                                                        <Heart className="w-3.5 h-3.5 text-rose-500" />
                                                        {post.likes}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>

                            {/* Right Column: Publication Breakdown & Quick Shortcuts */}
                            <div className="space-y-6">
                                {/* Summary breakdown card */}
                                <Card className="border-border bg-card text-card-foreground shadow-sm rounded-2xl p-6">
                                    <h2 className="text-sm font-bold font-inter text-foreground mb-4">
                                        Content Portfolio
                                    </h2>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-xs sm:text-sm py-2 border-b border-border">
                                            <span className="text-muted-foreground">Published Stories</span>
                                            <Badge variant="success" className="text-xs font-semibold">{overview.publishedCount}</Badge>
                                        </div>
                                        <div className="flex items-center justify-between text-xs sm:text-sm py-2 border-b border-border">
                                            <span className="text-muted-foreground">Drafts in Progress</span>
                                            <Badge variant="warning" className="text-xs font-semibold">{overview.draftCount}</Badge>
                                        </div>
                                        <div className="flex items-center justify-between text-xs sm:text-sm py-2">
                                            <span className="text-muted-foreground">Total Stories Written</span>
                                            <Badge variant="secondary" className="text-xs font-semibold">{overview.totalPosts}</Badge>
                                        </div>
                                    </div>
                                </Card>

                                {/* Quick Studio CTA */}
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-purple/15 to-indigo-500/10 border border-purple/20 shadow-sm">
                                    <div className="flex items-center gap-2 mb-2 text-purple">
                                        <Sparkles className="w-4 h-4" />
                                        <h3 className="text-sm font-bold text-foreground">
                                            Ready to publish?
                                        </h3>
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                                        High-res banners are automatically compressed into ultra-fast WebP with 100% free Google Drive storage.
                                    </p>
                                    <Button asChild className="w-full rounded-xl text-xs font-semibold bg-purple hover:bg-purple/90 text-white shadow-md">
                                        <Link to="/editor">
                                            Open Editor Studio
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AnimationWrapper>
    );
}
