import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import InPageNavigation from '../components/inpage-navigation.component';
import AnimationWrapper from '../common/page-animation';
import BlogPostCard from '../components/blog-post.component';
import LoadMoreDataBtn from '../components/load-more.component';
import filterPaginationData from '../common/filter-pagination-data';
import NoDataMessage from '../components/nodata.component';
import BlogPostSkeleton from '../components/blog-post-skeleton.component';
import { Skeleton } from '@/components/ui/skeleton';
import axios from 'axios';
import UserCard from '../components/usercard.component';
import { Users, BookOpen } from 'lucide-react';

export default function SearchPage() {
    const { query } = useParams();
    const [blogs, setBlogs] = useState(null);
    const [users, setUsers] = useState(null);

    const fetchUsers = async () => {
        try {
            const { data } = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-users", { query });
            setUsers(data.users);
        } catch (error) {
            console.error("Error searching users:", error);
            setUsers([]);
        }
    };

    const searchBlogs = async ({ page = 1, create_new_arr = false }) => {
        try {
            const { data } = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", { query, page });
            const formatedData = await filterPaginationData({
                state: blogs,
                data: data.blogs,
                page,
                countRoute: "/search-blogs-count",
                data_to_send: { query },
                create_new_arr
            });
            setBlogs(formatedData);
        } catch (error) {
            console.error("Error searching blogs:", error);
        }
    };

    const resetState = () => {
        setBlogs(null);
        setUsers(null);
    };

    useEffect(() => {
        resetState();
        searchBlogs({ page: 1, create_new_arr: true });
        fetchUsers();
    }, [query]);

    const UserCardWrapper = () => {
        if (users === null) {
            return (
                <div className="space-y-3 py-2">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="flex gap-3 items-center p-2">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div className="space-y-1.5 flex-1">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        if (!users.length) {
            return <NoDataMessage message="No writers found" description={`No author accounts match "${query}".`} />;
        }

        return (
            <div className="space-y-1">
                {users.map((user, i) => (
                    <AnimationWrapper key={user._id || i} transition={{ duration: 0.3, delay: i * 0.05 }}>
                        <UserCard user={user} />
                    </AnimationWrapper>
                ))}
            </div>
        );
    };

    return (
        <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8'>
            <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start'>
                <main className='lg:col-span-8 min-w-0'>
                    <InPageNavigation
                        routes={[`Stories for "${query}"`, "Writers matched"]}
                        defaultHidden={["Writers matched"]}
                    >
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
                                    message={`No stories found for "${query}"`}
                                    description="Try searching for another keyword, topic, or author."
                                />
                            )}
                            <LoadMoreDataBtn state={blogs} fetchDataFunc={searchBlogs} />
                        </>

                        <UserCardWrapper />
                    </InPageNavigation>
                </main>

                <aside className='lg:col-span-4 min-w-0 max-lg:hidden sticky top-24 space-y-6 pl-4 lg:border-l border-border/60'>
                    <div className="flex items-center gap-2 mb-4">
                        <Users className="w-4 h-4 text-purple" />
                        <h2 className='font-bold text-sm uppercase tracking-wider text-muted-foreground'>
                            Writers related to search
                        </h2>
                    </div>
                    <UserCardWrapper />
                </aside>
            </div>
        </div>
    );
}
