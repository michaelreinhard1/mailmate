function nlPluralization(n) {
  return n === 1 ? 0 : 1;
}

function enPluralization(n) {
  return n === 1 ? 0 : 1;
}

export default { nl: nlPluralization, en: enPluralization };
