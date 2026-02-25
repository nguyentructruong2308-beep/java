import API from './api';

const NotificationService = {
    getUnreadNotifications: async () => {
        return await API.get('/notifications/unread');
    },

    markAsRead: async (id) => {
        return await API.put(`/notifications/${id}/read`);
    }
};

export default NotificationService;
