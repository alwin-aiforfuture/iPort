namespace iPort {
    /**
     * iPort digitalWrite
     */
    //% blockId=Digital write
    //% block="digitalWrite"
    //% address.min=0 address.max=20
    //% pin.min=0 pin.max=100
    export function digitalWrite(address: number, pin: number): number {
        return 10 * pin
    }
}