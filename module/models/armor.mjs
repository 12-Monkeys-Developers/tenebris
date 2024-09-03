import { SYSTEM } from "../config/system.mjs"

export default class TenebrisArmor extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    const requiredInteger = { required: true, nullable: false, integer: true }
    const schema = {}

    schema.description = new fields.HTMLField({ required: true, textSearch: true })

    schema.categorie = new fields.StringField({ required: true, initial: "sommaire", choices: SYSTEM.ARMOR_CATEGORY })

    schema.valeur = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 })

    schema.malus = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 })

    return schema
  }

  /** @override */
  static LOCALIZATION_PREFIXES = ["TENEBRIS.Armor"]
}
