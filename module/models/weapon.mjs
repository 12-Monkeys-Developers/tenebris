import { SYSTEM } from "../config/system.mjs"
export default class TenebrisWeapon extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    const schema = {}

    schema.description = new fields.HTMLField({ required: true, textSearch: true })
    schema.categorie = new fields.StringField({ required: true, initial: "mains", choices: SYSTEM.WEAPON_CATEGORY })
    schema.degats = new fields.StringField({
      required: true,
      initial: SYSTEM.WEAPON_DAMAGE.UN,
      choices: Object.fromEntries(Object.entries(SYSTEM.WEAPON_DAMAGE).map(([key, value]) => [value, { label: `${value}` }])),
    })
    return schema
  }

  /** @override */
  static LOCALIZATION_PREFIXES = ["TENEBRIS.Weapon"]
}
