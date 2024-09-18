import TenebrisItemSheet from "./base-item-sheet.mjs"

export default class TenebrisTalentSheet extends TenebrisItemSheet {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["talent"],
    position: {
      width: 600,
    },
    window: {
      contentClasses: ["talent-content"],
    },
  }

  /** @override */
  static PARTS = {
    main: {
      template: "systems/tenebris/templates/talent.hbs",
    },
  }

  /** @override */
  async _prepareContext() {
    const context = await super._prepareContext()
    context.enrichedDescription = await TextEditor.enrichHTML(this.document.system.improvedDescription, { async: true })
    context.canProgress = this.document.system.canProgress
    console.log("talent context", context)
    return context
  }
}
