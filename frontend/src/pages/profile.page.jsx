import React, { useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AnimationWrapper from '../common/page-animation';
import axios from 'axios';
import { UserContext } from '../App';
import AboutUser from '../components/about.component';
import filterPaginationData from '../common/filter-pagination-data';
import InPageNavigation from '../components/inpage-navigation.component';
import BlogPostCard from '../components/blog-post.component';
import NoDataMessage from '../components/nodata.component';
import LoadMoreDataBtn from '../components/load-more.component';
import BlogPostSkeleton from '../components/blog-post-skeleton.component';
import PageNotFound from './404.page';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings, BookOpen, Eye } from 'lucide-react';

export const profileDataStructure = {
    personal_info: {
        fullname: "",
        username: "",
        profile_img: "",
        bio: "",
    },
    account_info: {
        total_posts: 0,
        total_reads: 0,
    },
    social_links: {},
    joinedAt: ""
};

export default function ProfilePage() {
    const { id: profileId } = useParams();
    const [profile, setProfile] = useState(profileDataStructure);
    const [loading, setLoading] = useState(true);
    const [profileLoaded, setProfileLoaded] = useState("");
    const { personal_info: { fullname, username: profile_username, profile_img, bio }, account_info: { total_posts = 0, total_reads = 0 } = {}, social_links, joinedAt } = profile;
    const [blogs, setBlogs] = useState(null);
    const { userAuth: { username: loggedInUsername } } = useContext(UserContext);

    const getBlogs = async ({ page = 1, user_id }) => {
        const targetUserId = user_id === undefined ? blogs?.user_id : user_id;
        try {
            const { data } = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", {
                author: targetUserId,
                page
            });
            const formatedData = await filterPaginationData({
                state: blogs,
                data: data.blogs,
                page,
                countRoute: "/search-blogs-count",
                data_to_send: { author: targetUserId }
            });
            formatedData.user_id = targetUserId;
            setBlogs(formatedData);
        } catch (error) {
            console.error("Error fetching author blogs:", error);
        }
    };

    const fetchUserProfile = async () => {
        try {
            const { data } = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-profile", {
                username: profileId
            });
            if (data.user != null) {
                setProfile(data.user);
                setProfileLoaded(profileId);
                getBlogs({ user_id: data.user._id });
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching user profile:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (profileId !== profileLoaded) {
            setBlogs(null);
        }
        if (blogs === null) {
            setProfile(profileDataStructure);
            setLoading(true);
            setProfileLoaded("");
            fetchUserProfile();
        }
    }, [profileId, blogs]);

    const initials = (fullname || profile_username || 'U').slice(0, 2).toUpperCase();

    return (
        <AnimationWrapper>
            {loading ? (
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                    <div className="flex gap-6 items-center">
                        <Skeleton className="w-24 h-24 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                    <BlogPostSkeleton count={3} />
                </div>
            ) : profile_username && profile_username.length ? (
                <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8'>
                    <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start'>
                        {/* Stories Feed */}
                        <main className='lg:col-span-8 min-w-0 order-2 lg:order-1'>
                            <InPageNavigation routes={["Stories Published", "About"]} defaultHidden={["About"]}>
                                <>
                                    {blogs === null ? (
                                        <BlogPostSkeleton count={3} />
                                    ) : blogs.results.length ? (
                                        blogs.results.map((blog, i) => (
                                            <AnimationWrapper transition={{ duration: 0.3, delay: i * 0.05 }} key={blog.blog_id || i}>
                                                <BlogPostCard content={blog} author={blog.author.personal_info} />
                                            </AnimationWrapper>
                                        ))
                                    ) : (
                                        <NoDataMessage
                                            message="No stories published yet."
                                            description="Stories published by this writer will appear here."
                                        />
                                    )}
                                    <LoadMoreDataBtn state={blogs} fetchDataFunc={getBlogs} />
                                </>

                                <AboutUser
                                    bio={bio}
                                    social_links={social_links}
                                    joinedAt={joinedAt}
                                    className="pt-4"
                                />
                            </InPageNavigation>
                        </main>

                        {/* Author Profile Sidebar */}
                        <aside className='lg:col-span-4 min-w-0 order-1 lg:order-2 flex flex-col max-lg:items-center gap-5 lg:sticky top-24 lg:pl-6 lg:border-l border-border/60 pb-10'>
                            <Avatar className='w-24 h-24 sm:w-28 sm:h-28 ring-4 ring-border shadow-md'>
                                <AvatarImage src={profile_img} alt={profile_username} />
                                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                            </Avatar>

                            <div className="space-y-1 max-lg:text-center">
                                <h1 className='text-2xl font-bold font-inter text-foreground'>
                                    {fullname}
                                </h1>
                                <p className='text-sm text-muted-foreground font-medium'>
                                    @{profile_username}
                                </p>
                            </div>

                            {/* Author KPIs */}
                            <div className="flex items-center gap-3 flex-wrap max-lg:justify-center">
                                <Badge variant="secondary" className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl">
                                    <BookOpen className="w-3.5 h-3.5 text-purple" />
                                    <span>{total_posts.toLocaleString()} Stories</span>
                                </Badge>
                                <Badge variant="secondary" className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl">
                                    <Eye className="w-3.5 h-3.5 text-blue-500" />
                                    <span>{total_reads.toLocaleString()} Reads</span>
                                </Badge>
                            </div>

                            {profileId === loggedInUsername && (
                                <Button asChild variant="outline" className="rounded-xl border-border hover:bg-muted gap-2 w-full max-w-[200px] max-lg:mx-auto">
                                    <Link to='/settings/edit-profile'>
                                        <Settings className="w-4 h-4" />
                                        <span>Edit Profile</span>
                                    </Link>
                                </Button>
                            )}

                            <div className="w-full pt-4 border-t border-border/60">
                                <AboutUser
                                    bio={bio}
                                    social_links={social_links}
                                    joinedAt={joinedAt}
                                    className="max-lg:hidden"
                                />
                            </div>
                        </aside>
                    </div>
                </div>
            ) : (
                <PageNotFound />
            )}
        </AnimationWrapper>
    );
}
