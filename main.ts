//% color="#ffc619" weight=20 icon="\uf11b" block="iPort"
//% groups='["GPIO", "7-seg dispaly", "LED", "Rotary encoder", "Servo", "DHT11", "DS18B20"]'

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
        //% block="Joystick button"
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

        //% block="Rotary encoder button"
        ROTARY_ENCODER = 29
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

    const CMD_DHT11 = 0x07
    export enum DHT11 {
        UPDATE = 0x70,
        TEMPERATURE = 0x71,
        HUMIDITY = 0x72
    }

    const CMD_DS18B20 = 0x08
    export enum DS18B20 {
        UPDATE = 0x80,
        TEMPERATURE = 0x81,
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
        //% block="SMD LED 1 R"
        LED_SMD_1_R = 0,

        //% block="SMD LED 1 G"
        LED_SMD_1_G = 1,

        //% block="SMD LED 1 B"
        LED_SMD_1_B = 2,

        //% block="SMD LED 2 R"
        LED_SMD_2_R = 3,

        //% block="SMD LED 2 G"
        LED_SMD_2_G = 4,

        //% block="SMD LED 2 B"
        LED_SMD_2_B = 5,

        //% block="THT LED 1 R"
        LED_THT_1_R = 6,

        //% block="THT LED 1 G"
        LED_THT_1_G = 7,

        //% block="THT LED 1 B"
        LED_THT_1_B = 8,

        //% block="THT LED 2 R"
        LED_THT_2_R = 9,

        //% block="THT LED 2 G"
        LED_THT_2_G = 10,

        //% block="THT LED 2 B"
        LED_THT_2_B = 11,

        //% block="Color LED 1"
        COLOR_LED_1 = 12,

        //% block="Color LED 2"
        COLOR_LED_2 = 13,

        //% block="Laser 1"
        LASER_1 = 14,

        //% block="Laser 2"
        LASER_2 = 15
    }

    const CMD_ROTARY_ENCODER = 0x0B
    export enum ROTARY_ENCODER {
        GET_COUNT = 0xB0
    }


    function print_error_screen(msg: string) {

        basic.showString(msg)

        control.reset()
        // basic.pause(500)


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

    function i2c_receive_n_byte(address: number, checksum: number, error_code: string, len: number) {
        let rec_cmd_len = 3 + len + 1;
        let rec_cmd_buf = pins.i2cReadBuffer(address, rec_cmd_len, false)
        let rec_cmd_array = rec_cmd_buf.toArray(NumberFormat.UInt8LE)
        rec_cmd_array.pop()
        let rec_checksum = getChecksum(rec_cmd_array)
        if (rec_cmd_buf[0] != START_BYTE_RECEIVE ||
            rec_cmd_buf[1] != rec_cmd_len ||
            rec_cmd_buf[2] != checksum ||
            rec_cmd_buf[rec_cmd_len - 1] != rec_checksum) {
            print_error_screen(error_code)
        }
        let data_array = pins.createBuffer(rec_cmd_len)
        for (let i = 0; i < len; i++) {
            data_array[i] = rec_cmd_buf[3 + i]
        }
        return data_array
    }

    function hex_to_float(hex: number) {
        let hex_sign = (hex >> 31) & 0x1
        let exp = hex >> 23 & 0xff
        let mantissa = hex & 0x7fffff

        let mantissa_sum = 1
        for (let i = 22; i >= 0; i--) {
            mantissa_sum += ((mantissa >> i) & 0x1) * (2 ** (i - 23))
        }

        let sign = hex_sign == 0 ? 1 : -1
        return sign * 2 ** (exp - 127) * mantissa_sum
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
    //% blockId=PCA9635_setColor
    //% block="iPort #$address set LED $pin color $color"
    //% address.min=0 address.max=20 address.defl=10
    //% color.shadow="colorNumberPicker"
    //% group="LED" blockGap=10
    export function PCA9635_setColor(address: number, pin: PCA9635_RGB_PIN, color: number) {
        let r = color >> 16
        let g = (color & 0xFF00) >> 8
        let b = color & 0xFF

        PCA9635_setRGB(address, pin, r, g, b)
    }

    /**
    * iPort set pwm
    */
    //% blockId=PCA9635_setPWM
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

    /* Rotary encoder *************************************************************************************************************************/
    /**
    * iPort get rotary encoder count
    */
    //% blockId=RotaryEncoder_getCount
    //% block="iPort #$address get rotary encoder count"
    //% address.min=0 address.max=20 address.defl=10
    //% group="Rotary encoder" blockGap=10
    export function RotaryEncoder_getCount(address: number) {
        let cmd: number[] = [START_BYTE_SEND, 0x6, address, CMD_ROTARY_ENCODER, ROTARY_ENCODER.GET_COUNT]
        let checksum = getChecksum(cmd)
        cmd.push(checksum)
        cmd = standardArrayLen(cmd)

        let cmd_buf = pins.createBufferFromArray(cmd)
        pins.i2cWriteBuffer(address, cmd_buf)

        let buf = i2c_receive_4_byte(address, checksum, "0xB0")
        let count = (buf | 0xFFFF0000) >> 16

        return buf
    }

    /* DHT11 *************************************************************************************************************************/
    /**
    * iPort update DHT11 
    */
    function DHT11_update(address: number) {
        let cmd: number[] = [START_BYTE_SEND, 0x6, address, CMD_DHT11, DHT11.UPDATE]
        let checksum = getChecksum(cmd)
        cmd.push(checksum)
        cmd = standardArrayLen(cmd)

        let cmd_buf = pins.createBufferFromArray(cmd)
        pins.i2cWriteBuffer(address, cmd_buf)
        control.waitMicros(DELAY)

        i2c_receive_0_byte(address, checksum, "0x70");
        basic.pause(255)
    }

    /**
    * iPort get DHT11 temperature
    */
    //% blockId=DHT11_getTemp
    //% block="iPort #$address get DHT11 temperature"
    //% address.min=0 address.max=20 address.defl=10
    //% group="DHT11" blockGap=10
    export function DHT11_getTemp(address: number) {
        // [Start byte, Command Length, Address, Opcode, Opcode, Checksum]
        DHT11_update(address)
        let cmd: number[] = [START_BYTE_SEND, 0x6, address, CMD_DHT11, DHT11.TEMPERATURE]
        let checksum = getChecksum(cmd)
        cmd.push(checksum)
        cmd = standardArrayLen(cmd)

        let cmd_buf = pins.createBufferFromArray(cmd)
        pins.i2cWriteBuffer(address, cmd_buf)
        control.waitMicros(DELAY)

        return i2c_receive_1_byte(address, checksum, "0x71")
    }

    /**
    * iPort get DHT11 humidity
    */
    //% blockId=DHT11_getHum
    //% block="iPort #$address get DHT11 humidity"
    //% address.min=0 address.max=20 address.defl=10
    //% group="DHT11" blockGap=10
    export function DHT11_getHum(address: number) {
        // [Start byte, Command Length, Address, Opcode, Opcode, Checksum]
        DHT11_update(address)
        let cmd: number[] = [START_BYTE_SEND, 0x6, address, CMD_DHT11, DHT11.HUMIDITY]
        let checksum = getChecksum(cmd)
        cmd.push(checksum)
        cmd = standardArrayLen(cmd)

        let cmd_buf = pins.createBufferFromArray(cmd)
        pins.i2cWriteBuffer(address, cmd_buf)
        control.waitMicros(DELAY)

        return i2c_receive_1_byte(address, checksum, "0x72")
    }
    /* DS18B20 *************************************************************************************************************************/

    /**
    * iPort update DHT11 
    */
    function DS18B20_update(address: number) {
        let cmd: number[] = [START_BYTE_SEND, 0x6, address, CMD_DS18B20, DS18B20.UPDATE]
        let checksum = getChecksum(cmd)
        cmd.push(checksum)
        cmd = standardArrayLen(cmd)

        let cmd_buf = pins.createBufferFromArray(cmd)
        pins.i2cWriteBuffer(address, cmd_buf)
        control.waitMicros(DELAY)

        i2c_receive_0_byte(address, checksum, "0x80");
        basic.pause(255)
    }

    /**
    * iPort get DS18B20 temperature
    */
    //% blockId=DS18B20_getTemp
    //% block="iPort #$address get DS18B20 temperature"
    //% address.min=0 address.max=20 address.defl=10
    //% group="DS18B20" blockGap=10
    export function DS18B20_getTemp(address: number) {
        // [Start byte, Command Length, Address, Opcode, Opcode, Checksum]
        DS18B20_update(address)
        let cmd: number[] = [START_BYTE_SEND, 0x6, address, CMD_DS18B20, DS18B20.TEMPERATURE]
        let checksum = getChecksum(cmd)
        cmd.push(checksum)
        cmd = standardArrayLen(cmd)

        let cmd_buf = pins.createBufferFromArray(cmd)
        pins.i2cWriteBuffer(address, cmd_buf)
        control.waitMicros(DELAY)

        let i2c_buf = i2c_receive_n_byte(address, checksum, "0x81", 4)
        let value = i2c_buf[0] << 24 | i2c_buf[1] << 16 | i2c_buf[2] << 8 | i2c_buf[3]

        // return hex_to_float(value)
        return 123
    }
}