import TenebrisItemSheet from "./base-item-sheet.mjs"

export default class TenebrisTalentSheet extends TenebrisItemSheet {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["talent"],
    position: {
      width: 600,
      height: 800,
    },
    window: {
      contentClasses: ["talent-content"],
    },
  }

  /** @override */
  static PARTS = {
    main: {
      template: "systems/tenebris/templates/talent-main.hbs",
    },
  }

  /** @override */
  async _prepareContext() {
    const context = await super._prepareContext()
    context.canProgress = this.document.system.canProgress
    console.log("item context", context)
    return context
  }
}
