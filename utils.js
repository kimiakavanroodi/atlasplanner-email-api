const splitDashestoSpaces = (name) => {
  var amendedStr = "";
  var str = name.split(/[-]+/);
  str.map((word) => {
    amendedStr +=
      word.substring(0, 1).toUpperCase() + word.substring(1, word.length) + " ";
  });

  return amendedStr;
};


module.exports.splitDashestoSpaces = splitDashestoSpaces;