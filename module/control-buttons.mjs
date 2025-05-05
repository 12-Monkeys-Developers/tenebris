/**
 * Menu spécifique au système
 */
export function initControlButtons() {
  Hooks.on("getSceneControlButtons", (controls) => {
    const menu = {
      name: "tenebris",
      title: "Cthulhu Tenebris",
      icon: "tenebris",
      tools: {
        fortune: {
          name: "fortune",
          title: game.i18n.localize("TENEBRIS.Fortune.title"),
          icon: "fa-solid fa-clover",
          toggle: true,
          onChange: (_event, toggled) => {
            if (!foundry.applications.instances.has("tenebris-application-fortune")) {
              game.system.applicationFortune.render(true)
            } else game.system.applicationFortune.close()
          },
        },
        gmManager: {
          name: "gmManager",
          title: game.i18n.localize("TENEBRIS.Manager.title"),
          icon: "fa-solid fa-users",
          toggle: true,
          visible: game.user.isGM,
          onChange: (_event, toggled) => {
            if (!foundry.applications.instances.has("tenebris-application-manager")) {
              game.system.applicationManager.render(true)
            } else game.system.applicationManager.close()
          },
        },
      },
    }

    controls.tenebris = menu
  })
}
