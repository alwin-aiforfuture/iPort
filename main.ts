//% color="#ffc619" weight=20 icon="\uf11b" block="iPort"
//% groups='["GPIO", "7-seg dispaly", "LED"]'

namespace iPort {
    const DELAY = 50

    const CMD_MAX_LENGTH = 15
    const START_BYTE_SEND = 0xAB
    const START_BYTE_RECEIVE = 0xCD

    const REC_LEN_0_BYTE = 4
    const REC_LEN_1_BYTE = 5
    const REC_LEN_4_BYTE = 8
    const REC_LEN_ANALOG_READ = 6

    const CMD_DIGITAL_WRITE = 0x01
    export enum GPIO_OUTPUT_PIN {
        //% block="Active buzzer"
        ACTIVE_BUZZER = 11,

        //%block="Relay"
        RELAY = 12
    }

    const CMD_DIGITAL_READ = 0x02
    export enum GPIO_INPUT_PIN {
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

    const CMD_ANALOG_READ = 0x04
    export enum ADC_PIN {
        //% block="Joystick X"
        JOYSTICK_X = 41,

        //% block="Joystick Y"
        JOYSTICK_Y = 42,

        //% block="Water level"
        WATER_LEVEL = 43,

        //% block="Flame"
        FLAME = 44,

        //% block="Hall effect"
        HALL_EFFECT = 45,

        //% block="Soil humidity"
        SOIL_HUMIDITY = 46,

        //% block="Analog temp"
        ANALOG_TEMP = 47,

        //% block="Microphone"
        MIC = 48,

        //% block="Photoresistor"
        PHOTORESISTOR = 49,

        //% block="Potentiometer"
        POTENTIOMETER = 10,

        //% block="Heart rate"
        HEART_RATE = 11

    }

    const CMD_SERVO = 0x05
    export enum SERVO {
        ANGLE = 0x50,
        TARGET_US = 0x51
    }


    const CMD_SEVEN_SEGMENT = 0x06
    export enum SEVEN_SEG {
        CLEAR = 0x60,
        SET_DEC_NUM = 0x61,
        SET_BRIGHTNESS = 0x62,
        ALL_ON = 0x63,
        SET_SIGNED_NUM = 0x64
    }

    const CMD_PCA9635 = 0x09
    export enum PCA9635 {
        SET_RGB = 0x90,
        SET_PWM = 0x91
    }
    export enum PCA9635_RGB_PIN {
        //% block="SMD LED 1"
        LED_SMD_1 = 0x01,

        //% block="SMD LED 2"
        LED_SMD_2 = 0x02,

        //% block="THT LED 1"
        LED_1 = 0x03,

        //% block="THT LED 2"
        LED_2 = 0x04
    }
    export enum PCA9635_PIN {
        LED_SMD_1_R = 0,
        LED_SMD_1_G = 1,
        LED_SMD_1_B = 2,
        LED_SMD_2_R = 3,
        LED_SMD_2_G = 4,
        LED_SMD_2_B = 5,
        LED_THT_1_R = 6,
        LED_THT_1_G = 7,
        LED_THT_1_B = 8,
        LED_THT_2_R = 9,
        LED_THT_2_G = 10,
        LED_THT_2_B = 11,
        COLOR_LED_1 = 12,
        COLOR_LED_2 = 13,
        LASER_1 = 14,
        LASER_2 = 15
    }

