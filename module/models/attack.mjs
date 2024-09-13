export default class Tenebris extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    const schema = {}

    schema.description = new fields.HTMLField({ required: true, textSearch: true })
    schema.degats = new fields.StringField({ required: true, nullable: false, initial: "1d4", blank: false })

    return schema
  }

  /** @override */
  static LOCALIZATION_PREFIXES = ["TENEBRIS.Attack"]
}
