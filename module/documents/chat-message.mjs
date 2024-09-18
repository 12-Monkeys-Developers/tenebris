import TenebrisRoll from "./roll.mjs"

export default class TenebrisChatMessage extends ChatMessage {
  async _renderRollContent(messageData) {
    if (this.rolls[0] instanceof TenebrisRoll) {
      const roll = this.rolls[0]
      messageData.isSave = roll.isSave
      messageData.isResource = roll.isResource
      messageData.isDamage = roll.isDamage
      messageData.isFailure = roll.isFailure
      messageData.avantages = roll.avantages
      messageData.actorId = roll.actorId
      messageData.actingCharName = roll.actorName
      messageData.actingCharImg = roll.actorImage
      messageData.introText = roll.introText
      messageData.introTextTooltip = roll.introTextTooltip
      messageData.resultType = roll.resultType
      messageData.visible = this.isContentVisible
      messageData.hasTarget = roll.hasTarget
      messageData.targetName = roll.targetName
      messageData.targetArmor = roll.targetArmor
      messageData.realDamage = roll.realDamage
    }
    return super._renderRollContent(messageData)
  }
}
