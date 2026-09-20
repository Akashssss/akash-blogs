import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from './../App';
import filterPaginationData from '../common/filter-pagination-data';
import axios from 'axios';
import AnimationWrapper from '../common/page-animation';
import NoDataMessage from '../components/nodata.component';
import NotificationCard from '../components/notification-card.component';
import LoadMoreDataBtn from '../components/load-more.component';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Bell, Heart, MessageSquare, CornerDownRight } from 'lucide-react';

export default function Notifications() {
  const [filter, setFilter] = useState('all');
  const filters = ['all', 'like', 'comment', 'reply'];
  const [notifications, setNotifications] = useState(null);

  const { userAuth, setUserAuth, userAuth: { access_token, new_notification_available } } = useContext(UserContext);

  const fetchNotifications = ({ page, deletedDocCount = 0 }) => {
    axios.post(
      import.meta.env.VITE_SERVER_DOMAIN + '/notifications',
      { page, filter, deletedDocCount },
      {
        headers: { 'Authorization': `Bearer ${access_token}` }
      }
    )
    .then(async ({ data: { notifications: data } }) => {
      if (new_notification_available) {
        setUserAuth({ ...userAuth, new_notification_available: false });
      }
      const formatedData = await filterPaginationData({
        state: notifications,
        data,
        page,
        countRoute: '/all-notifications-count',
        data_to_send: { filter },
        user: access_token
      });
      setNotifications(formatedData);
    }).catch(error => {
      console.error("Failed to fetch notifications:", error);
    });
  };

  useEffect(() => {
    if (access_token) {
      fetchNotifications({ page: 1 });
    }
  }, [access_token, filter]);

  const handleFilter = (filterName) => {
    setFilter(filterName);
    setNotifications(null);
  };

  const getFilterIcon = (name) => {
    switch (name) {
      case 'like': return <Heart className="w-3.5 h-3.5 mr-1 text-rose-500" />;
      case 'comment': return <MessageSquare className="w-3.5 h-3.5 mr-1 text-blue-500" />;
      case 'reply': return <CornerDownRight className="w-3.5 h-3.5 mr-1 text-purple" />;
      default: return <Bell className="w-3.5 h-3.5 mr-1" />;
    }
  };

  return (
    <div className="w-full pb-16">
      <div className="flex items-center justify-between mb-6">
        <h1 className='text-2xl font-bold font-inter text-foreground max-md:hidden'>
          Activity & Notifications
        </h1>
      </div>

      {/* Filter Tabs */}
      <div className='flex gap-2 flex-wrap mb-6'>
        {filters.map((filterName, i) => {
          const isActive = filter === filterName;
          return (
            <Button
              key={i}
              variant={isActive ? "default" : "secondary"}
              size="sm"
              onClick={() => handleFilter(filterName)}
              className="rounded-full text-xs font-semibold capitalize transition-all duration-150"
            >
              {getFilterIcon(filterName)}
              <span>{filterName === 'all' ? 'All Activity' : `${filterName}s`}</span>
            </Button>
          );
        })}
      </div>

      {/* Notifications List */}
      {notifications === null ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="flex gap-4 items-start p-5 rounded-2xl border border-border bg-card">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {notifications.results.length > 0 ? (
            notifications.results.map((notification, i) => (
              <AnimationWrapper key={notification._id || i} transition={{ delay: i * 0.04 }}>
                <NotificationCard
                  data={notification}
                  index={i}
                  notificationState={{ notifications, setNotifications }}
                />
              </AnimationWrapper>
            ))
          ) : (
            <NoDataMessage
              message="All caught up!"
              description={`No new ${filter === 'all' ? 'notifications' : filter + 's'} at the moment.`}
            />
          )}

          <LoadMoreDataBtn
            state={notifications}
            fetchDataFunc={fetchNotifications}
            additionalParam={{ deletedDocCount: notifications.deletedDocCount }}
          />
        </>
      )}
    </div>
  );
}
