import { ROLL_TYPE } from "../config/system.mjs"
import TenebrisUtils from "../utils.mjs"

export default class TenebrisRoll extends Roll {
  /**
   * The HTML template path used to render dice checks of this type
   * @type {string}
   */
  static CHAT_TEMPLATE = "systems/tenebris/templates/standard-roll.hbs"

  get type() {
    return this.options.type
  }

  get isSave() {
    return this.type === ROLL_TYPE.SAVE
  }

  get isResource() {
    return this.type === ROLL_TYPE.RESOURCE
  }

  get isDamage() {
    return this.type === ROLL_TYPE.DAMAGE
  }

  get target() {
    return this.options.target
  }

  get value() {
    return this.options.value
  }

  get treshold() {
    return this.options.treshold
  }

  get actorId() {
    return this.options.actorId
  }

  get actorName() {
    return this.options.actorName
  }

  get actorImage() {
    return this.options.actorImage
  }

  get introText() {
    return this.options.introText
  }

  get introTextTooltip() {
    return this.options.introTextTooltip
  }

  get aide() {
    return this.options.aide
  }

  get gene() {
    return this.options.gene
  }

  get modificateur() {
    return this.options.modificateur
  }

  get avantages() {
    return this.options.avantages
  }

  get resultType() {
    return this.options.resultType
  }

  get isFailure() {
    return this.resultType === "failure"
  }

  get hasTarget() {
    return this.options.hasTarget
  }

  get targetName() {
    return this.options.targetName
  }

  get targetArmor() {
    return this.options.targetArmor
  }

  /**
   * Generates introductory text based on the roll type.
   *
   * @returns {string} The formatted introductory text for the roll.
   */
  _createIntroText() {
    let text

    switch (this.type) {
      case ROLL_TYPE.SAVE:
        const saveLabel = game.i18n.localize(`TENEBRIS.Character.FIELDS.caracteristiques.${this.target}.valeur.label`)
        text = game.i18n.format("TENEBRIS.Roll.save", { save: saveLabel })
        text = text.concat("<br>").concat(`Seuil : ${this.treshold}`)
        break
      case ROLL_TYPE.RESOURCE:
        const resourceLabel = game.i18n.localize(`TENEBRIS.Character.FIELDS.ressources.${this.target}.valeur.label`)
        text = game.i18n.format("TENEBRIS.Roll.resource", { resource: resourceLabel })
        break
      case ROLL_TYPE.DAMAGE:
        const damageLabel = game.actors.get(this.actorId).items.get(this.target).name
        text = game.i18n.format("TENEBRIS.Roll.damage", { item: damageLabel })
        break
      case ROLL_TYPE.ATTACK:
        const attackLabel = this.target
        text = game.i18n.format("TENEBRIS.Roll.attack", { item: attackLabel })
        break
    }
    return text
  }

  /**
   * Generates an introductory text tooltip with characteristics and modifiers.
   *
   * @returns {string} A formatted string containing the value, help, hindrance, and modifier.
   */
  _createIntroTextTooltip() {
    let tooltip = game.i18n.format("TENEBRIS.Tooltip.saveIntroTextTooltip", { value: this.value, aide: this.aide, gene: this.gene, modificateur: this.modificateur })
    if (this.hasTarget) {
      tooltip = tooltip.concat(`<br>Cible : ${this.targetName}`)
    }
    return tooltip
  }

