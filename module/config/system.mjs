import * as CHARACTER from "./character.mjs"

export const SYSTEM_ID = "tenebris"

export const RESOURCE_VALUE = Object.freeze({
  ZERO: "0",
  D4: "d4",
  D6: "d6",
  D8: "d8",
  D10: "d10",
  D12: "d12",
})

/**
 * Include all constant definitions within the SYSTEM global export
 * @type {Object}
 */
export const SYSTEM = {
  id: SYSTEM_ID,
  CHARACTERISTICS: CHARACTER.CHARACTERISTICS,
  RESOURCES: CHARACTER.RESOURCES,
  RESOURCE_VALUE,
}
