var url = require("url");

exports.fullUrl = req => {
  return url.format({
    // protocol: req.protocol,
    // host: req.get("host"),
    pathname: req.baseUrl + req.route.path
  });
};
