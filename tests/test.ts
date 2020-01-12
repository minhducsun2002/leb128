import { LEB128, UnsignedLEB128, SignedLEB128 } from '../src/index';

const rnd = Math.floor(Math.random() * 999999);

test(`Decoding the encoded form of ${rnd} yields ${rnd}`, () => {
    const f = LEB128.encode(rnd);
    expect(LEB128.decode(f)).toBe(rnd)
}, 5000)

test(`Decoding the encoded form of ${rnd} yields ${rnd} with non-zero offset`, () => {
    const f = LEB128.encode(rnd);
    const test = [0x1, 0x2, 0x3];
    expect(
        LEB128.decode(
            Buffer.concat([Buffer.from(test), f]),
            test.length
        )
    ).toBe(rnd)
}, 5000)

test(`Decoding the encoded form of ${- rnd} yields ${- rnd}`, () => {
    const f = LEB128.encode(- rnd);
    expect(LEB128.decode(f, 0, true)).toBe(- rnd)
}, 5000)

test(`Unsigned encoder throws when passed a signed value`, () => {
    expect(() => UnsignedLEB128.encode(-1)).toThrow()
}, 1000)

test(`Signed encoder throws when passed an unsigned value`, () => {
    expect(() => SignedLEB128.encode(1)).toThrow()
}, 1000)

test(`Encoder throws when not passed a safe integer`, () => {
    [Object, '1', 1.1, !1, 2e55]
        .map(a => expect(() => LEB128.encode(a as any as number)).toThrow())
})

test(`Encoded byte count in passed buffer matches byte count of unsigned encoder output`, () => {
    const orig = UnsignedLEB128.encode(rnd);
    const f = Buffer.concat([orig, Buffer.from([0x1, 0x2, 0x3, 0x4])]);
    expect(UnsignedLEB128.getLength(f)).toBe(orig.length - 1)
}, 2000)

test(`Decoder throws when passed a non-terminating LEB128 buffer`, () => {
    expect(() => LEB128.decode(Buffer.from([0b11111111, 0b10000000, 0b11101000]))).toThrow()
}, 1000)