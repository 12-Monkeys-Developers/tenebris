import TenebrisRoll from "./roll.mjs"

export default class TenebrisChatMessage extends ChatMessage {
  async _renderRollContent(messageData) {
    if (this.rolls[0] instanceof TenebrisRoll) {
      const roll = this.rolls[0]
      messageData.isSave = roll.isSave
      messageData.avantages = roll.avantages
      messageData.actorId = roll.actorId
      messageData.actingCharName = roll.actorName
      messageData.actingCharImg = roll.actorImage
      messageData.introText = roll.introText
      messageData.introTextTooltip = roll.introTextTooltip
      messageData.resultType = roll.resultType
      messageData.visible = this.isContentVisible
    }
    return super._renderRollContent(messageData)
  }
}
