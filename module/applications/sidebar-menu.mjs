const { HandlebarsApplicationMixin } = foundry.applications.api
const { AbstractSidebarTab } = foundry.applications.sidebar

export default class TenebrisSidebarMenu extends HandlebarsApplicationMixin(AbstractSidebarTab) {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    window: {
      title: "TENEBRIS.Sidebar.title",
    },
    actions: {
      openApp: TenebrisSidebarMenu.#onOpenApp,
    },
  }

  /** @override */
  static tabName = "tenebris"

  /** @override */
  static PARTS = {
    tenebris: {
      template: "systems/tenebris/templates/sidebar-menu.hbs",
      root: true, // Permet d'avoir plusieurs sections dans le hbs
    },
  }

  static async #onOpenApp(event) {
    switch (event.target.dataset.app) {
      case "gmmanager":
        if (!foundry.applications.instances.has("tenebris-application-manager")) game.system.applicationManager.render({ force: true })
        break
      case "fortune":
        if (!foundry.applications.instances.has("tenebris-application-fortune")) game.system.applicationFortune.render({ force: true })
        break
    }
  }

  /** @inheritDoc */
  async _prepareContext(options) {
    const context = await super._prepareContext(options)
    return Object.assign(context, {
      version: `Version ${game.system.version}`,
    })
  }
}