  /**
   * Asynchronously prompts the user with a dialog to perform a roll.
   * @param {Object} options The options for the prompt.
   * @returns {Promise} - A promise that resolves with the result of the roll.
   */
  static async prompt(options = {}) {
    let formula = options.rollValue

    // Formula for a resource roll
    if (options.rollType === ROLL_TYPE.RESOURCE) {
      let ressource = game.i18n.localize(`TENEBRIS.Character.FIELDS.ressources.${options.rollTarget}.valeur.label`)
      if (formula === "0" || formula === "") {
        ui.notifications.warn(game.i18n.format("TENEBRIS.Warnings.plusDeRessource", { ressource: ressource }))
        return null
      }
    }

    const rollModes = Object.fromEntries(Object.entries(CONFIG.Dice.rollModes).map(([key, value]) => [key, game.i18n.localize(value)]))
    const fieldRollMode = new foundry.data.fields.StringField({
      choices: rollModes,
      blank: false,
      default: "public",
    })

    const choiceAide = foundry.utils.mergeObject({ 0: "0" }, this.value <= 10 ? { 1: "1" } : { 1: "1", 2: "2" })
    const choiceGene = {
      0: "0",
      "-1": "-1",
      "-2": "-2",
      "-3": "-3",
      "-4": "-4",
      "-5": "-5",
      "-6": "-6",
      "-7": "-7",
      "-8": "-8",
      "-9": "-9",
      "-10": "-10",
    }
    const choiceAvantage = { normal: "Normal", avantage: "Avantage", desavantage: "Désavantage", doubleAvantage: "Double avantage", doubleDesavantage: "Double désavantage" }
    const choiceModificateur = {
      0: "0",
      "-1": "-1",
      "-2": "-2",
      "-3": "-3",
      "-4": "-4",
      "-5": "-5",
      "-6": "-6",
      "-7": "-7",
      "-8": "-8",
      "-9": "-9",
      "-10": "-10",
    }

    let damageDice
    let damageDiceMax
    let damageDiceFinal
    let damageDiceLowered

    // Damage roll : check the roll is not above the maximum damage
    if (options.rollType === ROLL_TYPE.DAMAGE) {
      damageDice = options.rollValue
      damageDiceMax = game.actors.get(options.actorId).system.dmax.valeur
      damageDiceFinal = TenebrisUtils.maxDamage(damageDice, damageDiceMax)
      damageDiceLowered = damageDiceFinal !== damageDice
    }

    if (options.rollType === ROLL_TYPE.ATTACK) {
      damageDice = options.rollValue
    }

    let malus = "0"
    let targetName
    let targetArmor
    if (options.rollType === ROLL_TYPE.SAVE && options.hasTarget && options.target.actor.type === "opponent") {
      targetName = options.target.actor.name
      malus = options.target.actor.system.malus.toString()
    }

    if (options.rollType === ROLL_TYPE.DAMAGE && options.hasTarget && options.target.actor.type === "opponent") {
      targetName = options.target.actor.name
      targetArmor = options.target.actor.system.armure.toString()
    }

    let dialogContext = {
      isSave: options.rollType === ROLL_TYPE.SAVE,
      isResource: options.rollType === ROLL_TYPE.RESOURCE,
      isDamage: options.rollType === ROLL_TYPE.DAMAGE,
      isAttack: options.rollType === ROLL_TYPE.ATTACK,
      rollModes,
      fieldRollMode,
      choiceAide,
      choiceGene,
      choiceAvantage,
      choiceModificateur,
      damageDice,
      damageDiceMax,
      damageDiceFinal,
      damageDiceLowered,
      formula,
      hasTarget: options.hasTarget,
      malus,
      targetName,
      targetArmor,
    }
    const content = await renderTemplate("systems/tenebris/templates/roll-dialog.hbs", dialogContext)

    const title = TenebrisRoll.createTitle(options.rollType)
    const label = game.i18n.localize("TENEBRIS.Label.roll")
    const rollContext = await foundry.applications.api.DialogV2.prompt({
      window: { title: title },
      classes: ["tenebris"],
      content,
      ok: {
        label: label,
        callback: (event, button, dialog) => {
          const output = Array.from(button.form.elements).reduce((obj, input) => {
            if (input.name) obj[input.name] = input.value
            return obj
          }, {})
          console.log("output", output)
          // Avantages
          switch (output.avantages) {
            case "1":
              output.avantages = "doubleDesavantage"
              break
            case "2":
              output.avantages = "desavantage"
              break
            case "3":
              output.avantages = "normal"
              break
            case "4":
              output.avantages = "avantage"
              break
            case "5":
              output.avantages = "doubleAvantage"
              break
          }
          return output
        },
      },
      rejectClose: false, // Click on Close button will not launch an error
    })

    // If the user cancels the dialog, exit
    if (rollContext === null) return

    let treshold

    if (options.rollType === ROLL_TYPE.SAVE) {
      const aide = rollContext.aide === "" ? 0 : parseInt(rollContext.aide, 10)
      const gene = rollContext.gene === "" ? 0 : parseInt(rollContext.gene, 10)
      const modificateur = rollContext.modificateur === "" ? 0 : parseInt(rollContext.modificateur, 10)

      if (options.rollType === ROLL_TYPE.SAVE) {
        let dice = "1d20"
        switch (rollContext.avantages) {
          case "avantage":
            dice = "2d20kl"
            break
          case "desavantage":
            dice = "2d20kh"
            break
          case "doubleAvantage":
            dice = "3d20kl"
            break
          case "doubleDesavantage":
            dice = "3d20kh"
            break
        }
        formula = `${dice}`
      }

      treshold = options.rollValue + aide + gene + modificateur
    }

    // Formula for a damage roll
    if (options.rollType === ROLL_TYPE.DAMAGE) {
      formula = damageDiceFinal
    }

    // Formula for an attack roll
    if (options.rollType === ROLL_TYPE.ATTACK) {
      formula = damageDice
    }

    const roll = new this(formula, options.data, {
      type: options.rollType,
      target: options.rollTarget,
      value: options.rollValue,
      treshold: treshold,
      actorId: options.actorId,
      actorName: options.actorName,
      actorImage: options.actorImage,
      rollMode: rollContext.visibility,
      hasTarget: options.hasTarget,
      targetName,
      targetArmor,
      ...rollContext,
    })

    await roll.evaluate()

    let resultType
    if (options.rollType === ROLL_TYPE.SAVE) {
      resultType = roll.total <= treshold ? "success" : "failure"
    } else if (options.rollType === ROLL_TYPE.RESOURCE) {
      resultType = roll.total === 1 || roll.total === 2 ? "failure" : "success"
    }

    roll.options.resultType = resultType
    roll.options.treshold = treshold
    roll.options.introText = roll._createIntroText()
    roll.options.introTextTooltip = roll._createIntroTextTooltip()
    return roll
  }

