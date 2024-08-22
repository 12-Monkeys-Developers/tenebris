import { SYSTEM } from "../config/system.mjs"

export default class TenebrisArmor extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    const schema = {}

    schema.description = new fields.HTMLField({
      required: false,
      blank: true,
      initial: "",
      textSearch: true,
    })

    schema.categorie = new fields.StringField({ required: true, initial: "sommaire", choices: SYSTEM.ARMOR_CATEGORY })

    schema.valeur = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 })

    schema.malus = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 })

    return schema
  }

  /** @override */
  static LOCALIZATION_PREFIXES = ["TENEBRIS.Armor"]
}
