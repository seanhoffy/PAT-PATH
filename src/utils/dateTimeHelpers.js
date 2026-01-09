/**
 * Get the current date and time in PST timezone
 * @returns {string} Formatted date/time string (e.g., "January 15, 2024, 3:45 PM PST")
 */
export const getPSTDateTime = () => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Los_Angeles',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
    
    const formatted = formatter.format(now);
    return `${formatted} PST`;
};
