enum Mask { LOWER_7 = 0b01111111, UPPER_1 = 0b10000000 }
const int = (a : number) => Number.isSafeInteger(a);

/**
 * Class to work with unsigned LEB128 integers.
 * @see https://en.wikipedia.org/wiki/LEB128#Encoding_format
 */
export class UnsignedLEB128 {
    /**
     * Decode a Buffer into a number.
     * @param buf Buffer containing the representation in LEB128
     * @param offset Offset to read from
     */
    static decode (buf: Buffer, offset: number = 0) {
        const mp = this.$scanForNullBytes(buf, offset);
        let result = 0, shift = 0;
        for (let d = 0 ; d <= mp - offset ; d++) {
            const a = buf.readUInt8(offset + d) & Mask.LOWER_7; /* masking, we only care about lower 7 bits */
            result |= a << shift; /* shift this value left and add it */
            shift += (8 - 1);
        }
        return result;
    }

    /**
     * Create a LEB128 Buffer from a number
     * @param number Number to convert from
     */
    static encode (number: number) {
        this.check(number);
        if (number < 0)
            throw new Error (`An unsigned number must NOT be negative, ${number} is!`)

        let out: number[] = [], a = number;
        do {
            let byte = a & Mask.LOWER_7;
            // we only care about lower 7 bits
            a >>= (8 - 1);
            // shift
            if (a) byte = byte | Mask.UPPER_1; /* if remaining is truthy (!= 0), set highest bit */
            out.push(byte);
        }
        while (a);
        return Buffer.from(out);
    }

    private static check (n : number) {
        if (!int(n))
            throw new Error(`${n} is not a safe integer!`)
    }

    /**
     * Return the index that the byte at which ends the stream
     * @param buf Buffer to scan
     * @param offset Offset to start scanning
     */
    private static $scanForNullBytes(buf: Buffer, offset: number = 0) {
        let count = offset, tmp: number = 0;
        do {
            tmp = buf.slice(count, count + 1).readUInt8(0);
            count++;
        } while (tmp & Mask.UPPER_1);
        return count - 1;
    }
}

export class SignedLEB128 {
    private static $ceil7mul (n: number) {
        let a = n;
        while (a % 7) a++;
        return a;
    }

    private static check (n : number) {
        if (!int(n))
            throw new Error(`${n} is not a safe integer!`)
    }

    /**
     * Create a LEB128 Buffer from a number
     * @param number Number to convert from. Must be less than 0.
     */
    static encode (number: number) {
        this.check(number);
        if (number >= 0)
            throw new Error (`A signed number must be negative, ${number} isn't!`)

        const bitCount = Math.ceil(Math.log2(-number));
        return UnsignedLEB128.encode((1 << this.$ceil7mul(bitCount)) + number)
    }

    /**
     * Decode a Buffer into a (signed) number.
     * @param buf Buffer containing the representation in LEB128
     * @param offset Offset to read from
     */
    static decode (buf: Buffer, offset: number = 0) {
        const r = UnsignedLEB128.decode(buf, offset);
        const bitCount = Math.ceil(Math.log2(r))
        const mask = (1 << bitCount);
        return -(mask - r);
    }
}

export class LEB128 {
    /**
     * Create a LEB128 Buffer from a number
     * @param number Number to convert from.
     */
    static encode = (n : number) => (n >= 0 ? UnsignedLEB128 : SignedLEB128).encode(n);

    /**
     * Decode a Buffer into a (signed) number.
     * @param buf Buffer containing the representation in LEB128
     * @param offset Offset to read from
     * @param s Whether the output number is negative
     */
    static decode = (buf: Buffer, offset: number = 0, s : boolean = false) => 
        (s ? SignedLEB128 : UnsignedLEB128).decode(buf, offset);
}