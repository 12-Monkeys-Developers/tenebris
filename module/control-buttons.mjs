/**
 * Menu spécifique au système
 */
export default function initControlButtons() {
  Hooks.on("getSceneControlButtons", (controls) => {
    controls.tenebris = {
      name: "tenebris",
      title: "Cthulhu Tenebris",
      icon: "tenebris",
      layer: "tenebris",
      tools: {
        fortune: {
          name: "fortune",
          title: game.i18n.localize("TENEBRIS.Fortune.title"),
          icon: "fa-solid fa-clover",
          button: true,
          onChange: (event, active) => {
            if (!foundry.applications.instances.has("tenebris-application-fortune")) game.system.applicationFortune.render(true)
          },
        },
        gmManager: {
          name: "gmManager",
          title: game.i18n.localize("TENEBRIS.Manager.title"),
          icon: "fa-solid fa-users",
          button: true,
          visible: game.user.isGM,
          onChange: (event, active) => {
            if (!foundry.applications.instances.has("tenebris-application-manager")) game.system.applicationManager.render(true)
          },
        },
      },
    }
  })
}
