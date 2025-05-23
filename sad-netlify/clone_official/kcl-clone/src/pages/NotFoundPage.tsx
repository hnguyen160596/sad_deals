import type React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full p-6">
    <h1 className="text-4xl font-uniforma mb-4">404 - Page Not Found</h1>
    <Link to="/" className="text-secondary hover:underline">Go back home</Link>
  </div>
);

export default NotFoundPage;
