import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Sparkles, Inbox } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { transformImageUrl } from '../../APi/utils';
import './NotificationBell.css';

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, loading } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const toggleDropdown = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await markAsRead(notif._id);
    }
    setIsOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    await markAsRead('all');
  };

  return (
    <div className="sds-notif-wrapper" ref={dropdownRef}>
      <button
        className="sds-nav-icon-btn sds-notif-bell-btn"
        onClick={toggleDropdown}
        aria-label={`Notifications (${unreadCount} unread)`}
        aria-expanded={isOpen}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="sds-notif-badge" aria-hidden="true">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="sds-notif-dropdown" role="region" aria-label="Notifications panel">
          {/* Header */}
          <div className="sds-notif-header">
            <div className="sds-notif-title-row">
              <h3 className="sds-notif-title">Notifications</h3>
              {unreadCount > 0 && (
                <span className="sds-notif-count-tag">{unreadCount} New</span>
              )}
            </div>
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="sds-notif-clear-btn"
                title="Mark all notifications as read"
              >
                <Check size={13} />
                <span>Mark All Read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="sds-notif-list">
            {loading && notifications.length === 0 ? (
              <div className="sds-notif-loading">
                <span className="sds-notif-spinner" />
                <span>Checking updates...</span>
              </div>
            ) : notifications.filter(n => !n.isRead).length === 0 ? (
              <div className="sds-notif-empty">
                <div className="sds-notif-empty-icon">
                  <Inbox size={28} color="#C5A15A" />
                </div>
                <h4>You're All Caught Up</h4>
                <p>New arrivals, order updates, and royal offers will appear here.</p>
              </div>
            ) : (
              notifications.filter(n => !n.isRead).map((notif) => (
                <div
                  key={notif._id}
                  className={`sds-notif-item ${!notif.isRead ? "unread" : ""}`}
                  onClick={() => handleNotificationClick(notif)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="sds-notif-avatar">
                    {notif.metadata?.image ? (
                      <img
                        src={transformImageUrl(notif.metadata.image)}
                        alt="notif"
                        className="sds-notif-img"
                      />
                    ) : (
                      <div className="sds-notif-icon-circle">
                        <Sparkles size={14} color="#C5A15A" />
                      </div>
                    )}
                    {!notif.isRead && <span className="sds-unread-dot" aria-hidden="true" />}
                  </div>

                  <div className="sds-notif-content-info">
                    <div className="sds-notif-meta-row">
                      <span className="sds-notif-type">{notif.type || "Collection"}</span>
                      <span className="sds-notif-time">
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <h4 className="sds-notif-item-title">{notif.title || "Shri Deepaalaya Silks Update"}</h4>
                    <p className="sds-notif-item-message">{notif.message || "A new update has been posted to your account."}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="sds-notif-footer">
            <button
              type="button"
              className="sds-notif-footer-link"
              onClick={() => {
                setIsOpen(false);
                navigate('/profile?tab=notifications');
              }}
            >
              View All in Account Profile →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
