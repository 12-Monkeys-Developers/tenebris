export default class TenebrisRoll extends Roll {
  constructor(formula, data = {}, options = {}) {
    super(formula, data, options)
  }

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

  /**
   * Which Dialog subclass should display a prompt for this Roll type?
   * @type {StandardCheckDialog}
   */
  // static dialogClass = StandardRollDialog

  /* -------------------------------------------- */

  /**
   * The HTML template path used to render dice checks of this type
   * @type {string}
   */
  static CHAT_TEMPLATE = "systems/tenebris/templates/standard-roll.hbs"

  async toMessage(messageData = {}, { rollMode, create = true } = {}) {
    let title
    if (this.type === "save") {
      title = game.i18n.format("TENEBRIS.Roll.Save", { save: this.value })
    }
    if (this.type === "resource") {
      title = game.i18n.format("TENEBRIS.Roll.Resource", { resource: this.value })
    }
    super.toMessage({ flavor: title, ...messageData })
  }
}
