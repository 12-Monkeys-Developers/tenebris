import { ROLL_TYPE, SYSTEM } from "../config/system.mjs"
import TenebrisRoll from "../documents/roll.mjs"
import TenebrisUtils from "../utils.mjs"

export default class TenebrisCharacter extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    const requiredInteger = { required: true, nullable: false, integer: true }
    const schema = {}

    schema.description = new fields.HTMLField({ required: true, textSearch: true })
    schema.langues = new fields.HTMLField({ required: true, textSearch: true })
    schema.notes = new fields.HTMLField({ required: true, textSearch: true })
    schema.biens = new fields.HTMLField({ required: true, textSearch: true })

    // Caractéristiques
    const characteristicField = (label) => {
      const schema = {
        valeur: new fields.NumberField({ ...requiredInteger, initial: 10, min: 0 }),
        progression: new fields.SchemaField({
          experience: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
          progres: new fields.BooleanField(),
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
        experience: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      }
      return new fields.SchemaField(schema, { label })
    }

    schema.ressources = new fields.SchemaField(
      Object.values(SYSTEM.RESOURCES).reduce((obj, resource) => {
        obj[resource.id] = resourceField(resource.label)
        return obj
      }, {}),
    )

    schema.commanditaire = new fields.StringField({})

    schema.dv = new fields.StringField({
      required: true,
      nullable: false,
      initial: SYSTEM.RESOURCE_VALUE.ZERO,
      choices: Object.fromEntries(Object.entries(SYSTEM.RESOURCE_VALUE).map(([key, value]) => [value, { label: `${value}` }])),
    })

    schema.pv = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
    })

    schema.dmax = new fields.SchemaField({
      valeur: new fields.StringField({
        required: true,
        nullable: false,
        initial: SYSTEM.RESOURCE_VALUE.ZERO,
        choices: Object.fromEntries(Object.entries(SYSTEM.RESOURCE_VALUE).map(([key, value]) => [value, { label: `${value}` }])),
      }),
      experience: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
    })

    schema.voies = new fields.SchemaField({
      majeure: new fields.SchemaField({
        id: new fields.DocumentIdField(),
        key: new fields.StringField({ required: true }),
        nom: new fields.StringField({ required: true }),
      }),
      mineure: new fields.SchemaField({
        id: new fields.DocumentIdField(),
        key: new fields.StringField({ required: true }),
        nom: new fields.StringField({ required: true }),
      }),
    })

    return schema
  }

  /** @override */
  static LOCALIZATION_PREFIXES = ["TENEBRIS.Character"]

  get hasVoieMajeure() {
    return !!this.voies.majeure.id
  }

  get hasVoieMineure() {
    return !!this.voies.mineure.id
  }

  /**
   * Rolls a dice for a character.
   * @param {("save"|"resource|damage")} rollType The type of the roll.
   * @param {number} rollTarget The target value for the roll. Which caracteristic or resource. If the roll is a damage roll, this is the id of the item.
   * @param {number} rollValue The value of the roll. If the roll is a damage roll, this is the dice to roll.
   * @param {Token} opponentTarget The target of the roll : used for save rolls to get the oppponent's malus.
   * @returns {Promise<null>} - A promise that resolves to null if the roll is cancelled.
   */
  async roll(rollType, rollTarget, rollValue, opponentTarget = undefined) {
    const hasTarget = opponentTarget !== undefined
    let roll = await TenebrisRoll.prompt({
      rollType,
      rollTarget,
      rollValue,
      actorId: this.parent.id,
      actorName: this.parent.name,
      actorImage: this.parent.img,
      hasTarget,
      target: opponentTarget,
    })
    if (!roll) return null

    // Perte de ressouces
    if (rollType === ROLL_TYPE.RESOURCE && roll.resultType === "failure") {
      const value = this.ressources[rollTarget].valeur
      const newValue = TenebrisUtils.findLowerDice(value)
      await this.parent.update({ [`system.ressources.${rollTarget}.valeur`]: newValue })
    }
    await roll.toMessage({}, { rollMode: roll.options.rollMode })
  }
}
