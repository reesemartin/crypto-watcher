export function percentChange(a, b) {
  if ( !(a > 0) || !(b > 0) ) {
    return 0 // bad data
  }

  return b / a - 1
}

export function toDecimalPlaces(number, places) {
  number = Number(number)
  if ( places !== 0 && (!places || isNaN(places) || places < 0) ) return number
  return Math.floor(number * Math.pow(10, places)) / Math.pow(10, places)
}

export function toDecimalPlacesString(number, places) {
  if ( places !== 0 && (!places || isNaN(places) || places < 0) ) return String(number)
  return toDecimalPlaces(number, places).toFixed(places)
}