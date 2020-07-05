let parseFilter = ({ sort, price, color, tags }) => {
  let sorts = [];
  let matches = [];
  if (sort) {
    switch (sort) {
      case "popular":
        sorts.push({ $sort: { reviewCount: 1 } });
        break;

      case "average_rating":
        sorts.push({ $sort: { averageReview: 1 } });
        break;

      case "old":
        sorts.push({ $sort: { "document.createdAt": 1 } });
        break;

      case "low_to_high":
        sorts.push({ $sort: { "document.price": 1 } });
        break;

      case "high_to_low":
        sorts.push({ $sort: { "document.price": -1 } });
        break;

      default:
        sorts.push({ $sort: { "document.createdAt": -1 } });
        break;
    }
  } else {
    sorts.push({ $sort: { "document.createdAt": -1 } });
  }

  if (price) {
    switch (price) {
      case "0-12000":
        matches.push({ $match: { "document.price": { $gt: 0, $lte: 12000 } } });
        break;

      case "12000-18000":
        matches.push({ $match: { "document.price": { $gt: 12000, $lte: 18000 } } });
        break;

      case "18000-23000":
        matches.push({ $match: { "document.price": { $gt: 18000, $lte: 23000 } } });
        break;

      case "23000+":
        matches.push({ $match: { "document.price": { $gt: 23000 } } });
        break;
    }
  }

  if (color) {
    switch (color) {
      case "blue":
        matches.push({ $match: { "document.colors.key": "blue" } });
        break;

      case "red":
        matches.push({ $match: { "document.colors.key": "red" } });
        break;

      case "brown":
        matches.push({ $match: { "document.colors.key": "brown" } });
        break;

      case "black":
        matches.push({ $match: { "document.colors.key": "black" } });
        break;
    }
  }

  if (tags && tags.length) {
    matches.push({ $match: { "document.tags": { $in: tags } } });
  }

  return { sorts, matches };
};

module.exports = { parseFilter };
