import TenebrisItemSheet from "./base-item-sheet.mjs"

export default class TenebrisPathSheet extends TenebrisItemSheet {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["path"],
    position: {
      width: 800,
      height: 1000,
    },
    window: {
      contentClasses: ["path-content"],
    },
  }

  /** @override */
  static PARTS = {
    main: {
      template: "systems/tenebris/templates/path-main.hbs",
    },
  }

  /** @override */
  async _prepareContext() {
    const context = await super._prepareContext()
    context.enrichedBiens = await TextEditor.enrichHTML(this.document.system.biens, { async: true })
    context.enrichedLangues = await TextEditor.enrichHTML(this.document.system.langues, { async: true })

    console.log("path context", context)
    return context
  }
}
