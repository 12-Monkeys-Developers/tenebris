import TenebrisFortune from "./applications/fortune.mjs"
import TenebrisManager from "./applications/manager.mjs"
/**
 * Menu spécifique au système
 */
export function initControlButtons() {
  CONFIG.Canvas.layers.tenebris = { layerClass: ControlsLayer, group: "primary" }

  Hooks.on("getSceneControlButtons", (btns) => {
    let menu = []

    menu.push({
      name: "fortune",
      title: game.i18n.localize("TENEBRIS.Fortune.title"),
      icon: "fa-solid fa-clover",
      button: true,
      onClick: () => {
        game.system.applicationFortune.render(true)
      },
    })

    if (game.user.isGM) {
      menu.push({
        name: "gm-manager",
        title: game.i18n.localize("TENEBRIS.Manager.title"),
        icon: "fa-solid fa-users",
        button: true,
        onClick: () => {
          game.system.applicationManager.render(true)
        },
      })
    }

    btns.push({
      name: "tenebris",
      title: "Cthulhu Tenebris",
      icon: "tenebris",
      layer: "tenebris",
      tools: menu,
    })
  })
}
