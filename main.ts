namespace iPort {
    const DELAY = 50

    const CMD_MAX_LENGTH = 15
    const START_BYTE_SEND = 0xAB
    const START_BYTE_RECEIVE = 0xCD

    const REC_LEN_0_BYTE = 4
    const REC_LEN_1_BYTE = 5

    const CMD_DIGITAL_WRITE = 0x01
    export enum GPIO_OUTPUT {
        //% block="Active buzzer"
        ACTIVE_BUZZER = 11,

        //%block="Relay"
        RELAY = 12
    }

    const CMD_DIGITAL_READ = 0x02
    export enum GPIO_INPUT {
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

    function print_error_screen(msg: string) {

        // basic.showString(msg)
        basic.pause(500)

        while (1) {
            basic.showString(msg)
        }
    }

    function getChecksum(cmd: number[]) {
        let checksum = cmd[0]
        for (let i = 1; i < cmd.length; i++) {
            checksum ^= cmd[i]
        }
        return checksum
    }

    function standardArrayLen(cmd: number[]) {
        if (cmd.length < CMD_MAX_LENGTH) {
            for (let i = cmd.length; i < CMD_MAX_LENGTH; i++) {
                cmd.push(0)
            }
        }
        return cmd
    }


    function i2c_receive_0_byte(address: number, checksum: number, error_code: string) {
        let rec_cmd_len = REC_LEN_0_BYTE;
        let rec_cmd_buf = pins.i2cReadBuffer(address, rec_cmd_len, false)
        let rec_cmd_array = rec_cmd_buf.toArray(NumberFormat.UInt8LE)
        rec_cmd_array.pop()
        let rec_checksum = getChecksum(rec_cmd_array)
        if (rec_cmd_buf[0] != START_BYTE_RECEIVE ||
            rec_cmd_buf[1] != rec_cmd_len ||
            rec_cmd_buf[2] != checksum ||
            rec_cmd_buf[3] != rec_checksum) {
            print_error_screen(error_code)
        }
    }

    function i2c_receive_1_byte(address: number, checksum: number, error_code: string) {
        let rec_cmd_len = REC_LEN_1_BYTE;
        let rec_cmd_buf = pins.i2cReadBuffer(address, rec_cmd_len, false)
        let rec_cmd_array = rec_cmd_buf.toArray(NumberFormat.UInt8LE)
        rec_cmd_array.pop()
        let rec_checksum = getChecksum(rec_cmd_array)
        if (rec_cmd_buf[0] != START_BYTE_RECEIVE ||
            rec_cmd_buf[1] != rec_cmd_len ||
            rec_cmd_buf[2] != checksum ||
            rec_cmd_buf[4] != rec_checksum) {
            print_error_screen(error_code)
        }
        let value = rec_cmd_buf[3]
        return value
    }

    /**
     * iPort digitalWrite
     */
    //% blockId=digitalWrite
    //% block="iPort digital write to board $address with pin $pin to $pin_state"
    //% address.min=0 address.max=20
    //% pin_state.min=0 pin_state.max=1 pin_state.defl=0
    export function digitalWrite(address: number, pin: GPIO_OUTPUT, pin_state: number): void {
        /* [Start byte, Command Length, Address, Opcode, Operand[Pin], Operand[State], Checksum] */
        let cmd: number[] = [START_BYTE_SEND, 0x7, address, CMD_DIGITAL_WRITE, pin, pin_state]
        let checksum = getChecksum(cmd)
        cmd.push(checksum)
        cmd = standardArrayLen(cmd)

        let cmd_buf = pins.createBufferFromArray(cmd)
        pins.i2cWriteBuffer(address, cmd_buf)
        control.waitMicros(DELAY)

        i2c_receive_0_byte(address, checksum, "0x01")
    }

    /**
     * iPort digitalRead
     */
    //% blockId=digitalRead
    //% block="iPort digital read from board $address with pin $pin"
    //% address.min=0 address.max=20
    export function digitalRead(address: number, pin: GPIO_INPUT): number {
        // [Start byte, Command Length, Address, Opcode, Operand[Pin], Checksum]
        let cmd: number[] = [START_BYTE_SEND, 0x6, address, CMD_DIGITAL_READ, pin]
        let checksum = getChecksum(cmd)
        cmd.push(checksum)
        cmd = standardArrayLen(cmd)

        let cmd_buf = pins.createBufferFromArray(cmd)
        pins.i2cWriteBuffer(address, cmd_buf)
        control.waitMicros(DELAY)

        return i2c_receive_1_byte(address, checksum, "0x02")
    }
}