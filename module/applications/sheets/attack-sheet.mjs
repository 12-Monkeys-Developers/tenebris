import TenebrisItemSheet from "./base-item-sheet.mjs"

export default class TenebrisAttackSheet extends TenebrisItemSheet {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["attack"],
    position: {
      width: 600,
    },
    window: {
      contentClasses: ["attack-content"],
    },
  }

  /** @override */
  static PARTS = {
    main: {
      template: "systems/tenebris/templates/attack.hbs",
    },
  }

  /** @override */
  async _prepareContext() {
    const context = await super._prepareContext()
    console.log("attack context", context)
    return context
  }
}
