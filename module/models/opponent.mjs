import { SYSTEM } from "../config/system.mjs"

export default class TenebrisOpponent extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    const requiredInteger = { required: true, nullable: false, integer: true }
    const schema = {}

    schema.description = new fields.HTMLField({ required: true, textSearch: true })
    schema.dv = new fields.StringField({
      required: true,
      nullable: false,
      initial: SYSTEM.RESOURCE_VALUE.ZERO,
      choices: Object.fromEntries(Object.entries(SYSTEM.RESOURCE_VALUE).map(([key, value]) => [value, { label: `${value}` }])),
    })

    schema.pv = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
    })

    schema.armure = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 })
    schema.malus = new fields.NumberField({ ...requiredInteger, initial: 0, max: 0 })
    schema.actions = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 })

    // Attaques : embedded items of type Attack

    return schema
  }
}
