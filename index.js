"use strict";

var bs58 = require("bs58");

module.exports = {

    /**
     * Add sha256 multi-hash tag to hex-encoded hash and convert to base58.
     * (Prefix 1 if leading byte > 60; prefix 2 otherwise.)
     * @param {string|Buffer} hex 32-byte buffer or hex-encoded string.
     * @return {string} Base58-encoded string with sha256 multi-hash tag.
     */
    encode: function (hex) {
        if (Buffer.isBuffer(hex)) hex = hex.toString("hex");
        if (hex && hex.constructor === String) {
            hex = hex.replace("0x", "");
            if (hex.length !== 64) {
                throw new Error("length error: expected 32-byte input");
            }
            if (parseInt(hex.slice(0, 2), 16) > 60) {
                hex = "01" + hex;
            } else {
                hex = "02" + hex;
            }
            return "Dg" + bs58.encode(new Buffer(hex, "hex"));
        }
        throw new Error("unsupported format: expected hex string");
    },

    /**
     * Remove multi-hash tag (assuming sha256, the IPFS default):
     * 1. Remove leading two characters (Dg)
     * 2. Decode base58 string to 33 byte array
     * 3. Remove the leading byte, which is part of the hash tag
     * @param {string|Buffer} hash Base58-encoded sha256 hash digest.
     * @return {Buffer} 32-byte array with multihash tag removed.
     */
    decode: function (hash) {
        if (hash && hash.constructor === String && (hash.slice(0, 2) === "Dg" || hash.slice(0, 2) === "Qm")) {
            if (hash.length !== 46) {
                throw new Error("length error: expected hash+tag length of 46");
            }
            return new Buffer(bs58.decode(hash.slice(2)).splice(1));
        }
        throw new Error("unsupported format: expected base58 string");
    }

};
