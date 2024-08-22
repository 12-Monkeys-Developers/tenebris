import TenebrisItemSheet from "./base-item-sheet.mjs"

export default class TenebrisPathSheet extends TenebrisItemSheet {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["path"],
    position: {
      width: 1400,
    },
    window: {
      contentClasses: ["path-content"],
    },
    dragDrop: [{ dragSelector: "[data-drag]", dropSelector: null }],
    actions: {
      edit: TenebrisPathSheet.#onTalentEdit,
      delete: TenebrisPathSheet.#onTalentDelete,
    },
  }

  /** @override */
  static PARTS = {
    header: {
      template: "systems/tenebris/templates/path-header.hbs",
    },
    tabs: {
      template: "templates/generic/tab-navigation.hbs",
    },
    main: {
      template: "systems/tenebris/templates/path-main.hbs",
    },
    talents: {
      template: "systems/tenebris/templates/path-talents.hbs",
    },
  }

  /** @override */
  tabGroups = {
    sheet: "main",
  }

  /**
   * Prepare an array of form header tabs.
   * @returns {Record<string, Partial<ApplicationTab>>}
   */
  #getTabs() {
    const tabs = {
      main: { id: "main", group: "sheet", icon: "fa-solid fa-user", label: "TENEBRIS.Label.profil" },
      talents: { id: "talents", group: "sheet", icon: "fa-solid fa-book", label: "TENEBRIS.Label.talents" },
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

    console.log("path context", context)
    return context
  }

  /** @override */
  async _preparePartContext(partId, context) {
    const doc = this.document
    switch (partId) {
      case "main":
        context.tab = context.tabs.main
        context.enrichedBiens = await TextEditor.enrichHTML(this.document.system.biens, { async: true })
        context.enrichedLangues = await TextEditor.enrichHTML(this.document.system.langues, { async: true })
        break
      case "talents":
        context.tab = context.tabs.talents
        const talentItems = []
        for (const talent of this.item.system.talents) {
          const talentItem = await fromUuid(talent)
          if (talentItem) talentItems.push(talentItem)
        }

        context.talents = talentItems
        context.talents.sort((a, b) => a.name.localeCompare(b.name, game.i18n.lang))

        break
    }
    return context
  }

  /**
   * Callback actions which occur when a dragged element is dropped on a target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  async _onDrop(event) {
    const data = TextEditor.getDragEventData(event)

    switch (data.type) {
      case "Item":
        if (this.isPlayMode) return
        const item = await fromUuid(data.uuid)
        if (item.type !== "talent") return

        console.log("dropped item", item)
        const talents = this.item.toObject().system.talents
        talents.push(item.uuid)
        this.item.update({ "system.talents": talents })
    }
  }

  // #region Actions

  /**
   * Edit an existing talent within the path item
   * Use the uuid to display the talent sheet (from world or compendium)
   * @param {PointerEvent} event The originating click event
   * @param {HTMLElement} target the capturing HTML element which defined a [data-action]
   */
  static async #onTalentEdit(event, target) {
    const itemUuid = target.getAttribute("data-item-uuid")
    const talent = await fromUuid(itemUuid)
    talent.sheet.render(true)
  }

  /**
   * Delete an existing talent within the path item
   * Use the uuid to remove it form the array of talents
   * @param {PointerEvent} event The originating click event
   * @param {HTMLElement} target the capturing HTML element which defined a [data-action]
   */
  static async #onTalentDelete(event, target) {
    const itemUuid = target.getAttribute("data-item-uuid")

    const talents = this.item.toObject().system.talents
    const index = talents.indexOf(itemUuid)
    talents.splice(index, 1)
    this.item.update({ "system.talents": talents })
  }

  // #endregion
}
