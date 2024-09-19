import { DICE_VALUES } from "./config/system.mjs"

export default class TenebrisUtils {
  // Return the maximum damage limited by the maximum damage of the character
  static maxDamage(damage, damageMax) {
    const damageIndex = DICE_VALUES.indexOf(damage)
    const damageMaxIndex = DICE_VALUES.indexOf(damageMax)

    // If damage exceeds damageMax, return damageMax
    if (damageIndex > damageMaxIndex) {
      return damageMax
    }

    // Otherwise, return damage (as it is less than or equal to damageMax)
    return damage
  }

  static findLowerDice(dice) {
    let index = DICE_VALUES.indexOf(dice)
    return DICE_VALUES[index - 1]
  }
}
