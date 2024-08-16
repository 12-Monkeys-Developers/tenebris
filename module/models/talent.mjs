export default class TenebrisTalentData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    const schema = {}

    schema.description = new fields.HTMLField({
      required: false,
      blank: true,
      initial: "",
      textSearch: true,
    })

    schema.progression = new fields.BooleanField()
    schema.niveau = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 1, min: 1, max: 3 })

    return schema
  }

  /** @override */
  static LOCALIZATION_PREFIXES = ["TENEBRIS.Talent"]

  get canProgress() {
    return this.progression
  }

  get details() {
    return this.description
  }
}
