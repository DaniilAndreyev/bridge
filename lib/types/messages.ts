export type ReadyMessage = {
  type: "ready"
  initiator: boolean
}
export type SignalMessage = {
    type: "signal"
    signal: unknown
}
export type ServerMessage = ReadyMessage | SignalMessage
