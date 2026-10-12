import React from 'react';

/**
 * Announcement Bar — shows a configurable promotion or shipping message.
 * In production, fetch the message from the Settings API.
 * Set `message` to null/empty to hide.
 */
const AnnouncementBar = ({
  message = 'Free shipping on orders above ₹999 across India · Genuine handpicked products',
}) => {
  if (!message) return null;
  return (
    <div className="sds-announcement-bar" role="banner" aria-label="Announcement">
      {message}
    </div>
  );
};

export default AnnouncementBar;
