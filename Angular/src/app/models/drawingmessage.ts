export type DrawingMessage = {
    data: Uint8ClampedArray,
    width: number,
    height: number,
    colorSpace: string,
    textMessage: string,
    id?: number
}