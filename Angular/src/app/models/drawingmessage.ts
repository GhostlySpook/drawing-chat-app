export type DrawingMessage = {
    avatar: Array<string> | null,
    data: Uint8ClampedArray | null,
    width: number | null,
    height: number | null,
    colorSpace: string | null,
    textMessage: string | null,
    username: string,
    id?: number
}