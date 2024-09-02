import TenebrisDialog from "./dialog.mjs"
export default class TenebrisRoll extends Roll {
  constructor(formula, data = {}, options = {}) {
    super(formula, data, options)
    this.options.introText = this._createIntroText()
  }

  /**
   * The HTML template path used to render dice checks of this type
   * @type {string}
   */
  static CHAT_TEMPLATE = "systems/tenebris/templates/standard-roll.hbs"

  /**
   * Which Dialog subclass should display a prompt for this Roll type?
   * @type {StandardCheckDialog}
   */
  static dialogClass = TenebrisDialog

  /**
   * The type of this roll.
   * @type {string}
   */
  get type() {
    return this.options.type
  }

  get isSave() {
    return this.type === "save"
  }

  get isResource() {
    return this.type === "resource"
  }

  get value() {
    return this.options.value
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

  _createIntroText() {
    let text
    if (this.type === "save") {
      const label = game.i18n.localize(`TENEBRIS.Character.FIELDS.caracteristiques.${this.value}.valeur.label`)
      text = game.i18n.format("TENEBRIS.Roll.Save", { save: label })
    }
    if (this.type === "resource") {
      const label = game.i18n.localize(`TENEBRIS.Character.FIELDS.ressources.${this.value}.valeur.label`)
      text = game.i18n.format("TENEBRIS.Roll.Resource", { resource: label })
    }
    return text
  }

  /* -------------------------------------------- */
  async toMessage(messageData = {}, { rollMode, create = true } = {}) {
    super.toMessage({ introText: this.introText, actingCharName: this.actorName, actingCharImg: this.actorImage, ...messageData })
  }

  /**
   * Present a Dialog instance for this pool
   * @param {string} title      The title of the roll request
   * @param {string} flavor     Any flavor text attached to the roll
   * @param {string} rollMode   The requested roll mode
   * @returns {Promise<StandardCheck|null>}   The resolved check, or null if the dialog was closed
   */
  async dialog({ title, flavor, rollMode } = {}) {
    const options = { title, flavor, rollMode, roll: this }
    return this.constructor.dialogClass.prompt({ title, options })
  }
}
