import React, { useEffect, useState } from 'react';
import AnimationWrapper from '../common/page-animation';
import InPageNavigation from './../components/inpage-navigation.component';
import axios from 'axios';
import BlogPostCard from '../components/blog-post.component';
import MinimalBlogPost from '../components/nobanner-blog-post.component';
import NoDataMessage from '../components/nodata.component';
import filterPaginationData from '../common/filter-pagination-data';
import LoadMoreDataBtn from '../components/load-more.component';
import BlogPostSkeleton from '../components/blog-post-skeleton.component';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Compass } from 'lucide-react';

export default function HomePage() {
  const [blogs, setBlogs] = useState(null);
  const [trendingBlogs, setTrendingBlogs] = useState(null);
  const categories = ["programming", "cinema", "food", "finance", "tech", "fitness", "travel", "space"];
  const [pagestate, setPageState] = useState("home");

  const fetchLatestBlogs = async ({ page = 1 }) => {
    try {
      const { data } = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs", { page });
      const formatedData = await filterPaginationData({
        state: blogs,
        data: data.blogs,
        page,
        countRoute: "/all-latest-blogs-count",
      });
      setBlogs(formatedData);
    } catch (error) {
      console.error("Failed to fetch latest blogs:", error);
    }
  };

  const fetchTrendingBlogs = async () => {
    try {
      const { data } = await axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/trending-blogs");
      setTrendingBlogs(data.blogs);
    } catch (error) {
      console.error("Failed to fetch trending blogs:", error);
    }
  };

  const fetchBlogsByCategory = async ({ page = 1 }) => {
    try {
      const { data } = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", { tag: pagestate, page });
      const formatedData = await filterPaginationData({
        state: blogs,
        data: data.blogs,
        page,
        countRoute: "/search-blogs-count",
        data_to_send: { tag: pagestate }
      });
      setBlogs(formatedData);
    } catch (error) {
      console.error("Failed to fetch blogs by category:", error);
    }
  };

  useEffect(() => {
    if (pagestate === "home") {
      fetchLatestBlogs({ page: 1 });
    } else {
      fetchBlogsByCategory({ page: 1 });
    }
    if (!trendingBlogs) {
      fetchTrendingBlogs();
    }
  }, [pagestate]);

  const loadByCategory = (category) => {
    const selectedCategory = category.toLowerCase();
    setBlogs(null);
    if (pagestate === selectedCategory) {
      setPageState("home");
      return;
    }
    setPageState(selectedCategory);
  };

  return (
    <AnimationWrapper>
      <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start'>
          {/* Main Feed */}
          <main className='lg:col-span-8 min-w-0'>
            <InPageNavigation routes={[pagestate, "trending blogs"]} defaultHidden={["trending blogs"]}>
              <>
                {blogs === null ? (
                  <BlogPostSkeleton count={4} />
                ) : blogs.results.length ? (
                  blogs.results.map((blog, i) => (
                    <AnimationWrapper transition={{ duration: 0.3, delay: i * 0.05 }} key={blog.blog_id || i}>
                      <BlogPostCard content={blog} author={blog.author.personal_info} />
                    </AnimationWrapper>
                  ))
                ) : (
                  <NoDataMessage message="No stories published in this category yet." description="Be the first to publish a story on this topic!" />
                )}
                <LoadMoreDataBtn
                  state={blogs}
                  fetchDataFunc={pagestate === "home" ? fetchLatestBlogs : fetchBlogsByCategory}
                />
              </>

              <>
                {trendingBlogs === null ? (
                  <div className="space-y-4 py-4">
                    {[1, 2, 3, 4].map((n) => (
                      <div key={n} className="flex gap-4 items-center">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : trendingBlogs.length ? (
                  trendingBlogs.map((blog, i) => (
                    <AnimationWrapper transition={{ duration: 0.3, delay: i * 0.05 }} key={blog.blog_id || i}>
                      <MinimalBlogPost blog={blog} index={i} />
                    </AnimationWrapper>
                  ))
                ) : (
                  <NoDataMessage message="No trending stories available right now." />
                )}
              </>
            </InPageNavigation>
          </main>

          {/* Sidebar: Categories and Trending */}
          <aside className='lg:col-span-4 min-w-0 max-lg:hidden sticky top-24 space-y-10 pl-4 lg:border-l border-border/60'>
            {/* Interests Filter */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Compass className="w-4 h-4 text-purple" />
                <h2 className='font-bold text-sm uppercase tracking-wider text-muted-foreground'>
                  Recommended topics
                </h2>
              </div>
              <div className='flex flex-wrap gap-2'>
                {categories.map((category, i) => {
                  const isActive = pagestate === category;
                  return (
                    <button
                      key={i}
                      onClick={() => loadByCategory(category)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium capitalize transition-all duration-150 border ${
                        isActive
                          ? "bg-foreground text-background border-transparent shadow-sm font-semibold"
                          : "bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border-border/60"
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Trending Stories */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-purple" />
                <h2 className='font-bold text-sm uppercase tracking-wider text-muted-foreground'>
                  Trending Stories
                </h2>
              </div>

              {trendingBlogs === null ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="flex gap-4 items-start p-2">
                      <Skeleton className="w-6 h-6 rounded-md" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : trendingBlogs.length ? (
                <div className="space-y-1">
                  {trendingBlogs.map((blog, i) => (
                    <AnimationWrapper transition={{ duration: 0.3, delay: i * 0.05 }} key={blog.blog_id || i}>
                      <MinimalBlogPost blog={blog} index={i} />
                    </AnimationWrapper>
                  ))}
                </div>
              ) : (
                <NoDataMessage message="No trending stories found." />
              )}
            </div>
          </aside>
        </div>
      </div>
    </AnimationWrapper>
  );
}
