export const formatTime = (timeString) => {
    if (!timeString) return '';

    // If already in HH:MM format, return as is
    if (timeString.includes(':')) {
        return timeString;
    }

    // Otherwise, format from Date object
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return `${formatDate(dateString)} ${formatTime(dateString)}`;
};
