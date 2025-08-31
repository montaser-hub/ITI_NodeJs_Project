import AppError from "../Utils/appError.js";
const allowedFilterFields = [
  "age",
  "name",
  "email",
  "isConfirmed",
  "active",
  "role",
  "userId",
  "totalPrice",
  "titleCart",
  "price",
  "quantity",
  "categoryId",
  "addedBy"
]; // Add valid filter fields

const allowedOperators = ["gte", "gt", "lte", "lt", "in", "ne"];

// Function for filtering
const filterQuery = (queryString) => {
  const queryObject = { ...queryString };
  const excludedFields = ["page", "sort", "limit", "all"];
  excludedFields.forEach((field) => delete queryObject[field]);

  // Validate allowed filter fields and remove undefined or null values
  Object.keys(queryObject).forEach((key) => {
    const value = queryObject[key];

    // Skip fields that are undefined or null
    if (value === undefined || value === null || value === "") {
      delete queryObject[key]; // Remove from query if value is invalid
      return;
    }

    // Validate allowed filter fields
    if (!allowedFilterFields.includes(key) && !key.includes("__")) {
      throw new AppError(`Invalid filter field: ${key}`);
    }
  });

  // Advanced filtering (e.g., gte, lt, in)
  let queryStr = JSON.stringify(queryObject);
  queryStr = queryStr.replace(/\b(gte|gt|lt|lte|in|ne)\b/g, (match) => {
    if (!allowedOperators.includes(match)) {
      throw new AppError(`Invalid filter operator: ${match}`);
    }
    return `$${match}`; // MongoDB operator syntax
  });

  const parsed = JSON.parse(queryStr);

  // Sanitize values (e.g., "$in": ["null"] → [null])
  const sanitizeInValues = (obj) => {
    Object.entries(obj).forEach(([key, val]) => {
      if (val?.$in) {
        const inValues = Array.isArray(val.$in) ? val.$in : [val.$in];
        obj[key].$in = inValues.map((v) =>
          v === "null" ? null : v === "undefined" ? undefined : v
        );
      }
    });
  };

  sanitizeInValues(parsed);

  return parsed;
};

// Function for sorting
const sortQuery = (queryString) => {
  if (!queryString) return "-createdAt";
  if (queryString.sort && queryString.sort.trim()) {
    return queryString.sort.split(",").join(" ");
  }
  return "-createdAt"; // Default sort field
};
// Function for pagination
const paginateQuery = (queryString) => {
  if (!queryString || queryString.all) {
    return { page: 1, skip: 0, limit: 0 }; // This tells the DB: no pagination
  }
  const page = parseInt(queryString.page) || 1; // Default to page 1
  const limit = parseInt(queryString.limit) || 100; // Default to 100 items per page
  const skip = (page - 1) * limit;

  return { page, skip, limit };
};

export { filterQuery, sortQuery, paginateQuery };
