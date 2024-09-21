import { ROLL_TYPE } from "../config/system.mjs"
import TenebrisUtils from "../utils.mjs"

export default class TenebrisRoll extends Roll {
  /**
   * The HTML template path used to render dice checks of this type
   * @type {string}
   */
  static CHAT_TEMPLATE = "systems/tenebris/templates/chat-message.hbs"

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

  get targetMalus() {
    return this.options.targetMalus
  }

  get realDamage() {
    return this.options.realDamage
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
  /**
   * Prompt the user with a dialog to configure and execute a roll.
   *
   * @param {Object} options - Configuration options for the roll.
   * @param {string} options.rollType - The type of roll being performed (e.g., RESOURCE, DAMAGE, ATTACK, SAVE).
   * @param {string} options.rollValue - The initial value or formula for the roll.
   * @param {string} options.rollTarget - The target of the roll.
   * @param {string} options.actorId - The ID of the actor performing the roll.
   * @param {string} options.actorName - The name of the actor performing the roll.
   * @param {string} options.actorImage - The image of the actor performing the roll.
   * @param {boolean} options.hasTarget - Whether the roll has a target.
   * @param {Object} options.target - The target of the roll, if any.
   * @param {Object} options.data - Additional data for the roll.
   *
   * @returns {Promise<Object|null>} The roll result or null if the dialog was cancelled.
   */
  static async prompt(options = {}) {
    let formula = options.rollValue

    // Formula for a resource roll
    if (options.rollType === ROLL_TYPE.RESOURCE) {
      let ressource = game.i18n.localize(`TENEBRIS.Character.FIELDS.ressources.${options.rollTarget}.valeur.label`)
      if (formula === "0" || formula === "") {
        ui.notifications.warn(game.i18n.format("TENEBRIS.Warning.plusDeRessource", { ressource: ressource }))
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
    let targetMalus = "0"
    let targetName
    let targetArmor
    const displayOpponentMalus = game.settings.get("tenebris", "displayOpponentMalus")

    if (options.rollType === ROLL_TYPE.SAVE && options.hasTarget && options.target.actor.type === "opponent") {
      targetName = options.target.actor.name
      if (displayOpponentMalus) malus = options.target.actor.system.malus.toString()
      else targetMalus = options.target.actor.system.malus.toString()
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

    const rollData = {
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
      targetMalus,
      ...rollContext,
    }

    /**
     * A hook event that fires before the roll is made.
     * @function tenebris.preRoll
     * @memberof hookEvents
     * @param {Object} options          Options for the roll.
     * @param {Object} rollData         All data related to the roll.
     * @returns {boolean}               Explicitly return `false` to prevent roll to be made.
     */
    if (Hooks.call("tenebris.preRoll", options, rollData) === false) return

    const roll = new this(formula, options.data, rollData)

    await roll.evaluate()

    let resultType
    if (options.rollType === ROLL_TYPE.SAVE) {
      resultType = roll.total <= treshold ? "success" : "failure"
    } else if (options.rollType === ROLL_TYPE.RESOURCE) {
      resultType = roll.total === 1 || roll.total === 2 ? "failure" : "success"
    }

    let realDamage
    if (options.rollType === ROLL_TYPE.DAMAGE) {
      realDamage = Math.max(0, roll.total - parseInt(targetArmor, 10))
    }

    roll.options.resultType = resultType
    roll.options.treshold = treshold
    roll.options.introText = roll._createIntroText()
    roll.options.introTextTooltip = roll._createIntroTextTooltip()
    roll.options.realDamage = realDamage

    /**
     * A hook event that fires after the roll has been made.
     * @function tenebris.Roll
     * @memberof hookEvents
     * @param {Object} options          Options for the roll.
     * @param {Object} rollData         All data related to the roll.
      @param {TenebrisRoll} roll        The resulting roll.
     * @returns {boolean}               Explicitly return `false` to prevent roll to be made.
     */
    if (Hooks.call("tenebris.Roll", options, rollData, roll) === false) return

    return roll
  }

  /**
   * Creates a title based on the given type.
   *
   * @param {string} type The type of the roll.
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

  /** @override */
  async render(chatOptions = {}) {
    let chatData = await this._getChatCardData(chatOptions.isPrivate)
    return await renderTemplate(this.constructor.CHAT_TEMPLATE, chatData)
  }

  /**
   * Generates the data required for rendering a roll chat card.
   *
   * @param {boolean} isPrivate - Indicates if the chat card is private.
   * @returns {Promise<Object>} A promise that resolves to an object containing the chat card data.
   * @property {Array<string>} css - CSS classes for the chat card.
   * @property {Object} data - The data associated with the roll.
   * @property {number} diceTotal - The total value of the dice rolled.
   * @property {boolean} isGM - Indicates if the user is a Game Master.
   * @property {string} formula - The formula used for the roll.
   * @property {number} total - The total result of the roll.
   * @property {boolean} isSave - Indicates if the roll is a saving throw.
   * @property {boolean} isResource - Indicates if the roll is related to a resource.
   * @property {boolean} isDamage - Indicates if the roll is for damage.
   * @property {boolean} isFailure - Indicates if the roll is a failure.
   * @property {Array} avantages - Advantages associated with the roll.
   * @property {string} actorId - The ID of the actor performing the roll.
   * @property {string} actingCharName - The name of the character performing the roll.
   * @property {string} actingCharImg - The image of the character performing the roll.
   * @property {string} introText - Introductory text for the roll.
   * @property {string} introTextTooltip - Tooltip for the introductory text.
   * @property {string} resultType - The type of result (e.g., success, failure).
   * @property {boolean} hasTarget - Indicates if the roll has a target.
   * @property {string} targetName - The name of the target.
   * @property {number} targetArmor - The armor value of the target.
   * @property {number} realDamage - The real damage dealt.
   * @property {boolean} isPrivate - Indicates if the chat card is private.
   * @property {string} cssClass - The combined CSS classes as a single string.
   * @property {string} tooltip - The tooltip text for the chat card.
   */
  async _getChatCardData(isPrivate) {
    const cardData = {
      css: [SYSTEM.id, "dice-roll"],
      data: this.data,
      diceTotal: this.dice.reduce((t, d) => t + d.total, 0),
      isGM: game.user.isGM,
      formula: this.formula,
      total: this.total,
      isSave: this.isSave,
      isResource: this.isResource,
      isDamage: this.isDamage,
      isFailure: this.isFailure,
      avantages: this.avantages,
      actorId: this.actorId,
      actingCharName: this.actorName,
      actingCharImg: this.actorImage,
      introText: this.introText,
      introTextTooltip: this.introTextTooltip,
      resultType: this.resultType,
      hasTarget: this.hasTarget,
      targetName: this.targetName,
      targetArmor: this.targetArmor,
      realDamage: this.realDamage,
      isPrivate: isPrivate,
    }
    cardData.cssClass = cardData.css.join(" ")
    cardData.tooltip = isPrivate ? "" : await this.getTooltip()
    return cardData
  }

  /**
   * Converts the roll result to a chat message.
   *
   * @param {Object} [messageData={}] - Additional data to include in the message.
   * @param {Object} options - Options for message creation.
   * @param {string} options.rollMode - The mode of the roll (e.g., public, private).
   * @param {boolean} [options.create=true] - Whether to create the message.
   * @returns {Promise} - A promise that resolves when the message is created.
   */
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
        targetMalus: this.targetMalus,
        realDamage: this.realDamage,
        ...messageData,
      },
      { rollMode: rollMode },
    )
  }
}
