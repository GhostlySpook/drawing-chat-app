export type DrawingMessage = {
    data: Uint8ClampedArray | null,
    width: number | null,
    height: number | null,
    colorSpace: string | null,
    textMessage: string | null,
    id?: number
}