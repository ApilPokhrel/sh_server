"use strict";

exports.notFound = (req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
};

exports.catchErrors = fn => {
  return function(req, res, next) {
    return fn(req, res, next).catch(next);
  };
};

exports.productionErrors = (err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500);
  res.json(errorRecog(err));
};

let errorRecog = err => {
  if (err.name === "MongoError" && err.code === 11000) {
    return {
      message: "Try different Name or EMail or Phone",
      status: err.status
    };
  } else if (err.name === "ValidationError") {
    let e = err.errors;
    let es = [];
    for (let key in e) {
      es.push(e[key].message);
      break;
    }
    return {
      message: es,
      status: err.status
    };
  } else {
    return {
      message: err.message || err,
      status: err.status
    };
  }
};
