import { SYSTEM } from "../config/system.mjs"
export default class TenebrisPath extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    const schema = {}

    schema.key = new fields.StringField({ required: true, nullable: false, initial: "" })

    // Caractéristiques
    const characteristicField = (label) => {
      const schema = {
        valeur: new fields.NumberField({
          required: true,
          nullable: false,
          integer: true,
          initial: 10,
          min: 0,
        }),
      }
      return new fields.SchemaField(schema, { label })
    }

    schema.caracteristiques = new fields.SchemaField(
      Object.values(SYSTEM.CHARACTERISTICS).reduce((obj, characteristic) => {
        obj[characteristic.id] = characteristicField(characteristic.label)
        return obj
      }, {}),
    )

    // Ressources
    const resourceField = (label) => {
      const schema = {
        valeur: new fields.StringField({
          required: true,
          initial: SYSTEM.RESOURCE_VALUE.ZERO,
          choices: Object.fromEntries(Object.entries(SYSTEM.RESOURCE_VALUE).map(([key, value]) => [value, { label: `${value}` }])),
        }),
      }
      return new fields.SchemaField(schema, { label })
    }

    schema.ressources = new fields.SchemaField(
      Object.values(SYSTEM.RESOURCES).reduce((obj, resource) => {
        obj[resource.id] = resourceField(resource.label)
        return obj
      }, {}),
    )

    schema.dv = new fields.StringField({
      required: true,
      initial: SYSTEM.RESOURCE_VALUE.ZERO,
      choices: Object.fromEntries(Object.entries(SYSTEM.RESOURCE_VALUE).map(([key, value]) => [value, { label: `${value}` }])),
    })

    schema.dmax = new fields.StringField({
      required: true,
      initial: SYSTEM.RESOURCE_VALUE.ZERO,
      choices: Object.fromEntries(Object.entries(SYSTEM.RESOURCE_VALUE).map(([key, value]) => [value, { label: `${value}` }])),
    })

    schema.description = new fields.HTMLField({ required: true, textSearch: true })

    schema.biens = new fields.HTMLField({ required: true, textSearch: true })

    schema.langues = new fields.HTMLField({ required: true, textSearch: true })

    schema.talents = new fields.ArrayField(new fields.DocumentUUIDField())

    return schema
  }

  /** @override */
  static LOCALIZATION_PREFIXES = ["TENEBRIS.Path"]

  async getAllTalents() {
    const talents = []
    this.talents.forEach(async (element) => {
      const talent = await fromUuid(element)
      if (talent) talents.push(talent)
    })
    return talents
  }
}
