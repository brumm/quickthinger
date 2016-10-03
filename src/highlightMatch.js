import { match } from 'fuzzaldrin-plus'

var highlight_open_tag = "<strong>";
var highlight_close_tag = "</strong>";

export default function highlightMatch(str, query) {
  var matchPositions = match(str, query);
  if (!matchPositions || matchPositions.length == 0) return str;
  var output = "";
  var matchIndex = -1;
  var strPos = 0;
  while (++matchIndex < matchPositions.length) {
    var matchPos = matchPositions[matchIndex];
    // Get text before the current match position
    if (matchPos > strPos) {
      output += str.substring(strPos, matchPos);
      strPos = matchPos
    }
    // Get consecutive positions from the array
    while (++matchIndex < matchPositions.length) {
      if (matchPositions[matchIndex] == matchPos + 1) {
        matchPos++;
      }
      else {
        matchIndex--;
        break;
      }
    }
    //Get text inside the match, including current
    matchPos++;
    if (matchPos > strPos) {
      output += highlight_open_tag;
      output += str.substring(strPos, matchPos);
      output += highlight_close_tag;
      strPos = matchPos
    }
  }
  output += str.substring(strPos);
  return output
}
