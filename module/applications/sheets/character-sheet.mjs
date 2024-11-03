import TenebrisActorSheet from "./base-actor-sheet.mjs"
import { ROLL_TYPE } from "../../config/system.mjs"

export default class TenebrisCharacterSheet extends TenebrisActorSheet {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["character"],
    position: {
      width: "auto",
      height: 780,
    },
    window: {
      contentClasses: ["character-content"],
    },
    actions: {
      deleteVoieMajeure: TenebrisCharacterSheet.#onDeleteVoieMajeure,
      deleteVoieMineure: TenebrisCharacterSheet.#onDeleteVoieMineure,
      createEquipment: TenebrisCharacterSheet.#onCreateEquipment,
    },
  }

  /** @override */
  static PARTS = {
    main: {
      template: "systems/tenebris/templates/character-main.hbs",
    },
    tabs: {
      template: "templates/generic/tab-navigation.hbs",
    },
    items: {
      template: "systems/tenebris/templates/character-items.hbs",
    },
    biography: {
      template: "systems/tenebris/templates/character-biography.hbs",
    },
  }

  /** @override */
  tabGroups = {
    sheet: "items",
  }

  /**
   * Prepare an array of form header tabs.
   * @returns {Record<string, Partial<ApplicationTab>>}
   */
  #getTabs() {
    const tabs = {
      items: { id: "items", group: "sheet", icon: "fa-solid fa-shapes", label: "TENEBRIS.Character.Label.details" },
      biography: { id: "biography", group: "sheet", icon: "fa-solid fa-book", label: "TENEBRIS.Character.Label.biography" },
    }
    for (const v of Object.values(tabs)) {
      v.active = this.tabGroups[v.group] === v.id
      v.cssClass = v.active ? "active" : ""
    }
    return tabs
  }

  /** @override */
  async _prepareContext() {
    const context = await super._prepareContext()
    context.tabs = this.#getTabs()

    context.tooltipsCaracteristiques = {
      rob: this._generateTooltip("save", "rob"),
      dex: this._generateTooltip("save", "dex"),
      int: this._generateTooltip("save", "int"),
      per: this._generateTooltip("save", "per"),
      vol: this._generateTooltip("save", "vol"),
      dmax: this._generateTooltip("other", "dmax"),
    }

    context.tooltipsRessources = {
      san: this._generateTooltip("resource", "san"),
      oeil: this._generateTooltip("resource", "oeil"),
      verbe: this._generateTooltip("resource", "verbe"),
      bourse: this._generateTooltip("resource", "bourse"),
      magie: this._generateTooltip("resource", "magie"),
    }

    context.rollType = {
      saveRob: {
        action: "roll",
        rollType: "save",
        rollTarget: "rob",
        tooltip: this._generateTooltip("save", "rob"),
      },
      saveDex: {
        action: "roll",
        rollType: "save",
        rollTarget: "dex",
        tooltip: this._generateTooltip("save", "dex"),
      },
      saveInt: {
        action: "roll",
        rollType: "save",
        rollTarget: "int",
        tooltip: this._generateTooltip("save", "int"),
      },
      savePer: {
        action: "roll",
        rollType: "save",
        rollTarget: "per",
        tooltip: this._generateTooltip("save", "per"),
        drag: true,
      },
      saveVol: {
        action: "roll",
        rollType: "save",
        rollTarget: "vol",
        tooltip: this._generateTooltip("save", "vol"),
        drag: true,
      },
      resourceSan: {
        action: "roll",
        rollType: "resource",
        rollTarget: "san",
        tooltip: this._generateTooltip("resource", "san"),
        drag: true,
      },
      resourceOeil: {
        action: "roll",
        rollType: "resource",
        rollTarget: "oeil",
        tooltip: this._generateTooltip("resource", "oeil"),
        drag: true,
      },
      resourceVerbe: {
        action: "roll",
        rollType: "resource",
        rollTarget: "verbe",
        tooltip: this._generateTooltip("resource", "verbe"),
        drag: true,
      },
      resourceBourse: {
        action: "roll",
        rollType: "resource",
        rollTarget: "bourse",
        tooltip: this._generateTooltip("resource", "bourse"),
        drag: true,
      },
      resourceMagie: {
        action: "roll",
        rollType: "resource",
        rollTarget: "magie",
        tooltip: this._generateTooltip("resource", "magie"),
        drag: true,
      },
    }
    return context
  }

  _generateTooltip(type, target) {
    if (type === ROLL_TYPE.SAVE) {
      const progres = this.document.system.caracteristiques[target].progression.progres
        ? game.i18n.localize("TENEBRIS.Label.hasProgressed")
        : game.i18n.localize("TENEBRIS.Label.noProgress")
      return `${game.i18n.localize("TENEBRIS.Label.experience")} : ${this.document.system.caracteristiques[target].progression.experience} <br> ${progres}`
    } else if (type === ROLL_TYPE.RESOURCE) {
      return `${game.i18n.localize("TENEBRIS.Label.maximum")} : ${this.document.system.ressources[target].max} <br> ${game.i18n.localize("TENEBRIS.Label.experience")} : ${this.document.system.ressources[target].experience}`
    } else if (type === "other") {
      return `${game.i18n.localize("TENEBRIS.Label.experience")} : ${this.document.system.dmax.experience}`
    }
  }

  /** @override */
  async _preparePartContext(partId, context) {
    const doc = this.document
    switch (partId) {
      case "main":
        context.enrichedBiens = await TextEditor.enrichHTML(doc.system.biens, { async: true })
        break
      case "items":
        context.tab = context.tabs.items
        const talents = await this._prepareTalents()
        context.talents = talents
        context.talentsAppris = talents.filter((talent) => talent.appris)
        context.weapons = doc.itemTypes.weapon
        context.armors = doc.itemTypes.armor
        context.spells = doc.itemTypes.spell
        context.hasSpells = context.spells.length > 0
        break
      case "biography":
        context.tab = context.tabs.biography
        context.enrichedDescription = await TextEditor.enrichHTML(doc.system.description, { async: true })
        context.enrichedLangues = await TextEditor.enrichHTML(doc.system.langues, { async: true })
        context.enrichedNotes = await TextEditor.enrichHTML(doc.system.notes, { async: true })
        break
    }
    return context
  }

  /**
   * Prepares the talents for the character sheet.
   *
   * @returns {Array} An array of talents with their properties.
   */
  async _prepareTalents() {
    const talents = await Promise.all(
      this.document.itemTypes.talent.map(async (talent) => {
        const pathName = await talent.system.getPathName()
        return {
          id: talent.id,
          uuid: talent.uuid,
          name: talent.name,
          img: talent.img,
          path: `Obtenu par ${pathName}`,
          description: talent.system.improvedDescription,
          progression: talent.system.progression,
          niveau: talent.system.niveau,
          appris: talent.system.appris,
          details: talent.system.details,
        }
      }),
    )
    talents.sort((a, b) => b.appris - a.appris || a.name.localeCompare(b.name, game.i18n.lang))
    return talents
  }

  // #region Drag-and-Drop Workflow

  /**
   * Callback actions which occur when a dragged element is dropped on a target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  async _onDrop(event) {
    if (!this.isEditable || !this.isEditMode) return
    const data = TextEditor.getDragEventData(event)

    // Handle different data types
    switch (data.type) {
      case "Item":
        const item = await fromUuid(data.uuid)
        if (!["path", "weapon", "armor", "spell"].includes(item.type)) return
        if (item.type === "path") return this.#onDropPathItem(item)
        if (item.type === "weapon") return super._onDropItem(item)
        if (item.type === "armor") return this._onDropItem(item)
        if (item.type === "spell") return this._onDropItem(item)
    }
  }

  async #onDropPathItem(item) {
    await this.document.addPath(item)
  }

  // #endregion

  // #region Actions

  /**
   * Suppression de la voie majeure
   * @param {Event} event             The initiating click event.
   * @param {HTMLElement} target      The current target of the event listener.
   */
  static async #onDeleteVoieMajeure(event, target) {
    const proceed = await foundry.applications.api.DialogV2.confirm({
      content: game.i18n.localize("TENEBRIS.Dialog.suppressionTalents"),
      rejectClose: false,
      modal: true,
    })
    if (!proceed) return
    const path = this.document.items.get(this.document.system.voies.majeure.id)
    if (!path) return
    await this.document.deletePath(path, true)
  }

  /**
   * Suppression de la voie mineure
   * @param {Event} event             The initiating click event.
   * @param {HTMLElement} target      The current target of the event listener.
   */
  static async #onDeleteVoieMineure(event, target) {
    const proceed = await foundry.applications.api.DialogV2.confirm({
      content: game.i18n.localize("TENEBRIS.Dialog.suppressionTalents"),
      rejectClose: false,
      modal: true,
    })
    if (!proceed) return
    const path = this.document.items.get(this.document.system.voies.mineure.id)
    if (!path) return
    await this.document.deletePath(path, false)
  }

  /**
   * Creates a new attack item directly from the sheet and embeds it into the document.
   * @param {Event} event             The initiating click event.
   * @param {HTMLElement} target      The current target of the event listener.
   */
  static #onCreateEquipment(event, target) {
    // Création d'une armure
    if (event.shiftKey) {
      this.document.createEmbeddedDocuments("Item", [{ name: game.i18n.localize("TENEBRIS.Label.newArmor"), type: "armor" }])
    }
    // Création d'une arme
    else {
      this.document.createEmbeddedDocuments("Item", [{ name: game.i18n.localize("TENEBRIS.Label.newWeapon"), type: "weapon" }])
    }
  }

  /**
   * Handles the roll action triggered by user interaction.
   *
   * @param {PointerEvent} event The event object representing the user interaction.
   * @param {HTMLElement} target The target element that triggered the roll.
   *
   * @returns {Promise<void>} A promise that resolves when the roll action is complete.
   *
   * @throws {Error} Throws an error if the roll type is not recognized.
   *
   * @description This method checks the current mode (edit or not) and determines the type of roll
   * (save, resource, or damage) based on the target element's data attributes. It retrieves the
   * corresponding value from the document's system and performs the roll.
   */
  async _onRoll(event, target) {
    if (this.isEditMode) return
    // Jet de sauvegarde
    let elt = event.currentTarget.querySelector("input")
    // Jet de ressource
    if (!elt) elt = event.currentTarget.querySelector("select")
    // Jet de dégâts
    if (!elt) elt = event.currentTarget
    const rollType = elt.dataset.rollType
    let rollTarget
    switch (rollType) {
      case ROLL_TYPE.SAVE:
        rollTarget = elt.dataset.rollTarget
        break
      case ROLL_TYPE.RESOURCE:
        rollTarget = elt.dataset.rollTarget
        break
      case ROLL_TYPE.DAMAGE:
        rollTarget = elt.dataset.itemId
        break
      default:
        break
    }
    await this.document.system.roll(rollType, rollTarget)
  }
  // #endregion
}
