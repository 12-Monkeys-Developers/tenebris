import * as CHARACTER from "./character.mjs"
import * as WEAPON from "./weapon.mjs"
import * as ARMOR from "./armor.mjs"
import * as SPELL from "./spell.mjs"

export const SYSTEM_ID = "tenebris"

export const RESOURCE_VALUE = Object.freeze({
  ZERO: "0",
  D4: "d4",
  D6: "d6",
  D8: "d8",
  D10: "d10",
  D12: "d12",
})

export const DICE_VALUE = Object.freeze({
  D4: "d4",
  D6: "d6",
  D8: "d8",
  D10: "d10",
  D12: "d12",
})

export const ROLL_TYPE = Object.freeze({
  SAVE: "save",
  RESOURCE: "resource",
  DAMAGE: "damage",
  ATTACK: "attack",
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
  WEAPON_CATEGORY: WEAPON.CATEGORY,
  WEAPON_DAMAGE: WEAPON.DAMAGE,
  ARMOR_CATEGORY: ARMOR.CATEGORY,
  SPELL_RANGE: SPELL.RANGE,
}
