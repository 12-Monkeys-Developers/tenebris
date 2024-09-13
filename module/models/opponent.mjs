import { SYSTEM } from "../config/system.mjs"

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
}
