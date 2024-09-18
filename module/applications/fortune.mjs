const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api

/**
 * An application for configuring the permissions which are available to each User role.
 * @extends ApplicationV2
 * @mixes HandlebarsApplication
 * @alias PermissionConfig
 */
export default class TenebrisFortune extends HandlebarsApplicationMixin(ApplicationV2) {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    id: "tenebris-fortune",
    tag: "form",
    window: {
      contentClasses: ["tenebris-fortune"],
      title: "Roue de fortune",
    },
    position: {
      width: 50,
      height: "auto",
    },
    form: {
      closeOnSubmit: true,
    },
  }

  /** @override */
  static PARTS = {
    main: {
      template: "systems/tenebris/templates/fortune.hbs",
    },
  }

  /* -------------------------------------------- */
  /*  Rendering                                   */
  /* -------------------------------------------- */

  /** @override */
  async _prepareContext(_options = {}) {
    return {
      fortune: 3,
    }
  }
}
