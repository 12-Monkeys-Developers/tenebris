import { SYSTEM } from "../config/system.mjs"
export default class TenebrisSpell extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    const schema = {}

    schema.description = new fields.HTMLField({
      required: false,
      blank: true,
      initial: "",
      textSearch: true,
    })

    schema.preparation = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 })
    schema.cible = new fields.StringField({ required: true, nullable: false, initial: "" })
    schema.portee = new fields.StringField({ required: true, initial: "contact", choices: SYSTEM.SPELL_RANGE })
    schema.duree = new fields.StringField({ required: true, nullable: false, initial: "" })
    schema.consequenceA = new fields.StringField({ required: true, nullable: false, initial: "" })
    schema.consequenceB = new fields.StringField({ required: true, nullable: false, initial: "" })

    return schema
  }

  /** @override */
  static LOCALIZATION_PREFIXES = ["TENEBRIS.Spell"]
}
