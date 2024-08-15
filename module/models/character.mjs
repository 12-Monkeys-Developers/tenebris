import { SYSTEM } from "../config/system.mjs"

export default class TenebrisCharacterData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    const schema = {}

    schema.description = new fields.HTMLField({
      required: false,
      blank: true,
      initial: "",
      textSearch: true,
    })

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
        progression: new fields.SchemaField({
          rectangle: new fields.NumberField({
            required: true,
            nullable: false,
            integer: true,
            initial: 0,
            min: 0,
          }),
          rond: new fields.BooleanField({ initial: false }),
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
          nullable: false,
          initial: SYSTEM.RESOURCE_VALUE.ZERO,
          choices: Object.fromEntries(Object.entries(SYSTEM.RESOURCE_VALUE).map(([key, value]) => [value, { label: `${value}` }])),
          blank: true,
        }),
        max: new fields.StringField({
          required: true,
          nullable: false,
          initial: SYSTEM.RESOURCE_VALUE.ZERO,
          choices: Object.fromEntries(Object.entries(SYSTEM.RESOURCE_VALUE).map(([key, value]) => [value, { label: `${value}` }])),
          blank: true,
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

    schema.commanditaire = new fields.StringField({
      required: false,
      nullable: true,
    })

    schema.dv = new fields.StringField({
      required: true,
      nullable: false,
      initial: SYSTEM.RESOURCE_VALUE.ZERO,
      choices: Object.fromEntries(Object.entries(SYSTEM.RESOURCE_VALUE).map(([key, value]) => [value, { label: `${value}` }])),
    })

    schema.pv = new fields.SchemaField({
      valeur: new fields.NumberField({
        required: true,
        nullable: false,
        initial: 10,
        min: 0,
      }),
      max: new fields.NumberField({
        required: true,
        nullable: false,
        integer: true,
        initial: 10,
      }),
    })

    schema.dmax = new fields.StringField({
      required: true,
      nullable: false,
      initial: SYSTEM.RESOURCE_VALUE.ZERO,
      choices: Object.fromEntries(Object.entries(SYSTEM.RESOURCE_VALUE).map(([key, value]) => [value, { label: `${value}` }])),
    })

    schema.voies = new fields.SchemaField({
      majeure: new fields.StringField({
        required: true,
        nullable: false,
      }),
      mineure: new fields.StringField({
        required: false,
        nullable: true,
      }),
    })

    return schema
  }

  /** @override */
  static LOCALIZATION_PREFIXES = ["TENEBRIS.Character"]
  
}
