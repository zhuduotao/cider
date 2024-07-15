
export declare type MessageRole = "system" | "assistant" | "user"

export class Message {

  messageType: MessageRole

  sessionId: string | null
  messageId: string | null

  replyToMessageId: string | null
  content: string
  error: string | null

  // constructor
  constructor(
    messageType: MessageRole,
    sessionId: string | null,
    messageId: string | null,
    replyToMessageId: string | null,
    content: string,
    error: string | null = null
  ) {
    this.messageType = messageType
    this.sessionId = sessionId
    this.messageId = messageId
    this.replyToMessageId = replyToMessageId
    this.content = content
    this.error = error
  }
}

export class MessageChunk {
  messageId: string
  chunk: string
  end: boolean

  constructor(
    messageId: string,
    chunk: string,
    end: boolean = false
  ) {
    this.messageId = messageId
    this.chunk = chunk
    this.end = end
  }
}