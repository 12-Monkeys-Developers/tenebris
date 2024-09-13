import TenebrisActorSheet from "./base-character-sheet.mjs"

export default class TenebrisOpponentSheet extends TenebrisActorSheet {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["opponent"],
    position: {
      width: 680,
      height: 480,
    },
    window: {
      contentClasses: ["opponent-content"],
    },
  }

  /** @override */
  static PARTS = {
    main: {
      template: "systems/tenebris/templates/opponent.hbs",
    },
  }

  /** @override */
  async _prepareContext() {
    const context = await super._prepareContext()

    console.log("Opponent sheet context", context)
    return context
  }
}