    function print_error_screen(msg: string) {

        // basic.showString(msg)
        basic.pause(500)

        // while (1) {
        //     basic.showString(msg)
        // }
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

    function i2c_receive_4_byte(address: number, checksum: number, error_code: string) {
        let rec_cmd_len = REC_LEN_4_BYTE;
        let rec_cmd_buf = pins.i2cReadBuffer(address, rec_cmd_len, false)
        let rec_cmd_array = rec_cmd_buf.toArray(NumberFormat.UInt8LE)
        rec_cmd_array.pop()
        let rec_checksum = getChecksum(rec_cmd_array)
        if (rec_cmd_buf[0] != START_BYTE_RECEIVE ||
            rec_cmd_buf[1] != rec_cmd_len ||
            rec_cmd_buf[2] != checksum ||
            rec_cmd_buf[7] != rec_checksum) {
            print_error_screen(error_code)
        }
        let value = rec_cmd_buf[3] << 24 | rec_cmd_buf[4] << 16 | rec_cmd_buf[5] << 8 | rec_cmd_buf[6]
        return value
    }

    /* GPIO *************************************************************************************************************************/
    /**
     * iPort digitalWrite
     */
    //% blockId=digitalWrite
    //% block="iPort #$address digital write $pin state $pin_state"
    //% address.min=0 address.max=20 address.defl=10
    //% pin_state.min=0 pin_state.max=1 pin_state.defl=0
    //% group="GPIO" blockGap=5
    export function digitalWrite(address: number, pin: GPIO_OUTPUT_PIN, pin_state: number): void {
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
    //% block="iPort #$address digital read $pin"
    //% address.min=0 address.max=20 address.defl=10
    //% group="GPIO" blockGap=10
    export function digitalRead(address: number, pin: GPIO_INPUT_PIN): number {
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

    /**
     * iPort analogRead
     */
    //% blockId=analogRead
    //% block="iPort #$address analog read $pin"
    //% address.min=0 address.max=20 address.defl=10
    //% group="GPIO" blockGap=10
    export function analogRead(address: number, pin: ADC_PIN) {
        let cmd: number[] = [START_BYTE_SEND, 0x6, address, CMD_ANALOG_READ, pin]
        let checksum = getChecksum(cmd)
        cmd.push(checksum)
        cmd = standardArrayLen(cmd)

        let cmd_buf = pins.createBufferFromArray(cmd)
        pins.i2cWriteBuffer(address, cmd_buf)
        control.waitMicros(DELAY)

        let rec_cmd_buf = pins.i2cReadBuffer(address, REC_LEN_ANALOG_READ, false)
        let rec_cmd_array = rec_cmd_buf.toArray(NumberFormat.UInt8LE)
        rec_cmd_array.pop()
        let rec_checksum = getChecksum(rec_cmd_array)

        if (rec_cmd_buf[0] != START_BYTE_RECEIVE ||
            rec_cmd_buf[1] != REC_LEN_ANALOG_READ ||
            rec_cmd_buf[2] != checksum ||
            rec_cmd_buf[5] != rec_checksum) {
            print_error_screen("0x04")

        }
        let value = rec_cmd_buf[3] << 8 | rec_cmd_buf[4]
        control.waitMicros(DELAY)
        return value
    }

    /* Servo *************************************************************************************************************************/
    /**
     * iPort set servo angle
     */
    //% blockId=servoAngle
    //% block="iPort #$address set servo $servo_num angle to $angle"
    //% address.min=0 address.max=20 address.defl=10
    //% servo_num.min=1 servo_num.max=8 servo_num.defl=1
    //% angle.min=0 angle.max=180 angle.defl=0
    //% group="Servo" blockGap=10
    export function servoAngle(address: number, servo_num: number, angle: number) {
        let cmd: number[] = [START_BYTE_SEND, 0x8, address, CMD_SERVO, SERVO.ANGLE, servo_num, angle]
        let checksum = getChecksum(cmd)
        cmd.push(checksum)
        cmd = standardArrayLen(cmd)

        let cmd_buf = pins.createBufferFromArray(cmd)
        pins.i2cWriteBuffer(address, cmd_buf)
        control.waitMicros(DELAY)

        i2c_receive_0_byte(address, checksum, "0x51")
    }

    /**
     * iPort set servo us
     */
    //% blockId=servoTargetUS
    //% block="iPort #$address set servo $servo_num to $target_us (us)"
    //% address.min=0 address.max=20 address.defl=10
    //% servo_num.min=1 servo_num.max=8 servo_num.defl=1
    //% target_us.min=500 target_us.max=2500 target_us.defl=500
    //% group="Servo" blockGap=10
    export function servoTargetUS(address: number, servo_num: number, target_us: number) {
        let target_us_MSB = (target_us & 0b1111111100000000) >> 8;
        let target_us_LSB = (target_us & 0b0000000011111111);
        let cmd: number[] = [START_BYTE_SEND, 0x9, address, CMD_SERVO, SERVO.TARGET_US, servo_num, target_us_MSB, target_us_LSB]
        let checksum = getChecksum(cmd)
        cmd.push(checksum)
        cmd = standardArrayLen(cmd)

        let cmd_buf = pins.createBufferFromArray(cmd)
        pins.i2cWriteBuffer(address, cmd_buf)
        control.waitMicros(DELAY)

        i2c_receive_0_byte(address, checksum, "0x52")
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
    //% block="iPort #$address set brightness $brightness_level"
    //% address.min=0 address.max=20 address.defl=10
    //% brightness_level.min=0 brightness_level.max=7 brightness_level.defl=4
    //% group="7-seg dispaly" blockGap=10
    export function sevenSegment_SetBrightness(address: number, brightness_level: number) {
        let cmd: number[] = [START_BYTE_SEND, 0x7, address, CMD_SEVEN_SEGMENT, SEVEN_SEG.SET_BRIGHTNESS, brightness_level]
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

    /**
     * iPort 7-seg dispaly all on
     */
    //% blockId=sevenSegment_AllOn
    //% block="iPort #$address display all on"
    //% address.min=0 address.max=20 address.defl=10
    //% group="7-seg dispaly" blockGap=10
    export function sevenSegment_AllOn(address: number) {
        let cmd: number[] = [START_BYTE_SEND, 0x6, address, CMD_SEVEN_SEGMENT, SEVEN_SEG.ALL_ON]
        let checksum = getChecksum(cmd)
        cmd.push(checksum)
        cmd = standardArrayLen(cmd)

        let cmd_buf = pins.createBufferFromArray(cmd)
        pins.i2cWriteBuffer(address, cmd_buf)
        control.waitMicros(800)

        i2c_receive_0_byte(address, checksum, "0x63")
    }

    /* LED *************************************************************************************************************************/
    /**
     * PCA9635_setRGB
     */
    //% blockId=PCA9635_setRGB
    //% block="iPort #$address set LED $pin r $r g $g b $b"
    //% address.min=0 address.max=20 address.defl=10
    //% r.min=0 r.max=255 r.defl=128
    //% g.min=0 g.max=255 g.defl=128
    //% b.min=0 b.max=255 b.defl=128
    //% group="LED" blockGap=10
    export function PCA9635_setRGB(address: number, pin: PCA9635_RGB_PIN, r: number, g: number, b: number) {
        let cmd: number[] = [START_BYTE_SEND, 0xA, address, CMD_PCA9635, PCA9635.SET_RGB, pin, r, g, b]
        let checksum = getChecksum(cmd)
        cmd.push(checksum)
        cmd = standardArrayLen(cmd)

        let cmd_buf = pins.createBufferFromArray(cmd)
        pins.i2cWriteBuffer(address, cmd_buf)
        control.waitMicros(2000)

        i2c_receive_0_byte(address, checksum, "0x90")
    }

    /**
    * iPort set lights to selected color
    */
    //% block="iPort #$address set LED $pin color $color"
    //% address.min=0 address.max=20 address.defl=10
    //% color.shadow="colorNumberPicker"
    //% group="LED" blockGap=10
    export function setHeadColor(address: number, pin: PCA9635_RGB_PIN, color: number) {
        let r = color >> 16
        let g = (color & 0xFF00) >> 8
        let b = color & 0xFF

        PCA9635_setRGB(address, pin, r, g, b)
    }

    /**
    * iPort set pwm
    */
    //% block="iPort #$address set LED $pin value $value"
    //% address.min=0 address.max=20 address.defl=10
    //% value.min=0 value.max=255 value.defl=128
    //% group="LED" blockGap=10
    export function PCA9635_setPWM(address: number, pin: PCA9635_PIN, value: number) {
        let cmd: number[] = [START_BYTE_SEND, 0x8, address, CMD_PCA9635, PCA9635.SET_PWM, pin, value]
        let checksum = getChecksum(cmd)
        cmd.push(checksum)
        cmd = standardArrayLen(cmd)

        let cmd_buf = pins.createBufferFromArray(cmd)
        pins.i2cWriteBuffer(address, cmd_buf)
        control.waitMicros(2000)

        i2c_receive_0_byte(address, checksum, "0x91");
    }
}