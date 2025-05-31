import TenebrisItemSheet from "./base-item-sheet.mjs"

export default class TenebrisSpellSheet extends TenebrisItemSheet {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["spell"],
    position: {
      width: 500,
    },
    window: {
      contentClasses: ["spell-content"],
    },
  }

  /** @override */
  static PARTS = {
    main: {
      template: "systems/tenebris/templates/spell.hbs",
    },
  }
}