  /**
   * Creates a title based on the given type.
   *
   * @param {string} type - The type of the roll.
   * @returns {string} The generated title.
   */
  static createTitle(type) {
    switch (type) {
      case ROLL_TYPE.SAVE:
        return game.i18n.localize("TENEBRIS.Dialog.titleSave")
      case ROLL_TYPE.RESOURCE:
        return game.i18n.localize("TENEBRIS.Dialog.titleResource")
      case ROLL_TYPE.DAMAGE:
        return game.i18n.localize("TENEBRIS.Dialog.titleDamage")
      case ROLL_TYPE.ATTACK:
        return game.i18n.localize("TENEBRIS.Dialog.titleAttack")
      default:
        return game.i18n.localize("TENEBRIS.Dialog.titleStandard")
    }
  }

  async toMessage(messageData = {}, { rollMode, create = true } = {}) {
    super.toMessage(
      {
        isSave: this.isSave,
        isResource: this.isResource,
        isDamage: this.isDamage,
        isFailure: this.resultType === "failure",
        avantages: this.avantages,
        introText: this.introText,
        introTextTooltip: this.introTextTooltip,
        actingCharName: this.actorName,
        actingCharImg: this.actorImage,
        hasTarget: this.hasTarget,
        targetName: this.targetName,
        targetArmor: this.targetArmor,
        ...messageData,
      },
      { rollMode: rollMode },
    )
  }
}
