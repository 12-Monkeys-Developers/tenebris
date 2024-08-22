import TenebrisItemSheet from "./base-item-sheet.mjs"

export default class TenebrisArmorSheet extends TenebrisItemSheet {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["armor"],
    position: {
      width: 400,
    },
    window: {
      contentClasses: ["armor-content"],
    },
  }

  /** @override */
  static PARTS = {
    main: {
      template: "systems/tenebris/templates/armor.hbs",
    },
  }

  /** @override */
  async _prepareContext() {
    const context = await super._prepareContext()

    console.log("Armor sheet context", context)
    return context
  }
}
