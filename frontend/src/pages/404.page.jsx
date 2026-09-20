import React, { useContext } from 'react';
import lightPageNotFoundImage from '../imgs/404-light.png';
import darkPageNotFoundImage from '../imgs/404-dark.png';
import lightFullLogo from '../imgs/full-logo-light.png';
import darkFullLogo from '../imgs/full-logo-dark.png';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../App';
import { Button } from '@/components/ui/button';
import { Home, Compass } from 'lucide-react';

export default function PageNotFound() {
  const { theme } = useContext(ThemeContext);

  return (
    <section className='h-cover relative py-16 px-6 flex flex-col items-center justify-center text-center max-w-2xl mx-auto'>
      {/* 404 Themed Illustration */}
      <div className="w-64 h-64 sm:w-72 sm:h-72 aspect-square rounded-3xl overflow-hidden mb-8">
        <img
          src={theme === 'dark' ? darkPageNotFoundImage : lightPageNotFoundImage}
          alt="404 Page Not Found"
          className='w-full h-full object-contain select-none'
        />
      </div>

      <h1 className='text-3xl sm:text-4xl font-bold font-inter text-foreground mb-3'>
        Page Not Found
      </h1>
      <p className='text-muted-foreground text-base sm:text-lg max-w-md mb-8 leading-relaxed'>
        The story or page you are looking for doesn't exist, has been removed, or is temporarily unavailable.
      </p>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 flex-wrap justify-center">
        <Button asChild className="rounded-xl px-6 font-semibold gap-2">
          <Link to="/">
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-xl px-6 font-semibold gap-2 border-border">
          <Link to="/dashboard/analytics">
            <Compass className="w-4 h-4" />
            <span>Studio Analytics</span>
          </Link>
        </Button>
      </div>

      {/* Brand Footer */}
      <div className='mt-16 pt-8 border-t border-border w-full flex flex-col items-center'>
        <img
          src={theme === 'dark' ? darkFullLogo : lightFullLogo}
          alt="Blog Platform"
          className='h-7 object-contain select-none opacity-80'
        />
        <p className='mt-2 text-xs text-muted-foreground'>
          Read, write, and share millions of stories around the world.
        </p>
      </div>
    </section>
  );
}
