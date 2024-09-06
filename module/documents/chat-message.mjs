import TenebrisRoll from "./roll.mjs"

export default class TenebrisChatMessage extends ChatMessage {
  async _renderRollContent(messageData) {
    if (this.rolls[0] instanceof TenebrisRoll) {
      const options = this.rolls[0].options
      messageData.isSave = this.rolls[0].isSave
      messageData.avantages = options.avantages
      messageData.actorId = options.actorId
      messageData.actingCharName = options.actorName
      messageData.actingCharImg = options.actorImage
      messageData.introText = options.introText
      messageData.introTextTooltip = options.introTextTooltip
      messageData.resultType = options.resultType
    }
    return super._renderRollContent(messageData)
  }
}
