import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from './i18nWrapper';
import { trackClick } from './Analytics';
import ImageWithFallback from './ImageWithFallback';

// Event data type
interface Event {
  id: string;
  store: string;
  title: string;
  dateRange: string;
  iconUrl: string;
  bgColor: string;
  url: string;
}

// Sample events data
const events: Event[] = [
  {
    id: 'home-depot-memorial',
    store: 'Home Depot',
    title: 'Memorial Day Sale',
    dateRange: 'May 15 - 28',
    iconUrl: '/images/stores/home-depot.png',
    bgColor: '#522399',
    url: '/tips/money/home-depot-memorial-day-sale'
  },
  {
    id: 'lowes-memorial',
    store: "Lowe's",
    title: 'Memorial Day Sale',
    dateRange: 'May 15 - 28',
    iconUrl: '/images/stores/lowes.png',
    bgColor: '#8b1659',
    url: '/tips/money/lowes-memorial-day-sale'
  },
  {
    id: 'amazon-memorial',
    store: 'Amazon',
    title: 'Memorial Day Sale',
    dateRange: 'May 16 - 26',
    iconUrl: '/images/stores/amazon.png',
    bgColor: '#006634',
    url: '/tips/money/amazon-memorial-day-deals'
  },
  {
    id: 'macys-glam',
    store: "Macy's",
    title: '10 Days of Glam Sale',
    dateRange: 'May 16 - 26',
    iconUrl: '/images/stores/macys.png',
    bgColor: '#55c3d6',
    url: '/tips/couponing/macys-10-days-of-glam'
  }
];

const EventsCarousel: React.FC = () => {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState<boolean>(true);

  const handleEventClick = (eventId: string) => {
    try {
      trackClick('EventsCarousel', `Event_${eventId}`);
      setIsAutoScrolling(false); // Pause auto-scroll when user interacts
    } catch (error) {
      console.error('Error tracking event click:', error);
    }
  };

  // Auto-scroll functionality
  useEffect(() => {
    if (!isAutoScrolling) return;

    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % events.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoScrolling]);

  // Resume auto-scrolling after 10 seconds of inactivity
  useEffect(() => {
    if (isAutoScrolling) return;

    const timeout = setTimeout(() => {
      setIsAutoScrolling(true);
    }, 10000);

    return () => clearTimeout(timeout);
  }, [isAutoScrolling]);

  const nextSlide = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % events.length);
    setIsAutoScrolling(false);
  };

  const prevSlide = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + events.length) % events.length);
    setIsAutoScrolling(false);
  };

  return (
    <div className="py-10 px-4 md:px-8 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5.4 2C4.1 2 3 3.1 3 4.4V17c0 .8.7 1.5 1.5 1.5h11c.8 0 1.5-.7 1.5-1.5V7.4c0-1.3-1.1-2.4-2.4-2.4H10V4.4C10 3.1 8.9 2 7.6 2H5.4zM9 7h3.5c.8 0 1.5.7 1.5 1.5v7c0 .3-.2.5-.5.5h-11c-.3 0-.5-.2-.5-.5v-7c0-.8.7-1.5 1.5-1.5H9zm0-1V4.4c0-.7.6-1.4 1.4-1.4h2.2c.7 0 1.4.6 1.4 1.4V6H9zM5.4 3h2.2c.7 0 1.4.6 1.4 1.4V6H4V4.4c0-.7.6-1.4 1.4-1.4z" />
        </svg>
        {t('events.checkOutLatest', 'Check out these latest events')}
      </h2>

      <div className="relative">
        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2 hover:bg-gray-100 focus:outline-none"
          aria-label="Previous event"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2 hover:bg-gray-100 focus:outline-none"
          aria-label="Next event"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Event Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {events.map((event, index) => (
            <Link
              key={event.id}
              to={event.url}
              className={`block group transition-all duration-300 ${
                index === activeIndex ? 'scale-105 shadow-lg z-10' : 'hover:scale-102'
              }`}
              onClick={() => handleEventClick(event.id)}
            >
              <div className="rounded-lg overflow-hidden shadow-md">
                <div
                  className="p-4 text-white"
                  style={{ backgroundColor: event.bgColor }}
                >
                  <div className="flex items-center gap-2">
                    <ImageWithFallback
                      src={event.iconUrl}
                      alt={event.store}
                      className="w-8 h-8 rounded-full bg-white p-1"
                      fallbackText="Store"
                    />
                    <span className="font-medium">{event.dateRange}</span>
                  </div>
                </div>
                <div className="bg-white p-4 flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{event.store}</div>
                    <div className="text-sm text-gray-700">{event.title}</div>
                  </div>
                  <div className="text-[#982a4a] rounded-full w-8 h-8 flex items-center justify-center group-hover:bg-[#982a4a] group-hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center mt-4">
          {events.map((_, index) => (
            <button
              key={index}
              className={`h-2 w-2 mx-1 rounded-full transition-all focus:outline-none ${
                index === activeIndex ? 'bg-[#982a4a] w-4' : 'bg-gray-300'
              }`}
              onClick={() => {
                setActiveIndex(index);
                setIsAutoScrolling(false);
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventsCarousel;
