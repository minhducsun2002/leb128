import { LEB128, UnsignedLEB128, SignedLEB128 } from '../src/index';

const rnd = Math.floor(Math.random() * 999999);

test(`Decoding the encoded form of ${rnd} yields ${rnd}`, () => {
    const f = LEB128.encode(rnd);
    expect(LEB128.decode(f)).toBe(rnd)
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

test(`Encoder must throw when not passed a safe integer`, () => {
    [Object, '1', 1.1, !1, 2e55]
        .map(a => expect(() => LEB128.encode(a as any as number)).toThrow())
})