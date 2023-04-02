// Create a function for the pluralization rules for the Dutch language

function nlPluralization(n) {
  return n === 1 ? 0 : 1;
}

export default { nl: nlPluralization };
