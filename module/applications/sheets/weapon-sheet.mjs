import TenebrisItemSheet from "./base-item-sheet.mjs"

export default class TenebrisWeaponSheet extends TenebrisItemSheet {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["weapon"],
    position: {
      width: 400,
    },
    window: {
      contentClasses: ["weapon-content"],
    },
  }

  /** @override */
  static PARTS = {
    main: {
      template: "systems/tenebris/templates/weapon.hbs",
    },
  }
}
