export type DrawingMessage = {
    data: Uint8ClampedArray | null,
    width: number | null,
    height: number | null,
    colorSpace: string | null,
    textMessage: string | null,
    username: string,
    id?: number
}