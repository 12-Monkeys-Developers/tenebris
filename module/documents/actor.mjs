import { MINOR_PATH } from "../config/system.mjs"
export default class TenebrisActor extends Actor {
  async _preCreate(data, options, user) {
    await super._preCreate(data, options, user)

    // Configure prototype token settings
    const prototypeToken = {}
    if (this.type === "character") {
      Object.assign(prototypeToken, {
        sight: { enabled: true },
        actorLink: true,
        disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY,
      })
      this.updateSource({ prototypeToken })
    }
  }

  /**
   * Adds a path to the character.
   * First path added is the major path, second path added is the minor path.
   * Create all talents of the path and add them to the character.
   * Add the path to the character.
   *
   * @param {Object} item The item to add as a path.
   * @returns {Promise<void>} - A promise that resolves when the path is added.
   */
  async addPath(item) {
    if (this.type !== "character") return
    let itemData = item.toObject()
    if (this.system.hasVoieMajeure && this.system.hasVoieMineure) {
      ui.notifications.warn(game.i18n.localize("TENEBRIS.Warnings.dejaDeuxVoies"))
      return
    }

    // Voie mineure
    if (this.system.hasVoieMajeure) {
      if (this.system.voies.majeure.nom === item.name) {
        ui.notifications.warn(game.i18n.localize("TENEBRIS.Warnings.dejaVoieMajeure"))
        return
      }

      let dropNotification
      let onze = MINOR_PATH[itemData.system.key].onze

      let voie
      if (onze) {
        const labelOnze = game.i18n.localize(`TENEBRIS.Character.FIELDS.caracteristiques.${onze}.valeur.label`)
        dropNotification = `La valeur de ${labelOnze} va être modifiée pour 11`
        const neuf = MINOR_PATH[itemData.system.key].neuf[this.system.voies.majeure.key]
        const labelNeuf = game.i18n.localize(`TENEBRIS.Character.FIELDS.caracteristiques.${neuf}.valeur.label`)
        dropNotification += ` <br> La valeur de ${labelNeuf} va être modifiée pour 9`

        const proceed = await foundry.applications.api.DialogV2.confirm({
          content: dropNotification,
          rejectClose: false,
          modal: true,
        })
        if (!proceed) return

        // Création de la voie
        voie = await this.createEmbeddedDocuments("Item", [itemData], { renderSheet: false })

        await this.update({
          "system.voies.mineure.nom": item.name,
          "system.voies.mineure.id": voie[0].id,
          "system.voies.mineure.key": item.system.key,
          [`system.caracteristiques.${onze}.valeur`]: 11,
          [`system.caracteristiques.${neuf}.valeur`]: 9,
        })
      }

      // Création des talents
      let newTalents = []
      for (const talent of itemData.system.talents) {
        const talentItem = await fromUuid(talent)
        if (talentItem) {
          const newTalent = await this.createEmbeddedDocuments("Item", [talentItem.toObject()])
          newTalents.push(newTalent[0].uuid)
        }
      }
      // Mise à jour de la voie avec les nouveaux talents
      await voie[0].update({ "system.talents": newTalents })

      return ui.notifications.info(game.i18n.localize("TENEBRIS.Warnings.voieMineureAjoutee"))
    }

    // Voie majeure
    else {
      const proceed = await foundry.applications.api.DialogV2.confirm({
        content: game.i18n.localize("TENEBRIS.Dialog.ajoutVoieMajeure"),
        rejectClose: false,
        modal: true,
      })
      if (!proceed) return

      // Création de la voie
      const voie = await this.createEmbeddedDocuments("Item", [itemData], { renderSheet: false })

      // Création des talents
      let newTalents = []
      for (const talent of itemData.system.talents) {
        const talentItem = await fromUuid(talent)
        if (talentItem) {
          const newTalent = await this.createEmbeddedDocuments("Item", [talentItem.toObject()])
          newTalents.push(newTalent[0].uuid)
        }
      }
      // Mise à jour de la voie avec les nouveaux talents
      await voie[0].update({ "system.talents": newTalents })

      await this.update({
        "system.voies.majeure.id": voie[0].id,
        "system.voies.majeure.nom": item.name,
        "system.voies.majeure.key": item.system.key,
        "system.caracteristiques.rob": item.system.caracteristiques.rob,
        "system.caracteristiques.dex": item.system.caracteristiques.dex,
        "system.caracteristiques.int": item.system.caracteristiques.int,
        "system.caracteristiques.per": item.system.caracteristiques.per,
        "system.caracteristiques.vol": item.system.caracteristiques.vol,
        "system.ressources.san": item.system.ressources.san,
        "system.ressources.oeil": item.system.ressources.oeil,
        "system.ressources.verbe": item.system.ressources.verbe,
        "system.ressources.bourse": item.system.ressources.bourse,
        "system.ressources.magie": item.system.ressources.magie,
        "system.dv": item.system.dv,
        "system.dmax.valeur": item.system.dmax,
        "system.langues": item.system.langues,
        "system.biens": item.system.biens,
      })
      return ui.notifications.info(game.i18n.localize("TENEBRIS.Warnings.voieMajeureAjoutee"))
    }
  }

  /**
   * Deletes a specified path and its associated talents.
   *
   * @param {Object} path The path object to be deleted.
   * @param {boolean} isMajor Indicates if the path is a major path, elswise it is a minor path.
   * @returns {Promise<void>} A promise that resolves when the deletion is complete.
   * @throws {Error} Throws an error if the type is not "character".
   */
  async deletePath(path, isMajor) {
    if (this.type !== "character") return

    // Delete all talents linked to the path
    let toDelete = path.system.talents.map((talent) => foundry.utils.parseUuid(talent).id)
    toDelete.push(path.id)
    await this.deleteEmbeddedDocuments("Item", toDelete)

    // Voie majeure
    if (isMajor) {
      await this.update({ "system.voies.majeure.nom": "", "system.voies.majeure.id": null, "system.voies.majeure.key": "" })
      ui.notifications.info(game.i18n.localize("TENEBRIS.Warnings.voieMajeureSupprimee"))
    }

    // Voie mineure
    else {
      await this.update({ "system.voies.mineure.nom": "", "system.voies.mineure.id": null, "system.voies.mineure.key": "" })
      ui.notifications.info(game.i18n.localize("TENEBRIS.Warnings.voieMineureSupprimee"))
    }
  }

  /**
   * Adds an attack to the actor if the actor type is "opponent".
   *
   * @param {Object} attack The attack object to be added.
   * @returns {Promise<void>} A promise that resolves when the attack has been added.
   */
  async addAttack(attack) {
    if (this.type !== "opponent") return

    await this.createEmbeddedDocuments("Item", [attack])
  }
}
