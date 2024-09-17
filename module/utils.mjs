import { DICE_VALUE } from "./config/system.mjs"

export default class TenebrisUtils {
  // Return the maximum damage limited by the maximum damage of the character
  static maxDamage(damage, damageMax) {
    const diceOrder = [DICE_VALUE.D4, DICE_VALUE.D6, DICE_VALUE.D8, DICE_VALUE.D10, DICE_VALUE.D12]

    const damageIndex = diceOrder.indexOf(damage)
    const damageMaxIndex = diceOrder.indexOf(damageMax)

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
