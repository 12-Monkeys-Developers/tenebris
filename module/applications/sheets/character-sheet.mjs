const { HandlebarsApplicationMixin } = foundry.applications.api

export default class TenebrisCharacterSheet extends HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2) {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["tenebris", "actor", "character"],
    position: {
      width: 1000,
      height: 900,
    },
    form: {
      submitOnChange: true,
    },
    window: {
      resizable: true,
    },
  }

  /** @override */
  static PARTS = {
    main: {
      template: "systems/tenebris/templates/character-main.hbs",
    },
  }

  /** @override */
  async _prepareContext() {
    const context = {
      fields: this.document.schema.fields,
      systemFields: this.document.system.schema.fields,
      actor: this.document,
      system: this.document.system,
      source: this.document.toObject(),
    }
    console.log("character context", context)
    return context
  }
}
