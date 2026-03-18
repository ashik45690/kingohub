export const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
};

export const getStatusColor = (status) => {
    switch (status) {
        case 'published': return 'green';
        case 'draft': return 'orange';
        default: return 'blue';
    }
};
