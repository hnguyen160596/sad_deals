import type React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { trackClick } from './Analytics';

interface FavoriteButtonProps {
  itemId: string;
  itemType: 'deal' | 'store' | 'coupon' | 'tip';
  itemTitle: string;
  itemUrl: string;
  itemImage?: string;
  className?: string;
  iconOnly?: boolean;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  itemId,
  itemType,
  itemTitle,
  itemUrl,
  itemImage,
  className = '',
  iconOnly = false,
}) => {
  const { isAuthenticated, isFavorite, addFavorite, removeFavorite } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const isFav = isFavorite(itemId);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      trackClick('Favorite Button', 'Login Redirect');
      navigate('/login', { state: { from: { pathname: window.location.pathname } } });
      return;
    }

    if (isProcessing) return;

    setIsProcessing(true);
    try {
      if (isFav) {
        await removeFavorite(itemId);
        trackClick('Favorite Button', `Remove ${itemType}`);
      } else {
        await addFavorite({
          id: itemId,
          type: itemType,
          title: itemTitle,
          url: itemUrl,
          imageUrl: itemImage,
        });
        trackClick('Favorite Button', `Add ${itemType}`);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const baseClassName = 'inline-flex items-center focus:outline-none transition-colors duration-200';
  const combinedClassName = `${baseClassName} ${className}`;

  return (
    <button
      onClick={handleToggleFavorite}
      className={combinedClassName}
      aria-label={isFav ? `Remove ${itemTitle} from favorites` : `Add ${itemTitle} to favorites`}
      disabled={isProcessing}
    >
      {isProcessing ? (
        <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 ${isFav ? 'text-red-500 fill-current' : 'text-gray-400'}`}
            fill={isFav ? 'currentColor' : 'none'}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={isFav ? 0 : 2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          {!iconOnly && (
            <span className={`ml-1 text-sm ${isFav ? 'text-red-500' : 'text-gray-500'}`}>
              {isFav ? 'Saved' : 'Save'}
            </span>
          )}
        </>
      )}
    </button>
  );
};

export default FavoriteButton;
