export const errorHandlerMiddleware = (err, req, res, next) => {
  console.log(err);
  const errorMessage = err.message || "Internal Server Error";
  const errorStatus = err.statusCode || 500;

  res.status(errorStatus).json({ message: errorMessage });
};
