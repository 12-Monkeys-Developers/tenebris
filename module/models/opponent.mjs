import TenebrisRoll from "../documents/roll.mjs"
import { ROLL_TYPE } from "../config/system.mjs"

export default class TenebrisOpponent extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    const requiredInteger = { required: true, nullable: false, integer: true }
    const schema = {}

    schema.dv = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 })
    schema.pv = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
    })
    schema.armure = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 })
    schema.malus = new fields.NumberField({ ...requiredInteger, initial: 0, max: 0 })
    schema.actions = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 })
    schema.description = new fields.HTMLField({ required: true, textSearch: true })
    // Attaques : embedded items of type Attack

    return schema
  }

  /** @override */
  static LOCALIZATION_PREFIXES = ["TENEBRIS.Opponent"]

  /**
   * Rolls a dice attack for an opponent.
   * @param {number} rollTarget The name of the attack
   * @param {number} rollValue The dice to roll.
   * @returns {Promise<null>} - A promise that resolves to null if the roll is cancelled.
   */
  async roll(rollValue, rollTarget) {
    let roll = await TenebrisRoll.prompt({
      rollType: ROLL_TYPE.ATTACK,
      rollValue,
      rollTarget,
      actorId: this.parent.id,
      actorName: this.parent.name,
      actorImage: this.parent.img,
    })
    if (!roll) return null
    await roll.toMessage({}, { rollMode: roll.options.rollMode })
  }
}
