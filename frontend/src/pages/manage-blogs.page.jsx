import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { UserContext } from './../App';
import filterPaginationData from '../common/filter-pagination-data';
import { Toaster } from 'react-hot-toast';
import InPageNavigation from '../components/inpage-navigation.component';
import NoDataMessage from '../components/nodata.component';
import AnimationWrapper from '../common/page-animation';
import { ManagePublishedBlogCard, MangeDraftBlogPost } from '../components/manage-blogcard.component';
import LoadMoreDataBtn from '../components/load-more.component';
import BlogPostSkeleton from '../components/blog-post-skeleton.component';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';

export default function ManageBlogs() {
    const [blogs, setBlogs] = useState(null);
    const [drafts, setDrafts] = useState(null);
    const [query, setQuery] = useState('');
    const activeTab = useSearchParams()[0].get('tab');
    const { userAuth: { access_token } } = useContext(UserContext);

    const getBlogs = ({ page, draft, deletedDocCount = 0 }) => {
        axios.post(
            `${import.meta.env.VITE_SERVER_DOMAIN}/user-written-blogs`,
            { page, draft, query, deletedDocCount },
            {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            }
        ).then(async ({ data }) => {
            const formatedData = await filterPaginationData({
                state: draft ? drafts : blogs,
                data: data.blogs,
                page,
                user: access_token,
                countRoute: '/user-written-blogs-count',
                data_to_send: { draft, query }
            });

            if (draft) {
                setDrafts(formatedData);
            } else {
                setBlogs(formatedData);
            }
        }).catch((err) => console.error(err));
    };

    const handleChange = (e) => {
        if (!e.target.value.length) {
            setQuery('');
            setBlogs(null);
            setDrafts(null);
        }
    };

    const handleSearch = (e) => {
        const searchQuery = e.target.value;
        if (searchQuery.length) setQuery(searchQuery);
        if (e.keyCode === 13 && searchQuery.trim().length) {
            setBlogs(null);
            setDrafts(null);
        }
    };

    useEffect(() => {
        if (access_token) {
            if (blogs == null) {
                getBlogs({ page: 1, draft: false });
            }
            if (drafts == null) {
                getBlogs({ page: 1, draft: true });
            }
        }
    }, [access_token, blogs, drafts, query]);

    return (
        <div className="w-full pb-16">
            <h1 className="text-2xl font-bold font-inter text-foreground max-md:hidden">
                Manage Stories
            </h1>
            <Toaster />

            <div className="relative max-md:mt-4 md:mt-6 mb-8">
                <input
                    onChange={handleChange}
                    onKeyDown={handleSearch}
                    type="search"
                    placeholder="Search published or draft stories..."
                    className="w-full bg-muted/50 border border-border focus:border-purple/50 p-3.5 pl-12 pr-6 rounded-2xl placeholder:text-muted-foreground text-foreground text-sm outline-none transition-colors duration-150"
                />
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>

            <InPageNavigation
                routes={["Published blogs", "Drafts"]}
                defaultActiveIndex={activeTab !== 'draft' ? 0 : 1}
            >
                {/* Published blogs tab */}
                {blogs === null ? (
                    <BlogPostSkeleton count={3} />
                ) : blogs.results.length ? (
                    <>
                        {blogs.results.map((blog, i) => (
                            <AnimationWrapper key={blog.blog_id || i} transition={{ delay: i * 0.04 }}>
                                <ManagePublishedBlogCard blog={{ ...blog, setStateFunc: setBlogs }} />
                            </AnimationWrapper>
                        ))}
                        <LoadMoreDataBtn
                            state={blogs}
                            fetchDataFunc={getBlogs}
                            additionalParam={{ draft: false, deletedDocCount: blogs.deletedDocCount }}
                        />
                    </>
                ) : (
                    <NoDataMessage
                        message="No published stories found."
                        description="Write and publish a story to see it listed here."
                    />
                )}

                {/* Draft blogs tab */}
                {drafts === null ? (
                    <BlogPostSkeleton count={2} />
                ) : drafts.results.length ? (
                    <>
                        {drafts.results.map((blog, i) => (
                            <AnimationWrapper key={blog.blog_id || i} transition={{ delay: i * 0.04 }}>
                                <MangeDraftBlogPost blog={{ ...blog, index: i, setStateFunc: setDrafts }} />
                            </AnimationWrapper>
                        ))}
                        <LoadMoreDataBtn
                            state={drafts}
                            fetchDataFunc={getBlogs}
                            additionalParam={{ draft: true, deletedDocCount: drafts.deletedDocCount }}
                        />
                    </>
                ) : (
                    <NoDataMessage
                        message="No draft stories found."
                        description="Any stories saved as drafts will appear here."
                    />
                )}
            </InPageNavigation>
        </div>
    );
}
