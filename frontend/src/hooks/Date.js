export const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric"
    });
};