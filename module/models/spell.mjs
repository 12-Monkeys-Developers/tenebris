import { SYSTEM } from "../config/system.mjs"
export default class TenebrisSpell extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    const requiredInteger = { required: true, nullable: false, integer: true }
    const schema = {}

    schema.description = new fields.HTMLField({
      required: false,
      blank: true,
      initial: "",
      textSearch: true,
    })

    schema.preparation = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 })
    schema.cible = new fields.StringField({ required: true })
    schema.portee = new fields.StringField({ required: true, initial: "contact", choices: SYSTEM.SPELL_RANGE })
    schema.duree = new fields.StringField({ required: true })
    schema.consequenceA = new fields.StringField({ required: true })
    schema.consequenceB = new fields.StringField({ required: true })

    return schema
  }

  /** @override */
  static LOCALIZATION_PREFIXES = ["TENEBRIS.Spell"]
}
