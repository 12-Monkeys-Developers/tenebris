export default class TenebrisActor extends Actor {
  async addPath(item) {
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
      // Création de la voie
      const voie = await this.createEmbeddedDocuments("Item", [itemData], { renderSheet: false })
      await this.update({ "system.voies.mineure.nom": item.name, "system.voies.mineure.id": voie[0].id })

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
      await this.update({ "system.voies.majeure.nom": item.name, "system.voies.majeure.id": voie[0].id })

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
        "system.voies.majeure.nom": item.name,
        "system.voies.majeure.id": voie[0].id,
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
        "system.dmax.valeur": item.system.dmax.valeur,
        "system.langues": item.system.langues,
      })
      return ui.notifications.info(game.i18n.localize("TENEBRIS.Warnings.voieMajeureAjoutee"))
    }
  }
}
