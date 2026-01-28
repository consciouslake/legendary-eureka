import React, { useState, useEffect } from 'react';
import { apiUrl } from '../../config';
import axios from 'axios';

const ChatNotification = ({ userType, userId }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    
    useEffect(() => {
        if (userId) {
            // Fetch unread messages on component mount
            fetchUnreadCount();
            
            // Set up interval to check for new messages
            const interval = setInterval(fetchUnreadCount, 30000); // Check every 30 seconds
            
            // Clean up interval on unmount
            return () => clearInterval(interval);
        }
    }, [userId]);
    
    // Fetch unread notification count from API
    const fetchUnreadCount = async () => {
        try {
            const response = await axios.get(`${apiUrl}/chat-users/${userType}/${userId}/`);
            
            if (response.data.status === 'success') {
                // Calculate total unread count from all conversations
                const totalUnread = response.data.data.reduce((total, user) => total + user.unread_count, 0);
                setUnreadCount(totalUnread);
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };
    
    // If no unread messages, don't render anything
    if (unreadCount === 0) return null;
    
    return (
        <span className="badge bg-danger rounded-pill ms-2">{unreadCount}</span>
    );
};

export default ChatNotification;