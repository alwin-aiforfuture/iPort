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

    const CMD_SEVEN_SEGMENT = 0x06
    export enum SEVEN_SEG {
        CLEAR = 0x60,
        SET_DEC_NUM = 0x61,
        SET_BRIGHTNESS = 0x62,
        ALL_ON = 0x63,
        SET_SIGNED_NUM = 0x64
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

    /* GPIO *************************************************************************************************************************/
    /**
     * iPort digitalWrite
     */
    //% blockId=digitalWrite
    //% block="iPort digital write to board $address with pin $pin to $pin_state"
    //% address.min=0 address.max=20 address.defl=10
    //% pin_state.min=0 pin_state.max=1 pin_state.defl=0
    //% group="GPIO" blockGap=5
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
    //% address.min=0 address.max=20 address.defl=10
    //% group="GPIO" blockGap=10
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

    /* 7-seg dispaly *************************************************************************************************************************/
    /**
     * iPort 7-seg dispaly clear
     */
    //% blockId=sevenSegment_Clear
    //% block="iPort #$address clear display"
    //% address.min=0 address.max=20 address.defl=10
    //% group="7-seg dispaly" blockGap=10
    export function sevenSegment_Clear(address: number) {
        let cmd: number[] = [START_BYTE_SEND, 0x6, address, CMD_SEVEN_SEGMENT, SEVEN_SEG.CLEAR]
        let checksum = getChecksum(cmd)
        cmd.push(checksum)
        cmd = standardArrayLen(cmd)

        let cmd_buf = pins.createBufferFromArray(cmd)
        pins.i2cWriteBuffer(address, cmd_buf)
        control.waitMicros(800)

        i2c_receive_0_byte(address, checksum, "0x60");
    }

    /**
     * iPort 7-seg dispaly set brightness
     */
    //% blockId=sevenSegment_SetBrightness
    //% block="iPort #$address set brightness $num"
    //% address.min=0 address.max=20 address.defl=10
    //% brightness.min=0 brightness.max=7
    //% group="7-seg dispaly" blockGap=10
    export function sevenSegment_SetBrightness(address: number, brightness: number) {
        let cmd: number[] = [START_BYTE_SEND, 0x7, address, CMD_SEVEN_SEGMENT, SEVEN_SEG.SET_BRIGHTNESS, brightness]
        let checksum = getChecksum(cmd)
        cmd.push(checksum)
        cmd = standardArrayLen(cmd)

        let cmd_buf = pins.createBufferFromArray(cmd)
        pins.i2cWriteBuffer(address, cmd_buf)
        control.waitMicros(800)

        i2c_receive_0_byte(address, checksum, "0x62");
    }

    /**
     * iPort 7-seg dispaly set number
     */
    //% blockId=sevenSegment_SetSignedNumber
    //% block="iPort #$address display number $num"
    //% address.min=0 address.max=20 address.defl=10
    //% num.min=-999 num.max=9999
    //% group="7-seg dispaly" blockGap=10
    export function sevenSegment_SetSignedNumber(address: number, num: number) {
        let num_MSB = (num & 0b1111111100000000) >> 8
        let num_LSB = (num & 0b0000000011111111)
        let cmd: number[] = [START_BYTE_SEND, 0x8, address, CMD_SEVEN_SEGMENT, SEVEN_SEG.SET_SIGNED_NUM, num_MSB, num_LSB]
        let checksum = getChecksum(cmd)
        cmd.push(checksum)
        cmd = standardArrayLen(cmd)

        let cmd_buf = pins.createBufferFromArray(cmd)
        pins.i2cWriteBuffer(address, cmd_buf)
        control.waitMicros(800)

        i2c_receive_0_byte(address, checksum, "0x61");
    }
}