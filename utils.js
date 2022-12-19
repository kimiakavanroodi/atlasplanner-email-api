const moment = require("moment")

const splitDashestoSpaces = (name) => {
  var amendedStr = "";
  var str = name.split(/[-]+/);
  str.map((word) => {
    amendedStr +=
      word.substring(0, 1).toUpperCase() + word.substring(1, word.length) + " ";
  });

  return amendedStr;
};

const formatTimeSlot = (startTime, endTime) => {
  const startMonthTime = moment(startTime).format("MMMM DD, YYYY");
  const endMonthTime = moment(endTime).format("MMMM DD, YYYY");

  const format = "MMMM DD, YYYY hh:mma";

  if (startMonthTime === endMonthTime) {
    return `${moment(startTime).format("MMMM DD, YYYY")} at ${moment(
      startTime
    ).format("hh:mma")}-${moment(endTime).format("hh:mma")}`;
  }

  return `${moment(startTime).format(format)}-${moment(endTime).format(
    format
  )}`;
};

module.exports = { splitDashestoSpaces, formatTimeSlot };
