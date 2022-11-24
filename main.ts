namespace iPort {

    export enum GPIO {
        //% block="Joystick switch"
        JOYSTICK_SW = 21,

        //% block="Line follower"
        LINE_FOLLOWER = 22,

        //% block="Photo interrupter"
        PHOTO_INTERRUPT = 23,

        //% block="Limit switch"
        LIMIT_SWITCH = 24,

        //% block="Vibration"
        VIBRATION = 25,

        //% block="Touch"
        TOUCH = 26,

        //% block="Tilt switch"
        TILT_SWITCH = 27,

        //% block="Button"
        BUTTON = 28,
    }

    /**
     * iPort digitalWrite
     */
    //% blockId=Digital write
    //% block="iPort digital write to board $address with pin %pin to $pin_state"
    //% address.min=0 address.max=20
    //% pin_state.min=0 pin_state.max=1 pin_state.defl=0
    export function digitalWrite(address: number, pin: GPIO, pin_state: number): void {
        // return 10 * pin
    }
}