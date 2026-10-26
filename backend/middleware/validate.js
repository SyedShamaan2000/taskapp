const validate = (schema, property) => (req, res, next) => {
  const { error, value } = schema.validate(req[property], {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid request data",
    });
  }

  if (property === "query") {
    req.validatedQuery = value;
  } else {
    req[property] = value;
  }

  return next();
};

module.exports = validate;
