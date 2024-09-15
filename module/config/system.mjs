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

export const DICE_VALUES = ["0", "d4", "d6", "d8", "d10", "d12"]

export const ROLL_TYPE = Object.freeze({
  SAVE: "save",
  RESOURCE: "resource",
  DAMAGE: "damage",
  ATTACK: "attack",
})

export const MINOR_PATH = Object.freeze({
  epee: {
    onze: "rob",
    neuf: {
      main: "per",
      plume: "vol",
      livre: "int",
    },
  },
  main: {
    onze: "dex",
    neuf: {
      chene: "rob",
      plume: "vol",
      livre: "int",
    },
  },
  plume: {
    onze: "int",
    neuf: {
      chene: "rob",
      main: "per",
      epee: "dex",
    },
  },
  chene: {
    onze: "per",
    neuf: {
      plume: "int",
      livre: "int",
      epee: "dex",
    },
  },
  livre: {
    onze: "vol",
    neuf: {
      chene: "rob",
      main: "per",
      epee: "dex",
    },
  },
})

export const ASCII = `
 ██████ ████████ ██   ██ ██    ██ ██      ██   ██ ██    ██     ████████ ███████ ███    ██ ███████ ██████  ██████  ██ ███████ 
██         ██    ██   ██ ██    ██ ██      ██   ██ ██    ██        ██    ██      ████   ██ ██      ██   ██ ██   ██ ██ ██      
██         ██    ███████ ██    ██ ██      ███████ ██    ██        ██    █████   ██ ██  ██ █████   ██████  ██████  ██ ███████ 
██         ██    ██   ██ ██    ██ ██      ██   ██ ██    ██        ██    ██      ██  ██ ██ ██      ██   ██ ██   ██ ██      ██ 
 ██████    ██    ██   ██  ██████  ███████ ██   ██  ██████         ██    ███████ ██   ████ ███████ ██████  ██   ██ ██ ███████ `

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
  ASCII,
}
