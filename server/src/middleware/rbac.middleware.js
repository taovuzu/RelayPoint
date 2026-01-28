// Role-Based Access Control middleware
// in future work
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    next();
  };
};

