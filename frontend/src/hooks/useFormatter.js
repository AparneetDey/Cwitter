const useFormatter = () => {
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric"
        });
    };

    const formatNumber = (number) => {
        if (number < 1000) {
            return number.toString();
        }
    
        if (number < 1_000_000) {
            return `${(number / 1000).toFixed(1)}K`;
        }
    
        if (number < 1_000_000_000) {
            return `${(number / 1_000_000).toFixed(1)}M`;
        }
    
        return `${(number / 1_000_000_000).toFixed(1)}B`;
    };

    const formatTimeAgo = (date) => {
        const now = new Date();
        const createdAt = new Date(date);
    
        const diffInSeconds = Math.floor((now - createdAt) / 1000);
    
        if (diffInSeconds < 60) {
            return "now";
        }
    
        const diffInMinutes = Math.floor(diffInSeconds / 60);
    
        if (diffInMinutes < 60) {
            return `${diffInMinutes}m`;
        }
    
        const diffInHours = Math.floor(diffInMinutes / 60);
    
        if (diffInHours < 24) {
            return `${diffInHours}h`;
        }
    
        const diffInDays = Math.floor(diffInHours / 24);
    
        if (diffInDays < 7) {
            return `${diffInDays}d`;
        }
    
        const diffInWeeks = Math.floor(diffInDays / 7);
    
        if (diffInWeeks < 4) {
            return `${diffInWeeks}w`;
        }
    
        const diffInMonths = Math.floor(diffInDays / 30);
    
        if (diffInMonths < 12) {
            return `${diffInMonths}mo`;
        }
    
        const diffInYears = Math.floor(diffInDays / 365);
    
        return `${diffInYears}y`;
    };

    return {
        formatDate,
        formatNumber,
        formatTimeAgo
    }
}

export default useFormatter