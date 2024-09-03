export default class TenebrisTalent extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    const requiredInteger = { required: true, nullable: false, integer: true }
    const schema = {}

    schema.description = new fields.HTMLField({ required: true, textSearch: true })

    schema.appris = new fields.BooleanField()
    schema.progression = new fields.BooleanField()
    schema.niveau = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 3 })

    return schema
  }

  /** @override */
  static LOCALIZATION_PREFIXES = ["TENEBRIS.Talent"]

  get canProgress() {
    return this.progression
  }

  get isLearned() {
    return this.appris
  }

  get details() {
    return this.description
  }
}
