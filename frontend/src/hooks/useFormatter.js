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

    return {
        formatDate,
        formatNumber
    }
}

export default useFormatter