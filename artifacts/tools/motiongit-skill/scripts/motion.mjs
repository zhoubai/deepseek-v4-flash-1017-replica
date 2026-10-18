#!/usr/bin/env node
import {createRequire as __mgCreateRequire} from "node:module";const require=__mgCreateRequire(import.meta.url);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/pend/index.js
var require_pend = __commonJS({
  "node_modules/pend/index.js"(exports, module) {
    module.exports = Pend;
    function Pend() {
      this.pending = 0;
      this.max = Infinity;
      this.listeners = [];
      this.waiting = [];
      this.error = null;
    }
    Pend.prototype.go = function(fn) {
      if (this.pending < this.max) {
        pendGo(this, fn);
      } else {
        this.waiting.push(fn);
      }
    };
    Pend.prototype.wait = function(cb) {
      if (this.pending === 0) {
        cb(this.error);
      } else {
        this.listeners.push(cb);
      }
    };
    Pend.prototype.hold = function() {
      return pendHold(this);
    };
    function pendHold(self) {
      self.pending += 1;
      var called = false;
      return onCb;
      function onCb(err) {
        if (called) throw new Error("callback called twice");
        called = true;
        self.error = self.error || err;
        self.pending -= 1;
        if (self.waiting.length > 0 && self.pending < self.max) {
          pendGo(self, self.waiting.shift());
        } else if (self.pending === 0) {
          var listeners = self.listeners;
          self.listeners = [];
          listeners.forEach(cbListener);
        }
      }
      function cbListener(listener) {
        listener(self.error);
      }
    }
    function pendGo(self, fn) {
      fn(pendHold(self));
    }
  }
});

// node_modules/yauzl/fd-slicer.js
var require_fd_slicer = __commonJS({
  "node_modules/yauzl/fd-slicer.js"(exports) {
    var fs10 = __require("fs");
    var util = __require("util");
    var stream = __require("stream");
    var Readable = stream.Readable;
    var PassThrough = stream.PassThrough;
    var Pend = require_pend();
    var EventEmitter = __require("events").EventEmitter;
    exports.BufferSlicer = BufferSlicer;
    exports.FdSlicer = FdSlicer;
    util.inherits(FdSlicer, EventEmitter);
    function FdSlicer(fd) {
      EventEmitter.call(this);
      this.fd = fd;
      this.pend = new Pend();
      this.pend.max = 1;
      this.refCount = 0;
    }
    FdSlicer.prototype.read = function(buffer, offset, length, position, callback) {
      var self = this;
      self.pend.go(function(cb) {
        fs10.read(self.fd, buffer, offset, length, position, function(err, bytesRead, buffer2) {
          cb();
          callback(err, bytesRead, buffer2);
        });
      });
    };
    FdSlicer.prototype.createReadStream = function(options2) {
      return new ReadStream(this, options2);
    };
    FdSlicer.prototype.ref = function() {
      this.refCount += 1;
    };
    FdSlicer.prototype.unref = function() {
      var self = this;
      self.refCount -= 1;
      if (self.refCount < 0) throw new Error("invalid unref");
      if (self.refCount > 0) return;
      fs10.close(self.fd, onCloseDone);
      function onCloseDone(err) {
        if (err) {
          self.emit("error", err);
        } else {
          self.emit("close");
        }
      }
    };
    util.inherits(ReadStream, Readable);
    function ReadStream(context2, options2) {
      options2 = options2 || {};
      Readable.call(this, options2);
      this.context = context2;
      this.context.ref();
      this.start = options2.start || 0;
      this.endOffset = options2.end;
      this.pos = this.start;
    }
    ReadStream.prototype._read = function(n) {
      var self = this;
      var toRead = Math.min(self._readableState.highWaterMark, n);
      if (self.endOffset != null) {
        toRead = Math.min(toRead, self.endOffset - self.pos);
      }
      if (toRead <= 0) {
        self.push(null);
        this._cleanup();
        return;
      }
      self.context.pend.go(function(cb) {
        var buffer = Buffer.allocUnsafe(toRead);
        fs10.read(self.context.fd, buffer, 0, toRead, self.pos, function(err, bytesRead) {
          if (err) {
            self.destroy(err);
          } else if (bytesRead === 0) {
            self.push(null);
            self._cleanup();
          } else {
            self.pos += bytesRead;
            self.push(buffer.slice(0, bytesRead));
          }
          cb();
        });
      });
    };
    ReadStream.prototype._destroy = function(err, cb) {
      this._cleanup();
      cb(err);
    };
    ReadStream.prototype._cleanup = function() {
      if (this.context != null) {
        this.context.unref();
        this.context = null;
      }
    };
    util.inherits(BufferSlicer, EventEmitter);
    function BufferSlicer(buffer) {
      EventEmitter.call(this);
      this.refCount = 0;
      this.buffer = buffer;
    }
    BufferSlicer.prototype.read = function(buffer, offset, length, position, callback) {
      if (!(0 <= offset && offset <= buffer.length)) throw new RangeError("offset outside buffer: 0 <= " + offset + " <= " + buffer.length);
      if (position < 0) throw new RangeError("position is negative: " + position);
      if (offset + length > buffer.length) {
        length = buffer.length - offset;
      }
      if (position + length > this.buffer.length) {
        length = this.buffer.length - position;
      }
      if (length <= 0) {
        setImmediate(function() {
          callback(null, 0);
        });
        return;
      }
      this.buffer.copy(buffer, offset, position, position + length);
      setImmediate(function() {
        callback(null, length);
      });
    };
    BufferSlicer.prototype.createReadStream = function(options2) {
      options2 = options2 || {};
      var readStream = new PassThrough(options2);
      readStream.start = options2.start || 0;
      readStream.endOffset = options2.end;
      readStream.pos = readStream.endOffset || this.buffer.length;
      var entireSlice = this.buffer.slice(readStream.start, readStream.pos);
      var maxChunkSize = 65536;
      var offset = 0;
      while (true) {
        var nextOffset = offset + maxChunkSize;
        if (nextOffset >= entireSlice.length) {
          if (offset < entireSlice.length) {
            readStream.write(entireSlice.slice(offset, entireSlice.length));
          }
          break;
        }
        readStream.write(entireSlice.slice(offset, nextOffset));
        offset = nextOffset;
      }
      readStream.end();
      return readStream;
    };
    BufferSlicer.prototype.ref = function() {
      this.refCount += 1;
    };
    BufferSlicer.prototype.unref = function() {
      this.refCount -= 1;
      if (this.refCount < 0) {
        throw new Error("invalid unref");
      }
    };
  }
});

// node_modules/yauzl/crc32.js
var require_crc32 = __commonJS({
  "node_modules/yauzl/crc32.js"(exports, module) {
    var CRC_TABLE = new Int32Array([
      0,
      1996959894,
      3993919788,
      2567524794,
      124634137,
      1886057615,
      3915621685,
      2657392035,
      249268274,
      2044508324,
      3772115230,
      2547177864,
      162941995,
      2125561021,
      3887607047,
      2428444049,
      498536548,
      1789927666,
      4089016648,
      2227061214,
      450548861,
      1843258603,
      4107580753,
      2211677639,
      325883990,
      1684777152,
      4251122042,
      2321926636,
      335633487,
      1661365465,
      4195302755,
      2366115317,
      997073096,
      1281953886,
      3579855332,
      2724688242,
      1006888145,
      1258607687,
      3524101629,
      2768942443,
      901097722,
      1119000684,
      3686517206,
      2898065728,
      853044451,
      1172266101,
      3705015759,
      2882616665,
      651767980,
      1373503546,
      3369554304,
      3218104598,
      565507253,
      1454621731,
      3485111705,
      3099436303,
      671266974,
      1594198024,
      3322730930,
      2970347812,
      795835527,
      1483230225,
      3244367275,
      3060149565,
      1994146192,
      31158534,
      2563907772,
      4023717930,
      1907459465,
      112637215,
      2680153253,
      3904427059,
      2013776290,
      251722036,
      2517215374,
      3775830040,
      2137656763,
      141376813,
      2439277719,
      3865271297,
      1802195444,
      476864866,
      2238001368,
      4066508878,
      1812370925,
      453092731,
      2181625025,
      4111451223,
      1706088902,
      314042704,
      2344532202,
      4240017532,
      1658658271,
      366619977,
      2362670323,
      4224994405,
      1303535960,
      984961486,
      2747007092,
      3569037538,
      1256170817,
      1037604311,
      2765210733,
      3554079995,
      1131014506,
      879679996,
      2909243462,
      3663771856,
      1141124467,
      855842277,
      2852801631,
      3708648649,
      1342533948,
      654459306,
      3188396048,
      3373015174,
      1466479909,
      544179635,
      3110523913,
      3462522015,
      1591671054,
      702138776,
      2966460450,
      3352799412,
      1504918807,
      783551873,
      3082640443,
      3233442989,
      3988292384,
      2596254646,
      62317068,
      1957810842,
      3939845945,
      2647816111,
      81470997,
      1943803523,
      3814918930,
      2489596804,
      225274430,
      2053790376,
      3826175755,
      2466906013,
      167816743,
      2097651377,
      4027552580,
      2265490386,
      503444072,
      1762050814,
      4150417245,
      2154129355,
      426522225,
      1852507879,
      4275313526,
      2312317920,
      282753626,
      1742555852,
      4189708143,
      2394877945,
      397917763,
      1622183637,
      3604390888,
      2714866558,
      953729732,
      1340076626,
      3518719985,
      2797360999,
      1068828381,
      1219638859,
      3624741850,
      2936675148,
      906185462,
      1090812512,
      3747672003,
      2825379669,
      829329135,
      1181335161,
      3412177804,
      3160834842,
      628085408,
      1382605366,
      3423369109,
      3138078467,
      570562233,
      1426400815,
      3317316542,
      2998733608,
      733239954,
      1555261956,
      3268935591,
      3050360625,
      752459403,
      1541320221,
      2607071920,
      3965973030,
      1969922972,
      40735498,
      2617837225,
      3943577151,
      1913087877,
      83908371,
      2512341634,
      3803740692,
      2075208622,
      213261112,
      2463272603,
      3855990285,
      2094854071,
      198958881,
      2262029012,
      4057260610,
      1759359992,
      534414190,
      2176718541,
      4139329115,
      1873836001,
      414664567,
      2282248934,
      4279200368,
      1711684554,
      285281116,
      2405801727,
      4167216745,
      1634467795,
      376229701,
      2685067896,
      3608007406,
      1308918612,
      956543938,
      2808555105,
      3495958263,
      1231636301,
      1047427035,
      2932959818,
      3654703836,
      1088359270,
      936918e3,
      2847714899,
      3736837829,
      1202900863,
      817233897,
      3183342108,
      3401237130,
      1404277552,
      615818150,
      3134207493,
      3453421203,
      1423857449,
      601450431,
      3009837614,
      3294710456,
      1567103746,
      711928724,
      3020668471,
      3272380065,
      1510334235,
      755167117
    ]);
    function crc323(buf) {
      let crc = -1;
      for (let x of buf) {
        crc = CRC_TABLE[(crc ^ x) & 255] ^ crc >>> 8;
      }
      return (crc ^ -1) >>> 0;
    }
    module.exports = crc323;
  }
});

// node_modules/yauzl/index.js
var require_yauzl = __commonJS({
  "node_modules/yauzl/index.js"(exports) {
    var fs10 = __require("fs");
    var zlib2 = __require("zlib");
    var fd_slicer = require_fd_slicer();
    var util = __require("util");
    var EventEmitter = __require("events").EventEmitter;
    var Transform = __require("stream").Transform;
    var PassThrough = __require("stream").PassThrough;
    var Writable = __require("stream").Writable;
    var crc323 = typeof zlib2.crc32 === "function" ? zlib2.crc32 : require_crc32();
    exports.open = open;
    exports.fromFd = fromFd;
    exports.fromBuffer = fromBuffer;
    exports.fromRandomAccessReader = fromRandomAccessReader;
    exports.openPromise = openPromise;
    exports.fromFdPromise = fromFdPromise;
    exports.fromBufferPromise = fromBufferPromise;
    exports.fromRandomAccessReaderPromise = fromRandomAccessReaderPromise;
    exports.dosDateTimeToDate = dosDateTimeToDate;
    exports.getFileNameLowLevel = getFileNameLowLevel;
    exports.validateFileName = validateFileName;
    exports.parseExtraFields = parseExtraFields;
    exports.ZipFile = ZipFile;
    exports.Entry = Entry;
    exports.LocalFileHeader = LocalFileHeader;
    exports.RandomAccessReader = RandomAccessReader;
    function openPromise(path8, options2) {
      return new Promise((resolve, reject) => {
        open(path8, { ...options2, lazyEntries: true }, function(err, zipfile) {
          if (err) return reject(err);
          resolve(zipfile);
        });
      });
    }
    function fromFdPromise(fd, options2) {
      return new Promise((resolve, reject) => {
        fromFd(fd, { ...options2, lazyEntries: true }, function(err, zipfile) {
          if (err) return reject(err);
          resolve(zipfile);
        });
      });
    }
    function fromBufferPromise(buffer, options2) {
      return new Promise((resolve, reject) => {
        fromBuffer(buffer, { ...options2, lazyEntries: true }, function(err, zipfile) {
          if (err) return reject(err);
          resolve(zipfile);
        });
      });
    }
    function fromRandomAccessReaderPromise(reader, totalSize, options2) {
      return new Promise((resolve, reject) => {
        fromRandomAccessReader(reader, totalSize, { ...options2, lazyEntries: true }, function(err, zipfile) {
          if (err) return reject(err);
          resolve(zipfile);
        });
      });
    }
    function open(path8, options2, callback) {
      if (typeof options2 === "function") {
        callback = options2;
        options2 = null;
      }
      if (options2 == null) options2 = {};
      if (options2.autoClose == null) options2.autoClose = true;
      if (options2.lazyEntries == null) options2.lazyEntries = false;
      if (options2.decodeStrings == null) options2.decodeStrings = true;
      if (options2.validateEntrySizes == null) options2.validateEntrySizes = true;
      if (options2.strictFileNames == null) options2.strictFileNames = false;
      if (callback == null) callback = defaultCallback;
      fs10.open(path8, "r", function(err, fd) {
        if (err) return callback(err);
        fromFd(fd, options2, function(err2, zipfile) {
          if (err2) fs10.close(fd, defaultCallback);
          callback(err2, zipfile);
        });
      });
    }
    function fromFd(fd, options2, callback) {
      if (typeof options2 === "function") {
        callback = options2;
        options2 = null;
      }
      if (options2 == null) options2 = {};
      if (options2.autoClose == null) options2.autoClose = false;
      if (options2.lazyEntries == null) options2.lazyEntries = false;
      if (options2.decodeStrings == null) options2.decodeStrings = true;
      if (options2.validateEntrySizes == null) options2.validateEntrySizes = true;
      if (options2.strictFileNames == null) options2.strictFileNames = false;
      if (callback == null) callback = defaultCallback;
      fs10.fstat(fd, function(err, stats) {
        if (err) return callback(err);
        var reader = new fd_slicer.FdSlicer(fd);
        fromRandomAccessReader(reader, stats.size, options2, callback);
      });
    }
    function fromBuffer(buffer, options2, callback) {
      if (typeof options2 === "function") {
        callback = options2;
        options2 = null;
      }
      if (options2 == null) options2 = {};
      options2.autoClose = false;
      if (options2.lazyEntries == null) options2.lazyEntries = false;
      if (options2.decodeStrings == null) options2.decodeStrings = true;
      if (options2.validateEntrySizes == null) options2.validateEntrySizes = true;
      if (options2.strictFileNames == null) options2.strictFileNames = false;
      var reader = new fd_slicer.BufferSlicer(buffer);
      fromRandomAccessReader(reader, buffer.length, options2, callback);
    }
    function fromRandomAccessReader(reader, totalSize, options2, callback) {
      if (typeof options2 === "function") {
        callback = options2;
        options2 = null;
      }
      if (options2 == null) options2 = {};
      if (options2.autoClose == null) options2.autoClose = true;
      if (options2.lazyEntries == null) options2.lazyEntries = false;
      if (options2.decodeStrings == null) options2.decodeStrings = true;
      var decodeStrings = !!options2.decodeStrings;
      if (options2.validateEntrySizes == null) options2.validateEntrySizes = true;
      if (options2.strictFileNames == null) options2.strictFileNames = false;
      if (callback == null) callback = defaultCallback;
      if (typeof totalSize !== "number") throw new Error("expected totalSize parameter to be a number");
      if (totalSize > Number.MAX_SAFE_INTEGER) {
        throw new Error("zip file too large. only file sizes up to 2^52 are supported due to JavaScript's Number type being an IEEE 754 double.");
      }
      reader.ref();
      var eocdrWithoutCommentSize = 22;
      var zip64EocdlSize = 20;
      var maxCommentSize = 65535;
      var bufferSize = Math.min(zip64EocdlSize + eocdrWithoutCommentSize + maxCommentSize, totalSize);
      var buffer = newBuffer(bufferSize);
      var bufferReadStart = totalSize - buffer.length;
      readAndAssertNoEof(reader, buffer, 0, bufferSize, bufferReadStart, function(err) {
        if (err) return callback(err);
        for (var i = bufferSize - eocdrWithoutCommentSize; i >= 0; i -= 1) {
          if (buffer.readUInt32LE(i) !== 101010256) continue;
          var eocdrBuffer = buffer.subarray(i);
          var diskNumber = eocdrBuffer.readUInt16LE(4);
          var entryCount = eocdrBuffer.readUInt16LE(10);
          var centralDirectoryOffset = eocdrBuffer.readUInt32LE(16);
          var commentLength = eocdrBuffer.readUInt16LE(20);
          var expectedCommentLength = eocdrBuffer.length - eocdrWithoutCommentSize;
          if (commentLength !== expectedCommentLength) {
            return callback(new Error("Invalid comment length. Expected: " + expectedCommentLength + ". Found: " + commentLength + ". Are there extra bytes at the end of the file? Or is the end of central dir signature `PK\u263A\u263B` in the comment?"));
          }
          var comment = decodeStrings ? decodeBuffer(eocdrBuffer.subarray(22), false) : eocdrBuffer.subarray(22);
          if (i - zip64EocdlSize >= 0 && buffer.readUInt32LE(i - zip64EocdlSize) === 117853008) {
            var zip64EocdlBuffer = buffer.subarray(i - zip64EocdlSize, i - zip64EocdlSize + zip64EocdlSize);
            var zip64EocdrOffset = readUInt64LE(zip64EocdlBuffer, 8);
            var zip64EocdrBuffer = newBuffer(56);
            return readAndAssertNoEof(reader, zip64EocdrBuffer, 0, zip64EocdrBuffer.length, zip64EocdrOffset, function(err2) {
              if (err2) return callback(err2);
              if (zip64EocdrBuffer.readUInt32LE(0) !== 101075792) {
                return callback(new Error("invalid zip64 end of central directory record signature"));
              }
              diskNumber = zip64EocdrBuffer.readUInt32LE(16);
              if (diskNumber !== 0) {
                return callback(new Error("multi-disk zip files are not supported: found disk number: " + diskNumber));
              }
              entryCount = readUInt64LE(zip64EocdrBuffer, 32);
              centralDirectoryOffset = readUInt64LE(zip64EocdrBuffer, 48);
              return callback(null, new ZipFile(reader, centralDirectoryOffset, totalSize, entryCount, comment, options2.autoClose, options2.lazyEntries, decodeStrings, options2.validateEntrySizes, options2.strictFileNames));
            });
          }
          if (diskNumber !== 0) {
            return callback(new Error("multi-disk zip files are not supported: found disk number: " + diskNumber));
          }
          return callback(null, new ZipFile(reader, centralDirectoryOffset, totalSize, entryCount, comment, options2.autoClose, options2.lazyEntries, decodeStrings, options2.validateEntrySizes, options2.strictFileNames));
        }
        callback(new Error("End of central directory record signature not found. Either not a zip file, or file is truncated."));
      });
    }
    util.inherits(ZipFile, EventEmitter);
    function ZipFile(reader, centralDirectoryOffset, fileSize, entryCount, comment, autoClose, lazyEntries, decodeStrings, validateEntrySizes, strictFileNames) {
      var self = this;
      EventEmitter.call(self);
      self.reader = reader;
      self.reader.on("error", function(err) {
        emitError(self, err);
      });
      self.reader.once("close", function() {
        self.emit("close");
      });
      self.readEntryCursor = centralDirectoryOffset;
      self.fileSize = fileSize;
      self.entryCount = entryCount;
      self.comment = comment;
      self.entriesRead = 0;
      self.autoClose = !!autoClose;
      self.lazyEntries = !!lazyEntries;
      self.decodeStrings = !!decodeStrings;
      self.validateEntrySizes = !!validateEntrySizes;
      self.strictFileNames = !!strictFileNames;
      self.isOpen = true;
      self.emittedError = false;
      self.hasEachEntryBeenCalled = false;
      if (!self.lazyEntries) self._readEntry();
    }
    ZipFile.prototype.close = function() {
      if (!this.isOpen) return;
      this.isOpen = false;
      this.reader.unref();
    };
    function emitErrorAndAutoClose(self, err) {
      if (self.autoClose) self.close();
      emitError(self, err);
    }
    function emitError(self, err) {
      if (self.emittedError) return;
      self.emittedError = true;
      self.emit("error", err);
    }
    ZipFile.prototype.readEntry = function() {
      if (!this.lazyEntries) throw new Error("readEntry() called without lazyEntries:true");
      this._readEntry();
    };
    ZipFile.prototype._readEntry = function() {
      var self = this;
      if (self.entryCount === self.entriesRead) {
        setImmediate(function() {
          if (self.autoClose) self.close();
          if (self.emittedError) return;
          self.emit("end");
        });
        return;
      }
      if (self.emittedError) return;
      var buffer = newBuffer(46);
      readAndAssertNoEof(self.reader, buffer, 0, buffer.length, self.readEntryCursor, function(err) {
        if (err) return emitErrorAndAutoClose(self, err);
        if (self.emittedError) return;
        var entry = new Entry();
        var signature = buffer.readUInt32LE(0);
        if (signature !== 33639248) return emitErrorAndAutoClose(self, new Error("invalid central directory file header signature: 0x" + signature.toString(16)));
        entry.versionMadeBy = buffer.readUInt16LE(4);
        entry.versionNeededToExtract = buffer.readUInt16LE(6);
        entry.generalPurposeBitFlag = buffer.readUInt16LE(8);
        entry.compressionMethod = buffer.readUInt16LE(10);
        entry.lastModFileTime = buffer.readUInt16LE(12);
        entry.lastModFileDate = buffer.readUInt16LE(14);
        entry.crc32 = buffer.readUInt32LE(16);
        entry.compressedSize = buffer.readUInt32LE(20);
        entry.uncompressedSize = buffer.readUInt32LE(24);
        entry.fileNameLength = buffer.readUInt16LE(28);
        entry.extraFieldLength = buffer.readUInt16LE(30);
        entry.fileCommentLength = buffer.readUInt16LE(32);
        entry.internalFileAttributes = buffer.readUInt16LE(36);
        entry.externalFileAttributes = buffer.readUInt32LE(38);
        entry.relativeOffsetOfLocalHeader = buffer.readUInt32LE(42);
        if (entry.generalPurposeBitFlag & 64) return emitErrorAndAutoClose(self, new Error("strong encryption is not supported"));
        self.readEntryCursor += 46;
        buffer = newBuffer(entry.fileNameLength + entry.extraFieldLength + entry.fileCommentLength);
        readAndAssertNoEof(self.reader, buffer, 0, buffer.length, self.readEntryCursor, function(err2) {
          if (err2) return emitErrorAndAutoClose(self, err2);
          if (self.emittedError) return;
          entry.fileNameRaw = buffer.subarray(0, entry.fileNameLength);
          var fileCommentStart = entry.fileNameLength + entry.extraFieldLength;
          entry.extraFieldRaw = buffer.subarray(entry.fileNameLength, fileCommentStart);
          entry.fileCommentRaw = buffer.subarray(fileCommentStart, fileCommentStart + entry.fileCommentLength);
          try {
            entry.extraFields = parseExtraFields(entry.extraFieldRaw);
          } catch (err3) {
            return emitErrorAndAutoClose(self, err3);
          }
          if (self.decodeStrings) {
            var isUtf8 = (entry.generalPurposeBitFlag & 2048) !== 0;
            entry.fileComment = decodeBuffer(entry.fileCommentRaw, isUtf8);
            entry.fileName = getFileNameLowLevel(entry.generalPurposeBitFlag, entry.fileNameRaw, entry.extraFields, self.strictFileNames);
            var errorMessage = validateFileName(entry.fileName);
            if (errorMessage != null) return emitErrorAndAutoClose(self, new Error(errorMessage));
          } else {
            entry.fileComment = entry.fileCommentRaw;
            entry.fileName = entry.fileNameRaw;
          }
          entry.comment = entry.fileComment;
          self.readEntryCursor += buffer.length;
          self.entriesRead += 1;
          for (var i = 0; i < entry.extraFields.length; i++) {
            var extraField = entry.extraFields[i];
            if (extraField.id !== 1) continue;
            var zip64EiefBuffer = extraField.data;
            var index = 0;
            if (entry.uncompressedSize === 4294967295) {
              if (index + 8 > zip64EiefBuffer.length) {
                return emitErrorAndAutoClose(self, new Error("zip64 extended information extra field does not include uncompressed size"));
              }
              entry.uncompressedSize = readUInt64LE(zip64EiefBuffer, index);
              index += 8;
            }
            if (entry.compressedSize === 4294967295) {
              if (index + 8 > zip64EiefBuffer.length) {
                return emitErrorAndAutoClose(self, new Error("zip64 extended information extra field does not include compressed size"));
              }
              entry.compressedSize = readUInt64LE(zip64EiefBuffer, index);
              index += 8;
            }
            if (entry.relativeOffsetOfLocalHeader === 4294967295) {
              if (index + 8 > zip64EiefBuffer.length) {
                return emitErrorAndAutoClose(self, new Error("zip64 extended information extra field does not include relative header offset"));
              }
              entry.relativeOffsetOfLocalHeader = readUInt64LE(zip64EiefBuffer, index);
              index += 8;
            }
            break;
          }
          if (self.validateEntrySizes && entry.compressionMethod === 0) {
            var expectedCompressedSize = entry.uncompressedSize;
            if (entry.isEncrypted()) {
              expectedCompressedSize += 12;
            }
            if (entry.compressedSize !== expectedCompressedSize) {
              var msg = "compressed/uncompressed size mismatch for stored file: " + entry.compressedSize + " != " + entry.uncompressedSize;
              return emitErrorAndAutoClose(self, new Error(msg));
            }
          }
          self.emit("entry", entry);
          if (!self.lazyEntries) self._readEntry();
        });
      });
    };
    ZipFile.prototype.eachEntry = function() {
      const self = this;
      if (!self.lazyEntries) throw new Error("eachEntry() requires lazyEntries: true");
      if (self.hasEachEntryBeenCalled) throw new Error("eachEntry() must only be called once per ZipFile");
      self.hasEachEntryBeenCalled = true;
      let pendingResolveReject = null;
      self.on("entry", onEntry);
      self.on("end", onEnd);
      self.on("error", onError);
      function cleanup() {
        self.removeListener("entry", onEntry);
        self.removeListener("end", onEnd);
        self.removeListener("error", onError);
        if (self.autoClose) self.close();
      }
      function onEntry(entry) {
        let { resolve } = pendingResolveReject;
        pendingResolveReject = null;
        resolve({ value: entry });
      }
      function onEnd() {
        let { resolve } = pendingResolveReject;
        pendingResolveReject = null;
        cleanup();
        resolve({ done: true });
      }
      function onError(err) {
        let { reject } = pendingResolveReject;
        pendingResolveReject = null;
        cleanup();
        reject(err);
      }
      return {
        [Symbol.asyncIterator]() {
          return this;
        },
        next() {
          const promise = new Promise((resolve, reject) => {
            if (pendingResolveReject != null) throw new Error("next() called before previous Promise was resolved.");
            pendingResolveReject = { resolve, reject };
          });
          self.readEntry();
          return promise;
        },
        return(value) {
          cleanup();
          return Promise.resolve({ done: true, value });
        },
        throw(value) {
          cleanup();
          return Promise.reject(value);
        }
      };
    };
    ZipFile.prototype.openReadStream = function(entry, options2, callback) {
      var self = this;
      var relativeStart = 0;
      var relativeEnd = entry.compressedSize;
      if (callback == null) {
        callback = options2;
        options2 = null;
      }
      if (options2 == null) {
        options2 = {};
      } else {
        if (options2.decodeFileData === false) {
          if (options2.decrypt != null) {
            throw new Error("cannot use options.decrypt when options.decodeFileData === false");
          }
          if (options2.decompress != null) {
            throw new Error("cannot use options.decompress when options.decodeFileData === false");
          }
        } else {
          if (options2.decrypt != null) {
            if (!entry.isEncrypted()) {
              throw new Error("options.decrypt can only be specified for encrypted entries. See also option decodeFileData.");
            }
            if (options2.decrypt !== false) throw new Error("invalid options.decrypt value: " + options2.decrypt);
            if (entry.isCompressed()) {
              if (options2.decompress !== false) throw new Error("entry is encrypted and compressed, and options.decompress !== false. See also option decodeFileData.");
            }
          }
          if (options2.decompress != null) {
            if (!entry.isCompressed()) {
              throw new Error("options.decompress can only be specified for compressed entries. See also option decodeFileData.");
            }
            if (!(options2.decompress === false || options2.decompress === true)) {
              throw new Error("invalid options.decompress value: " + options2.decompress);
            }
            decompress = options2.decompress;
          }
        }
        if (options2.start != null) {
          relativeStart = options2.start;
          if (relativeStart < 0) throw new Error("options.start < 0");
          if (relativeStart > entry.compressedSize) throw new Error("options.start > entry.compressedSize");
        }
        if (options2.end != null) {
          relativeEnd = options2.end;
          if (relativeEnd < 0) throw new Error("options.end < 0");
          if (relativeEnd > entry.compressedSize) throw new Error("options.end > entry.compressedSize");
          if (relativeEnd < relativeStart) throw new Error("options.end < options.start");
        }
      }
      var rawMode = options2.decodeFileData === false || // Explicitly requested raw.
      (entry.compressionMethod === 0 || // Naturally without compression.
      entry.compressionMethod === 8 && options2.decompress === false) && (!entry.isEncrypted() || // Naturally without encryption.
      options2.decrypt === false);
      if (options2.start != null || options2.end != null) {
        if (!rawMode) throw new Error("start/end range require options.decodeFileData === false for non-trivial encoded entries.");
      }
      if (!self.isOpen) return callback(new Error("closed"));
      if (entry.isEncrypted() && !rawMode) {
        if (options2.decrypt !== false) return callback(new Error("entry is encrypted, and options.decodeFileData !== false"));
      }
      var decompress;
      if (rawMode) {
        decompress = false;
      } else if (entry.compressionMethod === 8) {
        decompress = options2.decodeFileData !== true;
      } else {
        return callback(new Error("unsupported compression method: " + entry.compressionMethod));
      }
      self.readLocalFileHeader(entry, { minimal: true }, function(err, localFileHeader) {
        if (err) return callback(err);
        self.openReadStreamLowLevel(
          localFileHeader.fileDataStart,
          entry.compressedSize,
          relativeStart,
          relativeEnd,
          decompress,
          entry.uncompressedSize,
          callback
        );
      });
    };
    ZipFile.prototype.openReadStreamLowLevel = function(fileDataStart, compressedSize, relativeStart, relativeEnd, decompress, uncompressedSize, callback) {
      var self = this;
      var fileDataEnd = fileDataStart + compressedSize;
      var readStream = self.reader.createReadStream({
        start: fileDataStart + relativeStart,
        end: fileDataStart + relativeEnd
      });
      var endpointStream = readStream;
      if (decompress) {
        var destroyed = false;
        var inflateFilter = zlib2.createInflateRaw();
        readStream.on("error", function(err) {
          setImmediate(function() {
            if (!destroyed) inflateFilter.emit("error", err);
          });
        });
        readStream.pipe(inflateFilter);
        if (self.validateEntrySizes) {
          endpointStream = new AssertByteCountStream(uncompressedSize);
          inflateFilter.on("error", function(err) {
            setImmediate(function() {
              if (!destroyed) endpointStream.emit("error", err);
            });
          });
          inflateFilter.pipe(endpointStream);
        } else {
          endpointStream = inflateFilter;
        }
        installDestroyFn(endpointStream, function() {
          destroyed = true;
          if (inflateFilter !== endpointStream) inflateFilter.unpipe(endpointStream);
          readStream.unpipe(inflateFilter);
          readStream.destroy();
        });
      }
      callback(null, endpointStream);
    };
    ZipFile.prototype.readLocalFileHeader = function(entry, options2, callback) {
      var self = this;
      if (callback == null) {
        callback = options2;
        options2 = null;
      }
      if (options2 == null) options2 = {};
      self.reader.ref();
      var buffer = newBuffer(30);
      readAndAssertNoEof(self.reader, buffer, 0, buffer.length, entry.relativeOffsetOfLocalHeader, function(err) {
        try {
          if (err) return callback(err);
          var signature = buffer.readUInt32LE(0);
          if (signature !== 67324752) {
            return callback(new Error("invalid local file header signature: 0x" + signature.toString(16)));
          }
          var fileNameLength = buffer.readUInt16LE(26);
          var extraFieldLength = buffer.readUInt16LE(28);
          var fileDataStart = entry.relativeOffsetOfLocalHeader + 30 + fileNameLength + extraFieldLength;
          if (fileDataStart + entry.compressedSize > self.fileSize) {
            return callback(new Error("file data overflows file bounds: " + fileDataStart + " + " + entry.compressedSize + " > " + self.fileSize));
          }
          if (options2.minimal) {
            return callback(null, { fileDataStart });
          }
          var localFileHeader = new LocalFileHeader();
          localFileHeader.fileDataStart = fileDataStart;
          localFileHeader.versionNeededToExtract = buffer.readUInt16LE(4);
          localFileHeader.generalPurposeBitFlag = buffer.readUInt16LE(6);
          localFileHeader.compressionMethod = buffer.readUInt16LE(8);
          localFileHeader.lastModFileTime = buffer.readUInt16LE(10);
          localFileHeader.lastModFileDate = buffer.readUInt16LE(12);
          localFileHeader.crc32 = buffer.readUInt32LE(14);
          localFileHeader.compressedSize = buffer.readUInt32LE(18);
          localFileHeader.uncompressedSize = buffer.readUInt32LE(22);
          localFileHeader.fileNameLength = fileNameLength;
          localFileHeader.extraFieldLength = extraFieldLength;
          buffer = newBuffer(fileNameLength + extraFieldLength);
          self.reader.ref();
          readAndAssertNoEof(self.reader, buffer, 0, buffer.length, entry.relativeOffsetOfLocalHeader + 30, function(err2) {
            try {
              if (err2) return callback(err2);
              localFileHeader.fileName = buffer.subarray(0, fileNameLength);
              localFileHeader.extraField = buffer.subarray(fileNameLength);
              return callback(null, localFileHeader);
            } finally {
              self.reader.unref();
            }
          });
        } finally {
          self.reader.unref();
        }
      });
    };
    ZipFile.prototype.openReadStreamPromise = function(entry, options2) {
      return new Promise((resolve, reject) => {
        this.openReadStream(entry, options2, function(err, readStream) {
          if (err) return reject(err);
          resolve(readStream);
        });
      });
    };
    ZipFile.prototype.openReadStreamLowLevelPromise = function(fileDataStart, compressedSize, relativeStart, relativeEnd, decompress, uncompressedSize) {
      return new Promise((resolve, reject) => {
        this.openReadStream(fileDataStart, compressedSize, relativeStart, relativeEnd, decompress, uncompressedSize, function(err, readStream) {
          if (err) return reject(err);
          resolve(readStream);
        });
      });
    };
    ZipFile.prototype.readLocalFileHeaderPromise = function(entry, options2) {
      return new Promise((resolve, reject) => {
        this.readLocalFileHeader(entry, options2, function(err, localFileHeader) {
          if (err) return reject(err);
          resolve(localFileHeader);
        });
      });
    };
    function Entry() {
    }
    Entry.prototype.getLastModDate = function(options2) {
      if (options2 == null) options2 = {};
      if (!options2.forceDosFormat) {
        for (var i = 0; i < this.extraFields.length; i++) {
          var extraField = this.extraFields[i];
          if (extraField.id === 21589) {
            var data = extraField.data;
            if (data.length < 5) continue;
            var flags = data[0];
            var HAS_MTIME = 1;
            if (!(flags & HAS_MTIME)) continue;
            var posixTimestamp = data.readInt32LE(1);
            return new Date(posixTimestamp * 1e3);
          } else if (extraField.id === 10) {
            var data = extraField.data;
            if (data.length !== 32) continue;
            if (data.readUInt16LE(4) !== 1) continue;
            if (data.readUInt16LE(6) !== 24) continue;
            var hundredNanoSecondsSince1601 = data.readUInt32LE(8) + 4294967296 * data.readInt32LE(12);
            var millisecondsSince1970 = hundredNanoSecondsSince1601 / 1e4 - 116444736e5;
            return new Date(millisecondsSince1970);
          }
        }
      }
      return dosDateTimeToDate(this.lastModFileDate, this.lastModFileTime, options2.timezone);
    };
    Entry.prototype.canDecodeFileData = function() {
      return !this.isEncrypted() && (this.compressionMethod === 0 || this.compressionMethod === 8);
    };
    Entry.prototype.isEncrypted = function() {
      return (this.generalPurposeBitFlag & 1) !== 0;
    };
    Entry.prototype.isCompressed = function() {
      return this.compressionMethod === 8;
    };
    function LocalFileHeader() {
    }
    function dosDateTimeToDate(date, time, timezone) {
      var day = date & 31;
      var month = (date >> 5 & 15) - 1;
      var year = (date >> 9 & 127) + 1980;
      var millisecond = 0;
      var second = (time & 31) * 2;
      var minute = time >> 5 & 63;
      var hour = time >> 11 & 31;
      if (timezone == null || timezone === "local") {
        return new Date(year, month, day, hour, minute, second, millisecond);
      } else if (timezone === "UTC") {
        return new Date(Date.UTC(year, month, day, hour, minute, second, millisecond));
      } else {
        throw new Error("unrecognized options.timezone: " + options.timezone);
      }
    }
    function getFileNameLowLevel(generalPurposeBitFlag, fileNameBuffer, extraFields, strictFileNames) {
      var fileName = null;
      for (var i = 0; i < extraFields.length; i++) {
        var extraField = extraFields[i];
        if (extraField.id === 28789) {
          if (extraField.data.length < 6) {
            continue;
          }
          if (extraField.data.readUInt8(0) !== 1) {
            continue;
          }
          var oldNameCrc32 = extraField.data.readUInt32LE(1);
          if (crc323(fileNameBuffer) !== oldNameCrc32) {
            continue;
          }
          fileName = decodeBuffer(extraField.data.subarray(5), true);
          break;
        }
      }
      if (fileName == null) {
        var isUtf8 = (generalPurposeBitFlag & 2048) !== 0;
        fileName = decodeBuffer(fileNameBuffer, isUtf8);
      }
      if (!strictFileNames) {
        fileName = fileName.replace(/\\/g, "/");
      }
      return fileName;
    }
    function validateFileName(fileName) {
      if (fileName.indexOf("\\") !== -1) {
        return "invalid characters in fileName: " + fileName;
      }
      if (/^[a-zA-Z]:/.test(fileName) || /^\//.test(fileName)) {
        return "absolute path: " + fileName;
      }
      if (fileName.split("/").indexOf("..") !== -1) {
        return "invalid relative path: " + fileName;
      }
      return null;
    }
    function parseExtraFields(extraFieldBuffer) {
      var extraFields = [];
      var i = 0;
      while (i < extraFieldBuffer.length - 3) {
        var headerId = extraFieldBuffer.readUInt16LE(i + 0);
        var dataSize = extraFieldBuffer.readUInt16LE(i + 2);
        var dataStart = i + 4;
        var dataEnd = dataStart + dataSize;
        if (dataEnd > extraFieldBuffer.length) throw new Error("extra field length exceeds extra field buffer size");
        var dataBuffer = extraFieldBuffer.subarray(dataStart, dataEnd);
        extraFields.push({
          id: headerId,
          data: dataBuffer
        });
        i = dataEnd;
      }
      return extraFields;
    }
    function readAndAssertNoEof(reader, buffer, offset, length, position, callback) {
      if (length === 0) {
        return setImmediate(function() {
          callback(null, newBuffer(0));
        });
      }
      reader.read(buffer, offset, length, position, function(err, bytesRead) {
        if (err) return callback(err);
        if (bytesRead < length) {
          return callback(new Error("unexpected EOF"));
        }
        callback();
      });
    }
    util.inherits(AssertByteCountStream, Transform);
    function AssertByteCountStream(byteCount) {
      Transform.call(this);
      this.actualByteCount = 0;
      this.expectedByteCount = byteCount;
    }
    AssertByteCountStream.prototype._transform = function(chunk, encoding, cb) {
      this.actualByteCount += chunk.length;
      if (this.actualByteCount > this.expectedByteCount) {
        var msg = "too many bytes in the stream. expected " + this.expectedByteCount + ". got at least " + this.actualByteCount;
        return cb(new Error(msg));
      }
      cb(null, chunk);
    };
    AssertByteCountStream.prototype._flush = function(cb) {
      if (this.actualByteCount < this.expectedByteCount) {
        var msg = "not enough bytes in the stream. expected " + this.expectedByteCount + ". got only " + this.actualByteCount;
        return cb(new Error(msg));
      }
      cb();
    };
    util.inherits(RandomAccessReader, EventEmitter);
    function RandomAccessReader() {
      EventEmitter.call(this);
      this.refCount = 0;
    }
    RandomAccessReader.prototype.ref = function() {
      this.refCount += 1;
    };
    RandomAccessReader.prototype.unref = function() {
      var self = this;
      self.refCount -= 1;
      if (self.refCount > 0) return;
      if (self.refCount < 0) throw new Error("invalid unref");
      self.close(onCloseDone);
      function onCloseDone(err) {
        if (err) return self.emit("error", err);
        self.emit("close");
      }
    };
    RandomAccessReader.prototype.createReadStream = function(options2) {
      if (options2 == null) options2 = {};
      var start = options2.start;
      var end = options2.end;
      if (start === end) {
        var emptyStream = new PassThrough();
        setImmediate(function() {
          emptyStream.end();
        });
        return emptyStream;
      }
      var stream = this._readStreamForRange(start, end);
      var destroyed = false;
      var refUnrefFilter = new RefUnrefFilter(this);
      stream.on("error", function(err) {
        setImmediate(function() {
          if (!destroyed) refUnrefFilter.emit("error", err);
        });
      });
      installDestroyFn(refUnrefFilter, function() {
        stream.unpipe(refUnrefFilter);
        refUnrefFilter.unref();
        stream.destroy();
      });
      var byteCounter = new AssertByteCountStream(end - start);
      refUnrefFilter.on("error", function(err) {
        setImmediate(function() {
          if (!destroyed) byteCounter.emit("error", err);
        });
      });
      installDestroyFn(byteCounter, function() {
        destroyed = true;
        refUnrefFilter.unpipe(byteCounter);
        refUnrefFilter.destroy();
      });
      return stream.pipe(refUnrefFilter).pipe(byteCounter);
    };
    RandomAccessReader.prototype._readStreamForRange = function(start, end) {
      throw new Error("not implemented");
    };
    RandomAccessReader.prototype.read = function(buffer, offset, length, position, callback) {
      var readStream = this.createReadStream({ start: position, end: position + length });
      var writeStream = new Writable();
      var written = 0;
      writeStream._write = function(chunk, encoding, cb) {
        chunk.copy(buffer, offset + written, 0, chunk.length);
        written += chunk.length;
        cb();
      };
      writeStream.on("finish", callback);
      readStream.on("error", function(error) {
        callback(error);
      });
      readStream.pipe(writeStream);
    };
    RandomAccessReader.prototype.close = function(callback) {
      setImmediate(callback);
    };
    util.inherits(RefUnrefFilter, PassThrough);
    function RefUnrefFilter(context2) {
      PassThrough.call(this);
      this.context = context2;
      this.context.ref();
      this.unreffedYet = false;
    }
    RefUnrefFilter.prototype._flush = function(cb) {
      this.unref();
      cb();
    };
    RefUnrefFilter.prototype.unref = function(cb) {
      if (this.unreffedYet) return;
      this.unreffedYet = true;
      this.context.unref();
    };
    var cp437 = "\0\u263A\u263B\u2665\u2666\u2663\u2660\u2022\u25D8\u25CB\u25D9\u2642\u2640\u266A\u266B\u263C\u25BA\u25C4\u2195\u203C\xB6\xA7\u25AC\u21A8\u2191\u2193\u2192\u2190\u221F\u2194\u25B2\u25BC !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~\u2302\xC7\xFC\xE9\xE2\xE4\xE0\xE5\xE7\xEA\xEB\xE8\xEF\xEE\xEC\xC4\xC5\xC9\xE6\xC6\xF4\xF6\xF2\xFB\xF9\xFF\xD6\xDC\xA2\xA3\xA5\u20A7\u0192\xE1\xED\xF3\xFA\xF1\xD1\xAA\xBA\xBF\u2310\xAC\xBD\xBC\xA1\xAB\xBB\u2591\u2592\u2593\u2502\u2524\u2561\u2562\u2556\u2555\u2563\u2551\u2557\u255D\u255C\u255B\u2510\u2514\u2534\u252C\u251C\u2500\u253C\u255E\u255F\u255A\u2554\u2569\u2566\u2560\u2550\u256C\u2567\u2568\u2564\u2565\u2559\u2558\u2552\u2553\u256B\u256A\u2518\u250C\u2588\u2584\u258C\u2590\u2580\u03B1\xDF\u0393\u03C0\u03A3\u03C3\xB5\u03C4\u03A6\u0398\u03A9\u03B4\u221E\u03C6\u03B5\u2229\u2261\xB1\u2265\u2264\u2320\u2321\xF7\u2248\xB0\u2219\xB7\u221A\u207F\xB2\u25A0\xA0";
    function decodeBuffer(buffer, isUtf8) {
      if (isUtf8) {
        return buffer.toString("utf8");
      } else {
        var result = "";
        for (var i = 0; i < buffer.length; i++) {
          result += cp437[buffer[i]];
        }
        return result;
      }
    }
    function readUInt64LE(buffer, offset) {
      var lower32 = buffer.readUInt32LE(offset);
      var upper32 = buffer.readUInt32LE(offset + 4);
      return upper32 * 4294967296 + lower32;
    }
    var newBuffer;
    if (typeof Buffer.allocUnsafe === "function") {
      newBuffer = function(len) {
        return Buffer.allocUnsafe(len);
      };
    } else {
      newBuffer = function(len) {
        return new Buffer(len);
      };
    }
    function installDestroyFn(stream, fn) {
      if (typeof stream.destroy === "function") {
        stream._destroy = function(err, cb) {
          fn();
          if (cb != null) cb(err);
        };
      } else {
        stream.destroy = fn;
      }
    }
    function defaultCallback(err) {
      if (err) throw err;
    }
  }
});

// node_modules/buffer-crc32/dist/index.cjs
var require_dist = __commonJS({
  "node_modules/buffer-crc32/dist/index.cjs"(exports, module) {
    "use strict";
    function getDefaultExportFromCjs(x) {
      return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
    }
    var CRC_TABLE = new Int32Array([
      0,
      1996959894,
      3993919788,
      2567524794,
      124634137,
      1886057615,
      3915621685,
      2657392035,
      249268274,
      2044508324,
      3772115230,
      2547177864,
      162941995,
      2125561021,
      3887607047,
      2428444049,
      498536548,
      1789927666,
      4089016648,
      2227061214,
      450548861,
      1843258603,
      4107580753,
      2211677639,
      325883990,
      1684777152,
      4251122042,
      2321926636,
      335633487,
      1661365465,
      4195302755,
      2366115317,
      997073096,
      1281953886,
      3579855332,
      2724688242,
      1006888145,
      1258607687,
      3524101629,
      2768942443,
      901097722,
      1119000684,
      3686517206,
      2898065728,
      853044451,
      1172266101,
      3705015759,
      2882616665,
      651767980,
      1373503546,
      3369554304,
      3218104598,
      565507253,
      1454621731,
      3485111705,
      3099436303,
      671266974,
      1594198024,
      3322730930,
      2970347812,
      795835527,
      1483230225,
      3244367275,
      3060149565,
      1994146192,
      31158534,
      2563907772,
      4023717930,
      1907459465,
      112637215,
      2680153253,
      3904427059,
      2013776290,
      251722036,
      2517215374,
      3775830040,
      2137656763,
      141376813,
      2439277719,
      3865271297,
      1802195444,
      476864866,
      2238001368,
      4066508878,
      1812370925,
      453092731,
      2181625025,
      4111451223,
      1706088902,
      314042704,
      2344532202,
      4240017532,
      1658658271,
      366619977,
      2362670323,
      4224994405,
      1303535960,
      984961486,
      2747007092,
      3569037538,
      1256170817,
      1037604311,
      2765210733,
      3554079995,
      1131014506,
      879679996,
      2909243462,
      3663771856,
      1141124467,
      855842277,
      2852801631,
      3708648649,
      1342533948,
      654459306,
      3188396048,
      3373015174,
      1466479909,
      544179635,
      3110523913,
      3462522015,
      1591671054,
      702138776,
      2966460450,
      3352799412,
      1504918807,
      783551873,
      3082640443,
      3233442989,
      3988292384,
      2596254646,
      62317068,
      1957810842,
      3939845945,
      2647816111,
      81470997,
      1943803523,
      3814918930,
      2489596804,
      225274430,
      2053790376,
      3826175755,
      2466906013,
      167816743,
      2097651377,
      4027552580,
      2265490386,
      503444072,
      1762050814,
      4150417245,
      2154129355,
      426522225,
      1852507879,
      4275313526,
      2312317920,
      282753626,
      1742555852,
      4189708143,
      2394877945,
      397917763,
      1622183637,
      3604390888,
      2714866558,
      953729732,
      1340076626,
      3518719985,
      2797360999,
      1068828381,
      1219638859,
      3624741850,
      2936675148,
      906185462,
      1090812512,
      3747672003,
      2825379669,
      829329135,
      1181335161,
      3412177804,
      3160834842,
      628085408,
      1382605366,
      3423369109,
      3138078467,
      570562233,
      1426400815,
      3317316542,
      2998733608,
      733239954,
      1555261956,
      3268935591,
      3050360625,
      752459403,
      1541320221,
      2607071920,
      3965973030,
      1969922972,
      40735498,
      2617837225,
      3943577151,
      1913087877,
      83908371,
      2512341634,
      3803740692,
      2075208622,
      213261112,
      2463272603,
      3855990285,
      2094854071,
      198958881,
      2262029012,
      4057260610,
      1759359992,
      534414190,
      2176718541,
      4139329115,
      1873836001,
      414664567,
      2282248934,
      4279200368,
      1711684554,
      285281116,
      2405801727,
      4167216745,
      1634467795,
      376229701,
      2685067896,
      3608007406,
      1308918612,
      956543938,
      2808555105,
      3495958263,
      1231636301,
      1047427035,
      2932959818,
      3654703836,
      1088359270,
      936918e3,
      2847714899,
      3736837829,
      1202900863,
      817233897,
      3183342108,
      3401237130,
      1404277552,
      615818150,
      3134207493,
      3453421203,
      1423857449,
      601450431,
      3009837614,
      3294710456,
      1567103746,
      711928724,
      3020668471,
      3272380065,
      1510334235,
      755167117
    ]);
    function ensureBuffer(input) {
      if (Buffer.isBuffer(input)) {
        return input;
      }
      if (typeof input === "number") {
        return Buffer.alloc(input);
      } else if (typeof input === "string") {
        return Buffer.from(input);
      } else {
        throw new Error("input must be buffer, number, or string, received " + typeof input);
      }
    }
    function bufferizeInt(num) {
      const tmp = ensureBuffer(4);
      tmp.writeInt32BE(num, 0);
      return tmp;
    }
    function _crc32(buf, previous) {
      buf = ensureBuffer(buf);
      if (Buffer.isBuffer(previous)) {
        previous = previous.readUInt32BE(0);
      }
      let crc = ~~previous ^ -1;
      for (var n = 0; n < buf.length; n++) {
        crc = CRC_TABLE[(crc ^ buf[n]) & 255] ^ crc >>> 8;
      }
      return crc ^ -1;
    }
    function crc323() {
      return bufferizeInt(_crc32.apply(null, arguments));
    }
    crc323.signed = function() {
      return _crc32.apply(null, arguments);
    };
    crc323.unsigned = function() {
      return _crc32.apply(null, arguments) >>> 0;
    };
    var bufferCrc32 = crc323;
    var index = /* @__PURE__ */ getDefaultExportFromCjs(bufferCrc32);
    module.exports = index;
  }
});

// node_modules/yazl/index.js
var require_yazl = __commonJS({
  "node_modules/yazl/index.js"(exports) {
    var fs10 = __require("fs");
    var Transform = __require("stream").Transform;
    var PassThrough = __require("stream").PassThrough;
    var zlib2 = __require("zlib");
    var util = __require("util");
    var EventEmitter = __require("events").EventEmitter;
    var errorMonitor = __require("events").errorMonitor;
    var crc323 = require_dist();
    exports.ZipFile = ZipFile;
    exports.dateToDosDateTime = dateToDosDateTime;
    util.inherits(ZipFile, EventEmitter);
    function ZipFile() {
      this.outputStream = new PassThrough();
      this.entries = [];
      this.outputStreamCursor = 0;
      this.ended = false;
      this.allDone = false;
      this.forceZip64Eocd = false;
      this.errored = false;
      this.on(errorMonitor, function() {
        this.errored = true;
      });
    }
    ZipFile.prototype.addFile = function(realPath, metadataPath, options2) {
      var self = this;
      metadataPath = validateMetadataPath(metadataPath, false);
      if (options2 == null) options2 = {};
      if (shouldIgnoreAdding(self)) return;
      var entry = new Entry(metadataPath, false, options2);
      self.entries.push(entry);
      fs10.stat(realPath, function(err, stats) {
        if (err) return self.emit("error", err);
        if (!stats.isFile()) return self.emit("error", new Error("not a file: " + realPath));
        entry.uncompressedSize = stats.size;
        if (options2.mtime == null) entry.setLastModDate(stats.mtime);
        if (options2.mode == null) entry.setFileAttributesMode(stats.mode);
        entry.setFileDataPumpFunction(function() {
          var readStream = fs10.createReadStream(realPath);
          entry.state = Entry.FILE_DATA_IN_PROGRESS;
          readStream.on("error", function(err2) {
            self.emit("error", err2);
          });
          pumpFileDataReadStream(self, entry, readStream);
        });
        pumpEntries(self);
      });
    };
    ZipFile.prototype.addReadStream = function(readStream, metadataPath, options2) {
      this.addReadStreamLazy(metadataPath, options2, function(cb) {
        cb(null, readStream);
      });
    };
    ZipFile.prototype.addReadStreamLazy = function(metadataPath, options2, getReadStreamFunction) {
      var self = this;
      if (typeof options2 === "function") {
        getReadStreamFunction = options2;
        options2 = null;
      }
      if (options2 == null) options2 = {};
      metadataPath = validateMetadataPath(metadataPath, false);
      if (shouldIgnoreAdding(self)) return;
      var entry = new Entry(metadataPath, false, options2);
      self.entries.push(entry);
      entry.setFileDataPumpFunction(function() {
        entry.state = Entry.FILE_DATA_IN_PROGRESS;
        getReadStreamFunction(function(err, readStream) {
          if (err) return self.emit("error", err);
          pumpFileDataReadStream(self, entry, readStream);
        });
      });
      pumpEntries(self);
    };
    ZipFile.prototype.addBuffer = function(buffer, metadataPath, options2) {
      var self = this;
      metadataPath = validateMetadataPath(metadataPath, false);
      if (buffer.length > 1073741823) throw new Error("buffer too large: " + buffer.length + " > 1073741823");
      if (options2 == null) options2 = {};
      if (options2.size != null) throw new Error("options.size not allowed");
      if (shouldIgnoreAdding(self)) return;
      var entry = new Entry(metadataPath, false, options2);
      entry.uncompressedSize = buffer.length;
      entry.crc32 = crc323.unsigned(buffer);
      entry.crcAndFileSizeKnown = true;
      self.entries.push(entry);
      if (entry.compressionLevel === 0) {
        setCompressedBuffer(buffer);
      } else {
        zlib2.deflateRaw(buffer, { level: entry.compressionLevel }, function(err, compressedBuffer) {
          setCompressedBuffer(compressedBuffer);
        });
      }
      function setCompressedBuffer(compressedBuffer) {
        entry.compressedSize = compressedBuffer.length;
        entry.setFileDataPumpFunction(function() {
          writeToOutputStream(self, compressedBuffer);
          writeToOutputStream(self, entry.getDataDescriptor());
          entry.state = Entry.FILE_DATA_DONE;
          setImmediate(function() {
            pumpEntries(self);
          });
        });
        pumpEntries(self);
      }
    };
    ZipFile.prototype.addEmptyDirectory = function(metadataPath, options2) {
      var self = this;
      metadataPath = validateMetadataPath(metadataPath, true);
      if (options2 == null) options2 = {};
      if (options2.size != null) throw new Error("options.size not allowed");
      if (options2.compress != null) throw new Error("options.compress not allowed");
      if (options2.compressionLevel != null) throw new Error("options.compressionLevel not allowed");
      if (shouldIgnoreAdding(self)) return;
      var entry = new Entry(metadataPath, true, options2);
      self.entries.push(entry);
      entry.setFileDataPumpFunction(function() {
        writeToOutputStream(self, entry.getDataDescriptor());
        entry.state = Entry.FILE_DATA_DONE;
        pumpEntries(self);
      });
      pumpEntries(self);
    };
    var eocdrSignatureBuffer = bufferFrom([80, 75, 5, 6]);
    ZipFile.prototype.end = function(options2, calculatedTotalSizeCallback) {
      if (typeof options2 === "function") {
        calculatedTotalSizeCallback = options2;
        options2 = null;
      }
      if (options2 == null) options2 = {};
      if (this.ended) return;
      this.ended = true;
      if (this.errored) return;
      this.calculatedTotalSizeCallback = calculatedTotalSizeCallback;
      this.forceZip64Eocd = !!options2.forceZip64Format;
      if (options2.comment) {
        if (typeof options2.comment === "string") {
          this.comment = encodeCp437(options2.comment);
        } else {
          this.comment = options2.comment;
        }
        if (this.comment.length > 65535) throw new Error("comment is too large");
        if (bufferIncludes(this.comment, eocdrSignatureBuffer)) throw new Error("comment contains end of central directory record signature");
      } else {
        this.comment = EMPTY_BUFFER;
      }
      pumpEntries(this);
    };
    function writeToOutputStream(self, buffer) {
      self.outputStream.write(buffer);
      self.outputStreamCursor += buffer.length;
    }
    function pumpFileDataReadStream(self, entry, readStream) {
      var crc32Watcher = new Crc32Watcher();
      var uncompressedSizeCounter = new ByteCounter();
      var compressor = entry.compressionLevel !== 0 ? new zlib2.DeflateRaw({ level: entry.compressionLevel }) : new PassThrough();
      var compressedSizeCounter = new ByteCounter();
      readStream.pipe(crc32Watcher).pipe(uncompressedSizeCounter).pipe(compressor).pipe(compressedSizeCounter).pipe(self.outputStream, { end: false });
      compressedSizeCounter.on("end", function() {
        entry.crc32 = crc32Watcher.crc32;
        if (entry.uncompressedSize == null) {
          entry.uncompressedSize = uncompressedSizeCounter.byteCount;
        } else {
          if (entry.uncompressedSize !== uncompressedSizeCounter.byteCount) return self.emit("error", new Error("file data stream has unexpected number of bytes"));
        }
        entry.compressedSize = compressedSizeCounter.byteCount;
        self.outputStreamCursor += entry.compressedSize;
        writeToOutputStream(self, entry.getDataDescriptor());
        entry.state = Entry.FILE_DATA_DONE;
        pumpEntries(self);
      });
    }
    function determineCompressionLevel(options2) {
      if (options2.compress != null && options2.compressionLevel != null) {
        if (!!options2.compress !== !!options2.compressionLevel) throw new Error("conflicting settings for compress and compressionLevel");
      }
      if (options2.compressionLevel != null) return options2.compressionLevel;
      if (options2.compress === false) return 0;
      return 6;
    }
    function pumpEntries(self) {
      if (self.allDone || self.errored) return;
      if (self.ended && self.calculatedTotalSizeCallback != null) {
        var calculatedTotalSize = calculateTotalSize(self);
        if (calculatedTotalSize != null) {
          self.calculatedTotalSizeCallback(calculatedTotalSize);
          self.calculatedTotalSizeCallback = null;
        }
      }
      var entry = getFirstNotDoneEntry();
      function getFirstNotDoneEntry() {
        for (var i = 0; i < self.entries.length; i++) {
          var entry2 = self.entries[i];
          if (entry2.state < Entry.FILE_DATA_DONE) return entry2;
        }
        return null;
      }
      if (entry != null) {
        if (entry.state < Entry.READY_TO_PUMP_FILE_DATA) return;
        if (entry.state === Entry.FILE_DATA_IN_PROGRESS) return;
        entry.relativeOffsetOfLocalHeader = self.outputStreamCursor;
        var localFileHeader = entry.getLocalFileHeader();
        writeToOutputStream(self, localFileHeader);
        entry.doFileDataPump();
      } else {
        if (self.ended) {
          self.offsetOfStartOfCentralDirectory = self.outputStreamCursor;
          self.entries.forEach(function(entry2) {
            var centralDirectoryRecord = entry2.getCentralDirectoryRecord();
            writeToOutputStream(self, centralDirectoryRecord);
          });
          writeToOutputStream(self, getEndOfCentralDirectoryRecord(self));
          self.outputStream.end();
          self.allDone = true;
        }
      }
    }
    function calculateTotalSize(self) {
      var pretendOutputCursor = 0;
      var centralDirectorySize = 0;
      for (var i = 0; i < self.entries.length; i++) {
        var entry = self.entries[i];
        if (entry.compressionLevel !== 0) return -1;
        if (entry.state >= Entry.READY_TO_PUMP_FILE_DATA) {
          if (entry.uncompressedSize == null) return -1;
        } else {
          if (entry.uncompressedSize == null) return null;
        }
        entry.relativeOffsetOfLocalHeader = pretendOutputCursor;
        var useZip64Format = entry.useZip64Format();
        pretendOutputCursor += LOCAL_FILE_HEADER_FIXED_SIZE + entry.utf8FileName.length;
        pretendOutputCursor += entry.uncompressedSize;
        if (!entry.crcAndFileSizeKnown) {
          if (useZip64Format) {
            pretendOutputCursor += ZIP64_DATA_DESCRIPTOR_SIZE;
          } else {
            pretendOutputCursor += DATA_DESCRIPTOR_SIZE;
          }
        }
        centralDirectorySize += CENTRAL_DIRECTORY_RECORD_FIXED_SIZE + entry.utf8FileName.length + entry.fileComment.length;
        if (!entry.forceDosTimestamp) {
          centralDirectorySize += INFO_ZIP_UNIVERSAL_TIMESTAMP_EXTRA_FIELD_SIZE;
        }
        if (useZip64Format) {
          centralDirectorySize += ZIP64_EXTENDED_INFORMATION_EXTRA_FIELD_SIZE;
        }
      }
      var endOfCentralDirectorySize = 0;
      if (self.forceZip64Eocd || self.entries.length >= 65535 || centralDirectorySize >= 65535 || pretendOutputCursor >= 4294967295) {
        endOfCentralDirectorySize += ZIP64_END_OF_CENTRAL_DIRECTORY_RECORD_SIZE + ZIP64_END_OF_CENTRAL_DIRECTORY_LOCATOR_SIZE;
      }
      endOfCentralDirectorySize += END_OF_CENTRAL_DIRECTORY_RECORD_SIZE + self.comment.length;
      return pretendOutputCursor + centralDirectorySize + endOfCentralDirectorySize;
    }
    function shouldIgnoreAdding(self) {
      if (self.ended) throw new Error("cannot add entries after calling end()");
      if (self.errored) return true;
      return false;
    }
    var ZIP64_END_OF_CENTRAL_DIRECTORY_RECORD_SIZE = 56;
    var ZIP64_END_OF_CENTRAL_DIRECTORY_LOCATOR_SIZE = 20;
    var END_OF_CENTRAL_DIRECTORY_RECORD_SIZE = 22;
    function getEndOfCentralDirectoryRecord(self, actuallyJustTellMeHowLongItWouldBe) {
      var needZip64Format = false;
      var normalEntriesLength = self.entries.length;
      if (self.forceZip64Eocd || self.entries.length >= 65535) {
        normalEntriesLength = 65535;
        needZip64Format = true;
      }
      var sizeOfCentralDirectory = self.outputStreamCursor - self.offsetOfStartOfCentralDirectory;
      var normalSizeOfCentralDirectory = sizeOfCentralDirectory;
      if (self.forceZip64Eocd || sizeOfCentralDirectory >= 4294967295) {
        normalSizeOfCentralDirectory = 4294967295;
        needZip64Format = true;
      }
      var normalOffsetOfStartOfCentralDirectory = self.offsetOfStartOfCentralDirectory;
      if (self.forceZip64Eocd || self.offsetOfStartOfCentralDirectory >= 4294967295) {
        normalOffsetOfStartOfCentralDirectory = 4294967295;
        needZip64Format = true;
      }
      if (actuallyJustTellMeHowLongItWouldBe) {
        if (needZip64Format) {
          return ZIP64_END_OF_CENTRAL_DIRECTORY_RECORD_SIZE + ZIP64_END_OF_CENTRAL_DIRECTORY_LOCATOR_SIZE + END_OF_CENTRAL_DIRECTORY_RECORD_SIZE;
        } else {
          return END_OF_CENTRAL_DIRECTORY_RECORD_SIZE;
        }
      }
      var eocdrBuffer = bufferAlloc(END_OF_CENTRAL_DIRECTORY_RECORD_SIZE + self.comment.length);
      eocdrBuffer.writeUInt32LE(101010256, 0);
      eocdrBuffer.writeUInt16LE(0, 4);
      eocdrBuffer.writeUInt16LE(0, 6);
      eocdrBuffer.writeUInt16LE(normalEntriesLength, 8);
      eocdrBuffer.writeUInt16LE(normalEntriesLength, 10);
      eocdrBuffer.writeUInt32LE(normalSizeOfCentralDirectory, 12);
      eocdrBuffer.writeUInt32LE(normalOffsetOfStartOfCentralDirectory, 16);
      eocdrBuffer.writeUInt16LE(self.comment.length, 20);
      self.comment.copy(eocdrBuffer, 22);
      if (!needZip64Format) return eocdrBuffer;
      var zip64EocdrBuffer = bufferAlloc(ZIP64_END_OF_CENTRAL_DIRECTORY_RECORD_SIZE);
      zip64EocdrBuffer.writeUInt32LE(101075792, 0);
      writeUInt64LE(zip64EocdrBuffer, ZIP64_END_OF_CENTRAL_DIRECTORY_RECORD_SIZE - 12, 4);
      zip64EocdrBuffer.writeUInt16LE(VERSION_MADE_BY, 12);
      zip64EocdrBuffer.writeUInt16LE(VERSION_NEEDED_TO_EXTRACT_ZIP64, 14);
      zip64EocdrBuffer.writeUInt32LE(0, 16);
      zip64EocdrBuffer.writeUInt32LE(0, 20);
      writeUInt64LE(zip64EocdrBuffer, self.entries.length, 24);
      writeUInt64LE(zip64EocdrBuffer, self.entries.length, 32);
      writeUInt64LE(zip64EocdrBuffer, sizeOfCentralDirectory, 40);
      writeUInt64LE(zip64EocdrBuffer, self.offsetOfStartOfCentralDirectory, 48);
      var zip64EocdlBuffer = bufferAlloc(ZIP64_END_OF_CENTRAL_DIRECTORY_LOCATOR_SIZE);
      zip64EocdlBuffer.writeUInt32LE(117853008, 0);
      zip64EocdlBuffer.writeUInt32LE(0, 4);
      writeUInt64LE(zip64EocdlBuffer, self.outputStreamCursor, 8);
      zip64EocdlBuffer.writeUInt32LE(1, 16);
      return Buffer.concat([
        zip64EocdrBuffer,
        zip64EocdlBuffer,
        eocdrBuffer
      ]);
    }
    function validateMetadataPath(metadataPath, isDirectory) {
      if (metadataPath === "") throw new Error("empty metadataPath");
      metadataPath = metadataPath.replace(/\\/g, "/");
      if (/^[a-zA-Z]:/.test(metadataPath) || /^\//.test(metadataPath)) throw new Error("absolute path: " + metadataPath);
      if (metadataPath.split("/").indexOf("..") !== -1) throw new Error("invalid relative path: " + metadataPath);
      var looksLikeDirectory = /\/$/.test(metadataPath);
      if (isDirectory) {
        if (!looksLikeDirectory) metadataPath += "/";
      } else {
        if (looksLikeDirectory) throw new Error("file path cannot end with '/': " + metadataPath);
      }
      return metadataPath;
    }
    var EMPTY_BUFFER = bufferAlloc(0);
    function Entry(metadataPath, isDirectory, options2) {
      this.utf8FileName = bufferFrom(metadataPath);
      if (this.utf8FileName.length > 65535) throw new Error("utf8 file name too long. " + utf8FileName.length + " > 65535");
      this.isDirectory = isDirectory;
      this.state = Entry.WAITING_FOR_METADATA;
      this.setLastModDate(options2.mtime != null ? options2.mtime : /* @__PURE__ */ new Date());
      this.forceDosTimestamp = !!options2.forceDosTimestamp;
      if (options2.mode != null) {
        this.setFileAttributesMode(options2.mode);
      } else {
        this.setFileAttributesMode(isDirectory ? 16893 : 33204);
      }
      if (isDirectory) {
        this.crcAndFileSizeKnown = true;
        this.crc32 = 0;
        this.uncompressedSize = 0;
        this.compressedSize = 0;
      } else {
        this.crcAndFileSizeKnown = false;
        this.crc32 = null;
        this.uncompressedSize = null;
        this.compressedSize = null;
        if (options2.size != null) this.uncompressedSize = options2.size;
      }
      if (isDirectory) {
        this.compressionLevel = 0;
      } else {
        this.compressionLevel = determineCompressionLevel(options2);
      }
      this.forceZip64Format = !!options2.forceZip64Format;
      if (options2.fileComment) {
        if (typeof options2.fileComment === "string") {
          this.fileComment = bufferFrom(options2.fileComment, "utf-8");
        } else {
          this.fileComment = options2.fileComment;
        }
        if (this.fileComment.length > 65535) throw new Error("fileComment is too large");
      } else {
        this.fileComment = EMPTY_BUFFER;
      }
    }
    Entry.WAITING_FOR_METADATA = 0;
    Entry.READY_TO_PUMP_FILE_DATA = 1;
    Entry.FILE_DATA_IN_PROGRESS = 2;
    Entry.FILE_DATA_DONE = 3;
    Entry.prototype.setLastModDate = function(date) {
      this.mtime = date;
      var dosDateTime = dateToDosDateTime(date);
      this.lastModFileTime = dosDateTime.time;
      this.lastModFileDate = dosDateTime.date;
    };
    Entry.prototype.setFileAttributesMode = function(mode) {
      if ((mode & 65535) !== mode) throw new Error("invalid mode. expected: 0 <= " + mode + " <= 65535");
      this.externalFileAttributes = mode << 16 >>> 0;
    };
    Entry.prototype.setFileDataPumpFunction = function(doFileDataPump) {
      this.doFileDataPump = doFileDataPump;
      this.state = Entry.READY_TO_PUMP_FILE_DATA;
    };
    Entry.prototype.useZip64Format = function() {
      return this.forceZip64Format || this.uncompressedSize != null && this.uncompressedSize > 4294967294 || this.compressedSize != null && this.compressedSize > 4294967294 || this.relativeOffsetOfLocalHeader != null && this.relativeOffsetOfLocalHeader > 4294967294;
    };
    var LOCAL_FILE_HEADER_FIXED_SIZE = 30;
    var VERSION_NEEDED_TO_EXTRACT_UTF8 = 20;
    var VERSION_NEEDED_TO_EXTRACT_ZIP64 = 45;
    var VERSION_MADE_BY = 3 << 8 | 63;
    var FILE_NAME_IS_UTF8 = 1 << 11;
    var UNKNOWN_CRC32_AND_FILE_SIZES = 1 << 3;
    Entry.prototype.getLocalFileHeader = function() {
      var crc324 = 0;
      var compressedSize = 0;
      var uncompressedSize = 0;
      if (this.crcAndFileSizeKnown) {
        crc324 = this.crc32;
        compressedSize = this.compressedSize;
        uncompressedSize = this.uncompressedSize;
      }
      var fixedSizeStuff = bufferAlloc(LOCAL_FILE_HEADER_FIXED_SIZE);
      var generalPurposeBitFlag = FILE_NAME_IS_UTF8;
      if (!this.crcAndFileSizeKnown) generalPurposeBitFlag |= UNKNOWN_CRC32_AND_FILE_SIZES;
      fixedSizeStuff.writeUInt32LE(67324752, 0);
      fixedSizeStuff.writeUInt16LE(VERSION_NEEDED_TO_EXTRACT_UTF8, 4);
      fixedSizeStuff.writeUInt16LE(generalPurposeBitFlag, 6);
      fixedSizeStuff.writeUInt16LE(this.getCompressionMethod(), 8);
      fixedSizeStuff.writeUInt16LE(this.lastModFileTime, 10);
      fixedSizeStuff.writeUInt16LE(this.lastModFileDate, 12);
      fixedSizeStuff.writeUInt32LE(crc324, 14);
      fixedSizeStuff.writeUInt32LE(compressedSize, 18);
      fixedSizeStuff.writeUInt32LE(uncompressedSize, 22);
      fixedSizeStuff.writeUInt16LE(this.utf8FileName.length, 26);
      fixedSizeStuff.writeUInt16LE(0, 28);
      return Buffer.concat([
        fixedSizeStuff,
        // file name (variable size)
        this.utf8FileName
        // extra field (variable size)
        // no extra fields
      ]);
    };
    var DATA_DESCRIPTOR_SIZE = 16;
    var ZIP64_DATA_DESCRIPTOR_SIZE = 24;
    Entry.prototype.getDataDescriptor = function() {
      if (this.crcAndFileSizeKnown) {
        return EMPTY_BUFFER;
      }
      if (!this.useZip64Format()) {
        var buffer = bufferAlloc(DATA_DESCRIPTOR_SIZE);
        buffer.writeUInt32LE(134695760, 0);
        buffer.writeUInt32LE(this.crc32, 4);
        buffer.writeUInt32LE(this.compressedSize, 8);
        buffer.writeUInt32LE(this.uncompressedSize, 12);
        return buffer;
      } else {
        var buffer = bufferAlloc(ZIP64_DATA_DESCRIPTOR_SIZE);
        buffer.writeUInt32LE(134695760, 0);
        buffer.writeUInt32LE(this.crc32, 4);
        writeUInt64LE(buffer, this.compressedSize, 8);
        writeUInt64LE(buffer, this.uncompressedSize, 16);
        return buffer;
      }
    };
    var CENTRAL_DIRECTORY_RECORD_FIXED_SIZE = 46;
    var INFO_ZIP_UNIVERSAL_TIMESTAMP_EXTRA_FIELD_SIZE = 9;
    var ZIP64_EXTENDED_INFORMATION_EXTRA_FIELD_SIZE = 28;
    Entry.prototype.getCentralDirectoryRecord = function() {
      var fixedSizeStuff = bufferAlloc(CENTRAL_DIRECTORY_RECORD_FIXED_SIZE);
      var generalPurposeBitFlag = FILE_NAME_IS_UTF8;
      if (!this.crcAndFileSizeKnown) generalPurposeBitFlag |= UNKNOWN_CRC32_AND_FILE_SIZES;
      var izutefBuffer = EMPTY_BUFFER;
      if (!this.forceDosTimestamp) {
        izutefBuffer = bufferAlloc(INFO_ZIP_UNIVERSAL_TIMESTAMP_EXTRA_FIELD_SIZE);
        izutefBuffer.writeUInt16LE(21589, 0);
        izutefBuffer.writeUInt16LE(INFO_ZIP_UNIVERSAL_TIMESTAMP_EXTRA_FIELD_SIZE - 4, 2);
        var EB_UT_FL_MTIME = 1 << 0;
        var EB_UT_FL_ATIME = 1 << 1;
        izutefBuffer.writeUInt8(EB_UT_FL_MTIME | EB_UT_FL_ATIME, 4);
        var timestamp = Math.floor(this.mtime.getTime() / 1e3);
        if (timestamp < -2147483648) timestamp = -2147483648;
        if (timestamp > 2147483647) timestamp = 2147483647;
        izutefBuffer.writeUInt32LE(timestamp, 5);
      }
      var normalCompressedSize = this.compressedSize;
      var normalUncompressedSize = this.uncompressedSize;
      var normalRelativeOffsetOfLocalHeader = this.relativeOffsetOfLocalHeader;
      var versionNeededToExtract = VERSION_NEEDED_TO_EXTRACT_UTF8;
      var zeiefBuffer = EMPTY_BUFFER;
      if (this.useZip64Format()) {
        normalCompressedSize = 4294967295;
        normalUncompressedSize = 4294967295;
        normalRelativeOffsetOfLocalHeader = 4294967295;
        versionNeededToExtract = VERSION_NEEDED_TO_EXTRACT_ZIP64;
        zeiefBuffer = bufferAlloc(ZIP64_EXTENDED_INFORMATION_EXTRA_FIELD_SIZE);
        zeiefBuffer.writeUInt16LE(1, 0);
        zeiefBuffer.writeUInt16LE(ZIP64_EXTENDED_INFORMATION_EXTRA_FIELD_SIZE - 4, 2);
        writeUInt64LE(zeiefBuffer, this.uncompressedSize, 4);
        writeUInt64LE(zeiefBuffer, this.compressedSize, 12);
        writeUInt64LE(zeiefBuffer, this.relativeOffsetOfLocalHeader, 20);
      }
      fixedSizeStuff.writeUInt32LE(33639248, 0);
      fixedSizeStuff.writeUInt16LE(VERSION_MADE_BY, 4);
      fixedSizeStuff.writeUInt16LE(versionNeededToExtract, 6);
      fixedSizeStuff.writeUInt16LE(generalPurposeBitFlag, 8);
      fixedSizeStuff.writeUInt16LE(this.getCompressionMethod(), 10);
      fixedSizeStuff.writeUInt16LE(this.lastModFileTime, 12);
      fixedSizeStuff.writeUInt16LE(this.lastModFileDate, 14);
      fixedSizeStuff.writeUInt32LE(this.crc32, 16);
      fixedSizeStuff.writeUInt32LE(normalCompressedSize, 20);
      fixedSizeStuff.writeUInt32LE(normalUncompressedSize, 24);
      fixedSizeStuff.writeUInt16LE(this.utf8FileName.length, 28);
      fixedSizeStuff.writeUInt16LE(izutefBuffer.length + zeiefBuffer.length, 30);
      fixedSizeStuff.writeUInt16LE(this.fileComment.length, 32);
      fixedSizeStuff.writeUInt16LE(0, 34);
      fixedSizeStuff.writeUInt16LE(0, 36);
      fixedSizeStuff.writeUInt32LE(this.externalFileAttributes, 38);
      fixedSizeStuff.writeUInt32LE(normalRelativeOffsetOfLocalHeader, 42);
      return Buffer.concat([
        fixedSizeStuff,
        // file name (variable size)
        this.utf8FileName,
        // extra field (variable size)
        izutefBuffer,
        zeiefBuffer,
        // file comment (variable size)
        this.fileComment
      ]);
    };
    Entry.prototype.getCompressionMethod = function() {
      var NO_COMPRESSION = 0;
      var DEFLATE_COMPRESSION = 8;
      return this.compressionLevel === 0 ? NO_COMPRESSION : DEFLATE_COMPRESSION;
    };
    var minDosDate = new Date(1980, 0, 1);
    var maxDosDate = new Date(2107, 11, 31, 23, 59, 58);
    function dateToDosDateTime(jsDate) {
      if (jsDate < minDosDate) jsDate = minDosDate;
      else if (jsDate > maxDosDate) jsDate = maxDosDate;
      var date = 0;
      date |= jsDate.getDate() & 31;
      date |= (jsDate.getMonth() + 1 & 15) << 5;
      date |= (jsDate.getFullYear() - 1980 & 127) << 9;
      var time = 0;
      time |= Math.floor(jsDate.getSeconds() / 2);
      time |= (jsDate.getMinutes() & 63) << 5;
      time |= (jsDate.getHours() & 31) << 11;
      return { date, time };
    }
    function writeUInt64LE(buffer, n, offset) {
      var high = Math.floor(n / 4294967296);
      var low = n % 4294967296;
      buffer.writeUInt32LE(low, offset);
      buffer.writeUInt32LE(high, offset + 4);
    }
    util.inherits(ByteCounter, Transform);
    function ByteCounter(options2) {
      Transform.call(this, options2);
      this.byteCount = 0;
    }
    ByteCounter.prototype._transform = function(chunk, encoding, cb) {
      this.byteCount += chunk.length;
      cb(null, chunk);
    };
    util.inherits(Crc32Watcher, Transform);
    function Crc32Watcher(options2) {
      Transform.call(this, options2);
      this.crc32 = 0;
    }
    Crc32Watcher.prototype._transform = function(chunk, encoding, cb) {
      this.crc32 = crc323.unsigned(chunk, this.crc32);
      cb(null, chunk);
    };
    var cp437 = "\0\u263A\u263B\u2665\u2666\u2663\u2660\u2022\u25D8\u25CB\u25D9\u2642\u2640\u266A\u266B\u263C\u25BA\u25C4\u2195\u203C\xB6\xA7\u25AC\u21A8\u2191\u2193\u2192\u2190\u221F\u2194\u25B2\u25BC !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~\u2302\xC7\xFC\xE9\xE2\xE4\xE0\xE5\xE7\xEA\xEB\xE8\xEF\xEE\xEC\xC4\xC5\xC9\xE6\xC6\xF4\xF6\xF2\xFB\xF9\xFF\xD6\xDC\xA2\xA3\xA5\u20A7\u0192\xE1\xED\xF3\xFA\xF1\xD1\xAA\xBA\xBF\u2310\xAC\xBD\xBC\xA1\xAB\xBB\u2591\u2592\u2593\u2502\u2524\u2561\u2562\u2556\u2555\u2563\u2551\u2557\u255D\u255C\u255B\u2510\u2514\u2534\u252C\u251C\u2500\u253C\u255E\u255F\u255A\u2554\u2569\u2566\u2560\u2550\u256C\u2567\u2568\u2564\u2565\u2559\u2558\u2552\u2553\u256B\u256A\u2518\u250C\u2588\u2584\u258C\u2590\u2580\u03B1\xDF\u0393\u03C0\u03A3\u03C3\xB5\u03C4\u03A6\u0398\u03A9\u03B4\u221E\u03C6\u03B5\u2229\u2261\xB1\u2265\u2264\u2320\u2321\xF7\u2248\xB0\u2219\xB7\u221A\u207F\xB2\u25A0\xA0";
    if (cp437.length !== 256) throw new Error("assertion failure");
    var reverseCp437 = null;
    function encodeCp437(string) {
      if (/^[\x20-\x7e]*$/.test(string)) {
        return bufferFrom(string, "utf-8");
      }
      if (reverseCp437 == null) {
        reverseCp437 = {};
        for (var i = 0; i < cp437.length; i++) {
          reverseCp437[cp437[i]] = i;
        }
      }
      var result = bufferAlloc(string.length);
      for (var i = 0; i < string.length; i++) {
        var b = reverseCp437[string[i]];
        if (b == null) throw new Error("character not encodable in CP437: " + JSON.stringify(string[i]));
        result[i] = b;
      }
      return result;
    }
    function bufferAlloc(size) {
      bufferAlloc = modern;
      try {
        return bufferAlloc(size);
      } catch (e) {
        bufferAlloc = legacy;
        return bufferAlloc(size);
      }
      function modern(size2) {
        return Buffer.allocUnsafe(size2);
      }
      function legacy(size2) {
        return new Buffer(size2);
      }
    }
    function bufferFrom(something, encoding) {
      bufferFrom = modern;
      try {
        return bufferFrom(something, encoding);
      } catch (e) {
        bufferFrom = legacy;
        return bufferFrom(something, encoding);
      }
      function modern(something2, encoding2) {
        return Buffer.from(something2, encoding2);
      }
      function legacy(something2, encoding2) {
        return new Buffer(something2, encoding2);
      }
    }
    function bufferIncludes(buffer, content) {
      bufferIncludes = modern;
      try {
        return bufferIncludes(buffer, content);
      } catch (e) {
        bufferIncludes = legacy;
        return bufferIncludes(buffer, content);
      }
      function modern(buffer2, content2) {
        return buffer2.includes(content2);
      }
      function legacy(buffer2, content2) {
        for (var i = 0; i <= buffer2.length - content2.length; i++) {
          for (var j = 0; ; j++) {
            if (j === content2.length) return true;
            if (buffer2[i + j] !== content2[j]) break;
          }
        }
        return false;
      }
    }
  }
});

// packages/motion-spec/src/cli.ts
import fs9 from "node:fs";
import path7 from "node:path";
import os4 from "node:os";

// packages/motion-spec/src/inspect.ts
var import_yauzl2 = __toESM(require_yauzl(), 1);
import crypto3 from "node:crypto";

// packages/motion-spec/src/guide.ts
var GUIDE_VERSION = "0.1";
var MATERIAL_ROLES = {
  "video.presenter": "\u53E3\u64AD\u89C6\u9891\uFF08\u4EBA\u7269\u5BF9\u955C\u5934\u8BB2\u8BDD\uFF09",
  "video.footage": "\u62CD\u6444\u7D20\u6750\uFF08\u7A7A\u955C\u3001\u5B9E\u62CD\u3001\u4EA7\u54C1\u5B9E\u62CD\uFF09",
  "video.screen": "\u5F55\u5C4F",
  "image.photo": "\u7167\u7247",
  "image.product": "\u4EA7\u54C1\u56FE",
  "image.logo": "Logo",
  "image.screenshot": "\u622A\u56FE",
  "audio.voiceover": "\u914D\u97F3 / \u53E3\u64AD\u58F0\u97F3",
  "audio.music": "\u80CC\u666F\u97F3\u4E50",
  "text.subtitles": "\u5B57\u5E55\u6587\u4EF6\uFF08srt\uFF09",
  "text.script": "\u6587\u7A3F / \u53E3\u64AD\u7A3F",
  "text.facts": "\u8981\u70B9\u3001\u5356\u70B9\u3001\u6570\u636E"
};
var DURATION_POLICIES = {
  fixed: "\u56FA\u5B9A\u65F6\u957F\uFF0C\u4E0D\u968F\u5185\u5BB9\u53D8\u5316",
  range: "\u5728 min\u2013max \u4E4B\u95F4\u7531\u52A9\u624B\u6309\u7528\u6237\u9700\u8981\u51B3\u5B9A",
  "fit-voiceover": "\u8DDF\u968F\u914D\u97F3\u957F\u5EA6\uFF08\u5728 min\u2013max \u4E4B\u95F4\uFF0C\u6309\u53E5\u5B50\u8FB9\u754C\u622A\u53D6\uFF09",
  "fit-content": "\u8DDF\u968F\u5185\u5BB9\u6570\u91CF\uFF08\u6761\u76EE\u3001\u56FE\u7247\u3001\u6BB5\u843D\u8D8A\u591A\u8D8A\u957F\uFF09"
};
var PLACEMENTS = ["opening", "chapter", "body", "insert", "ending", "whole"];
var GENRES = {
  "talking-head": "\u771F\u4EBA\u53E3\u64AD\uFF08\u89C2\u70B9\u3001\u7ECF\u9A8C\u3001\u56DE\u5E94\uFF09",
  "knowledge": "\u77E5\u8BC6\u8BB2\u89E3\uFF08\u6982\u5FF5\u3001\u6B65\u9AA4\u3001\u539F\u7406\uFF09",
  "product": "\u4EA7\u54C1\u4ECB\u7ECD / \u54C1\u724C\u5BA3\u4F20",
  "tutorial": "\u64CD\u4F5C\u6559\u7A0B / \u5F55\u5C4F\u6F14\u793A",
  "story": "\u53D9\u4E8B / \u89D2\u8272\u6545\u4E8B",
  "news": "\u8D44\u8BAF / \u5FEB\u8BAF",
  "showcase": "\u4F5C\u54C1\u96C6 / \u6848\u4F8B\u5C55\u793A",
  "opener": "\u7247\u5934 / \u7247\u5C3E / \u8F6C\u573A\u63D2\u4EF6"
};
var isStr = (v) => typeof v === "string" && v.trim().length > 0;
var isRole = (r) => typeof r === "string" && (r in MATERIAL_ROLES || /^x-[a-z0-9][a-z0-9-]{1,40}$/.test(r));
function schemaAtPath(schema, ref) {
  if (typeof ref !== "string" || !ref.length) return void 0;
  let current = schema;
  for (const key of ref.split(".")) {
    if (!key || ["__proto__", "prototype", "constructor"].includes(key)) return void 0;
    if (current?.type !== "object" || !current.properties || !Object.hasOwn(current.properties, key)) return void 0;
    current = current.properties[key];
  }
  return current;
}
function checkGuide(guide, params, manifest) {
  const out = [];
  const err = (code, message) => out.push({ level: "error", code, message });
  const warn = (code, message) => out.push({ level: "warn", code, message });
  if (!guide || typeof guide !== "object" || Array.isArray(guide)) {
    err("guide.shape", "guide.json \u9876\u5C42\u5FC5\u987B\u662F\u5BF9\u8C61");
    return out;
  }
  if (guide.guideVersion !== GUIDE_VERSION) err("guide.version", `guideVersion \u5FC5\u987B\u4E3A "${GUIDE_VERSION}"`);
  const props = params?.properties ?? {};
  const known = (p) => typeof p === "string" && p in props;
  const fit = guide.fit;
  if (!fit || typeof fit !== "object") err("guide.fit", "\u7F3A\u5C11 fit\uFF1A\u6A21\u677F\u9002\u5408\u505A\u4EC0\u4E48\u89C6\u9891");
  else {
    if (!isStr(fit.summary)) err("guide.fit", "fit.summary \u4E0D\u80FD\u4E3A\u7A7A\uFF1A\u7528\u4E00\u53E5\u8BDD\u544A\u8BC9\u7528\u6237\u8FD9\u4E2A\u6A21\u677F\u505A\u4EC0\u4E48");
    if (!Array.isArray(fit.goodFor) || !fit.goodFor.length) warn("guide.fit", "\u5EFA\u8BAE\u5199 fit.goodFor\uFF1A\u9002\u5408\u54EA\u4E9B\u89C6\u9891");
    if (!Array.isArray(fit.notFor) || !fit.notFor.length) warn("guide.fit", "\u5EFA\u8BAE\u5199 fit.notFor\uFF1A\u4E0D\u9002\u5408\u54EA\u4E9B\u89C6\u9891\uFF0C\u52A9\u624B\u636E\u6B64\u529D\u9000\u6216\u63A8\u8350\u522B\u7684\u6A21\u677F");
    if (fit.placement != null && !PLACEMENTS.includes(fit.placement)) err("guide.fit", `fit.placement \u53EA\u80FD\u662F ${PLACEMENTS.join(" / ")}`);
    const genres = fit.genres;
    if (genres == null) warn("guide.fit", `\u5EFA\u8BAE\u5199 fit.genres\uFF1A\u6A21\u677F\u64C5\u957F\u7684\u89C6\u9891\u7C7B\u578B\uFF08${Object.keys(GENRES).join(" / ")}\uFF09\uFF0C\u7B2C\u4E00\u9879\u4E3A\u4E3B\u5B9A\u4F4D`);
    else if (!Array.isArray(genres) || !genres.length || genres.some((g) => typeof g !== "string" || !(g in GENRES)))
      err("guide.fit", `fit.genres \u5FC5\u987B\u662F\u975E\u7A7A\u6570\u7EC4\uFF0C\u53D6\u503C ${Object.keys(GENRES).join(" / ")}`);
    else if (new Set(genres).size !== genres.length) err("guide.fit", "fit.genres \u4E0D\u80FD\u91CD\u590D");
  }
  const d = guide.duration;
  if (!d || typeof d !== "object") err("guide.duration", "\u7F3A\u5C11 duration\uFF1A\u65F6\u957F\u7B56\u7565");
  else {
    if (!(d.policy in DURATION_POLICIES)) err("guide.duration", `duration.policy \u53EA\u80FD\u662F ${Object.keys(DURATION_POLICIES).join(" / ")}`);
    const nums = ["min", "max", "default"].map((k) => d[k]);
    if (nums.some((n) => typeof n !== "number" || !(n > 0))) err("guide.duration", "duration.min / max / default \u5FC5\u987B\u662F\u6B63\u6570\uFF08\u79D2\uFF09");
    else if (!(d.min <= d.default && d.default <= d.max)) err("guide.duration", "duration \u9700\u6EE1\u8DB3 min \u2264 default \u2264 max");
    if (d.policy !== "fixed") {
      const p = schemaAtPath(params, d.param);
      if (!p) err("guide.duration", `\u65F6\u957F\u53EF\u53D8\u7684\u6A21\u677F\u5FC5\u987B\u7528 duration.param \u6307\u5411 params.schema.json \u4E2D\u63A7\u5236\u65F6\u957F\u7684\u53C2\u6570\uFF08\u73B0\u5728\u662F ${d.param ?? "\u7A7A"}\uFF09`);
      else {
        if (!["number", "integer"].includes(p.type) || p.minimum !== d.min || p.maximum !== d.max) err("guide.duration", `\u53C2\u6570 ${d.param} \u5FC5\u987B\u662F\u6570\u5B57\uFF0C\u4E14 minimum / maximum \u4E0E duration.min / max \u4E00\u81F4`);
      }
      if (!Array.isArray(d.rules) || !d.rules.length) err("guide.duration", "\u65F6\u957F\u53EF\u53D8\u7684\u6A21\u677F\u5FC5\u987B\u5199 duration.rules\uFF1A\u52A9\u624B\u600E\u4E48\u51B3\u5B9A\u65F6\u957F");
    } else if (d.min !== d.max) err("guide.duration", "\u56FA\u5B9A\u65F6\u957F\u7684\u6A21\u677F min \u4E0E max \u5E94\u76F8\u540C");
    const mp = manifest?.output?.durationPolicy;
    if (mp != null && mp !== d.policy) warn("guide.duration", `motion.json \u7684 output.durationPolicy\uFF08${mp}\uFF09\u4E0E guide.json \u7684 duration.policy\uFF08${d.policy}\uFF09\u4E0D\u4E00\u81F4`);
  }
  if (!Array.isArray(guide.materials)) err("guide.materials", "materials \u5FC5\u987B\u662F\u6570\u7EC4\uFF08\u4E0D\u9700\u8981\u7528\u6237\u7D20\u6750\u65F6\u5199 []\uFF09");
  else for (const [i, m] of guide.materials.entries()) {
    const at = `materials[${i}]`;
    if (!m || typeof m !== "object") {
      err("guide.materials", `${at} \u5FC5\u987B\u662F\u5BF9\u8C61`);
      continue;
    }
    if (!isRole(m.role)) {
      err("guide.role", `${at}.role \u4E0D\u5728\u7EDF\u4E00\u89D2\u8272\u8868\u4E2D\uFF1A${m.role}\uFF08\u81EA\u5B9A\u4E49\u89D2\u8272\u7528 x- \u524D\u7F00\uFF09`);
      continue;
    }
    for (const k of ["use", "ask"]) if (!isStr(m[k])) err("guide.materials", `${at}\uFF08${m.role}\uFF09\u7F3A\u5C11 ${k}`);
    if (!m.required && !isStr(m.ifMissing)) err("guide.materials", `${at}\uFF08${m.role}\uFF09\u662F\u53EF\u9009\u7D20\u6750\uFF0C\u5FC5\u987B\u5199 ifMissing\uFF1A\u6CA1\u6709\u65F6\u600E\u4E48\u529E`);
    for (const p of m.maps ?? []) if (!known(p)) err("guide.param-unknown", `${at}.maps \u5F15\u7528\u4E86\u4E0D\u5B58\u5728\u7684\u53C2\u6570 ${p}`);
    if (typeof m.ask === "string" && /`|\b[a-z]+[A-Z][a-zA-Z]*\b/.test(m.ask)) warn("guide.materials", `${at}.ask \u770B\u8D77\u6765\u5305\u542B\u53C2\u6570\u540D\u6216\u4EE3\u7801\uFF0C\u5E94\u5F53\u7528\u7528\u6237\u80FD\u61C2\u7684\u8BDD\u63D0\u95EE`);
  }
  if (guide.copy != null) {
    if (!Array.isArray(guide.copy)) err("guide.copy", "copy \u5FC5\u987B\u662F\u6570\u7EC4");
    else for (const [i, c] of guide.copy.entries()) {
      if (!known(c?.param)) {
        err("guide.param-unknown", `copy[${i}].param \u4E0D\u5B58\u5728\uFF1A${c?.param}`);
        continue;
      }
      if (!isStr(c.label) || !isStr(c.rule)) err("guide.copy", `copy[${i}]\uFF08${c.param}\uFF09\u9700\u8981 label\uFF08\u7ED9\u7528\u6237\u770B\u7684\u540D\u5B57\uFF09\u548C rule\uFF08\u600E\u4E48\u5199\uFF09`);
      for (const r of c.from ?? []) if (r !== "conversation" && !isRole(r)) err("guide.role", `copy[${i}].from \u4E2D\u7684 ${r} \u4E0D\u5728\u7EDF\u4E00\u89D2\u8272\u8868\u4E2D`);
    }
  }
  if (!Array.isArray(guide.hostWithoutTools) || !guide.hostWithoutTools.length) warn("guide.host", "\u5EFA\u8BAE\u5199 hostWithoutTools\uFF1A\u53EA\u80FD\u804A\u5929\u3001\u4E0D\u80FD\u8FD0\u884C\u547D\u4EE4\u7684\u52A9\u624B\u8BE5\u4EA4\u4ED8\u4EC0\u4E48\u3001\u7528\u6237\u81EA\u5DF1\u600E\u4E48\u51FA\u7247");
  if (!Array.isArray(guide.conversation) || !guide.conversation.length) warn("guide.conversation", "\u5EFA\u8BAE\u5199 conversation\uFF1A\u8FD9\u4E2A\u6A21\u677F\u7684\u5BF9\u8BDD\u8981\u70B9");
  const covered = /* @__PURE__ */ new Set([...(guide.materials ?? []).flatMap((m) => m?.maps ?? []), ...(guide.copy ?? []).map((c) => c?.param), guide.duration?.param]);
  for (const r of params?.required ?? []) if (!covered.has(r)) warn("guide.coverage", `\u5FC5\u586B\u53C2\u6570 ${r} \u6CA1\u6709\u5728 materials.maps \u6216 copy \u4E2D\u8BF4\u660E\u6765\u6E90`);
  return out;
}

// packages/motion-spec/src/protected-protocol.ts
import crypto from "node:crypto";

// packages/motion-spec/src/package-limits.ts
var RELEASE_MAX_BYTES = 384 * 1024 * 1024;
var LARGE_RELEASE_THRESHOLD = 150 * 1024 * 1024;

// packages/motion-spec/src/semver.ts
var SEMVER_PATTERN = "^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[A-Za-z-][0-9A-Za-z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[A-Za-z-][0-9A-Za-z-]*))*))?(?:\\+([0-9A-Za-z-]+(?:\\.[0-9A-Za-z-]+)*))?$";
function parseSemVer(text) {
  if (typeof text !== "string" || text.length > 100) return null;
  const match = new RegExp(SEMVER_PATTERN).exec(text);
  if (!match || match.slice(1, 4).some((n) => !Number.isSafeInteger(Number(n)))) return null;
  const prerelease = match[4]?.split(".") ?? [];
  if (prerelease.some((part) => /^\d+$/.test(part) && (part.length > 1 && part.startsWith("0") || !Number.isSafeInteger(Number(part))))) return null;
  return { numbers: match.slice(1, 4).map(Number), prerelease };
}
function compareSemVer(left, right) {
  const a = parseSemVer(left), b = parseSemVer(right);
  if (!a || !b) throw Error("VERSION_INVALID");
  for (let i = 0; i < 3; i++) if (a.numbers[i] !== b.numbers[i]) return a.numbers[i] > b.numbers[i] ? 1 : -1;
  if (!a.prerelease.length || !b.prerelease.length) return a.prerelease.length === b.prerelease.length ? 0 : a.prerelease.length ? -1 : 1;
  for (let i = 0; i < Math.max(a.prerelease.length, b.prerelease.length); i++) {
    const x = a.prerelease[i], y = b.prerelease[i];
    if (x === y) continue;
    if (x === void 0 || y === void 0) return x === void 0 ? -1 : 1;
    const xn = /^\d+$/.test(x), yn = /^\d+$/.test(y);
    if (xn && yn) return Number(x) > Number(y) ? 1 : -1;
    if (xn !== yn) return xn ? -1 : 1;
    return x > y ? 1 : -1;
  }
  return 0;
}

// packages/motion-spec/src/protected-protocol.ts
var PROTECTED_PROFILE = "protected-v1";
var PROTECTED_PROTOCOL = "motiongit-protected/1";
var PROTECTED_FILES = ["protected/core.enc", "protected/descriptor.json", "protected/signature.json"];
var hashBytes = (value) => crypto.createHash("sha256").update(value).digest("hex");
function jcs(value) {
  if (value === null || typeof value === "boolean") return JSON.stringify(value);
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw Error("PACKAGE_INVALID");
    return JSON.stringify(value);
  }
  if (typeof value === "string") {
    if (/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(value)) throw Error("PACKAGE_INVALID");
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return "[" + value.map(jcs).join(",") + "]";
  if (value && typeof value === "object" && [Object.prototype, null].includes(Object.getPrototypeOf(value))) {
    return "{" + Object.keys(value).sort().map((key) => jcs(key) + ":" + jcs(value[key])).join(",") + "}";
  }
  throw Error("PACKAGE_INVALID");
}
function parseProtectedJson(bytes, maxBytes = 2 * 1024 * 1024) {
  try {
    if (bytes.length > maxBytes || bytes.subarray(0, 3).equals(Buffer.from([239, 187, 191]))) throw Error();
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes), result = JSON.parse(text);
    let pos = 0;
    const ws = () => {
      while (/[ \t\r\n]/.test(text[pos] ?? "\0")) pos++;
    };
    const string = () => {
      const start = pos++;
      while (pos < text.length) {
        if (text[pos] === "\\") pos += 2;
        else if (text[pos++] === '"') return JSON.parse(text.slice(start, pos));
      }
      throw Error();
    };
    const value = (depth) => {
      if (depth > 64) throw Error();
      ws();
      if (text[pos] === "{") {
        pos++;
        ws();
        const keys = /* @__PURE__ */ new Set();
        if (text[pos] !== "}") for (; ; ) {
          ws();
          const key = string();
          if (keys.has(key)) throw Error();
          keys.add(key);
          ws();
          pos++;
          value(depth + 1);
          ws();
          if (text[pos] !== ",") break;
          pos++;
        }
        pos++;
      } else if (text[pos] === "[") {
        pos++;
        ws();
        if (text[pos] !== "]") for (; ; ) {
          value(depth + 1);
          ws();
          if (text[pos] !== ",") break;
          pos++;
        }
        pos++;
      } else if (text[pos] === '"') string();
      else {
        while (pos < text.length && !/[,}\]\s]/.test(text[pos])) pos++;
      }
    };
    value(0);
    ws();
    if (pos !== text.length) throw Error();
    jcs(result);
    return result;
  } catch {
    throw Error("PACKAGE_INVALID");
  }
}
var AAD_FIELDS = ["protocol", "profile", "templateId", "releaseId", "buildId", "keyId", "fullEntry", "publicManifestSha256", "plaintextCoreSha256"];
var DESCRIPTOR_FIELDS = [...AAD_FIELDS, "nonce", "tag", "ciphertextSha256", "ciphertextBytes", "core", "signingKeyId", "publicFiles"].sort();
var HEX = /^[a-f0-9]{64}$/;
var ID = /^[a-zA-Z0-9_-]{1,80}$/;
function protectedPath(path8) {
  return path8.length > 0 && path8.length <= 240 && !path8.startsWith("/") && !/[\\:\x00-\x1f]/.test(path8) && path8.split("/").every((part) => part !== "" && part !== "." && part !== ".." && !/[. ]$/.test(part) && !/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(part));
}
function partitionProtected(manifest, paths) {
  const d = manifest.distribution;
  if (!d || d.mode !== "protected" || d.profile !== PROTECTED_PROFILE || d.runtimeContract !== "split-root-v1" || !parseSemVer(d.minHelperVersion) || !Array.isArray(d.public) || !d.public.length || d.public.length > 100) throw Error("PACKAGE_INVALID");
  if (!protectedPath(d.fullEntry) || !paths.includes(d.fullEntry) || d.fullEntry.startsWith("protected/")) throw Error("PACKAGE_INVALID");
  for (const pattern of d.public) {
    if (typeof pattern !== "string") throw Error("PACKAGE_INVALID");
    const directory = pattern.endsWith("/**"), prefix = directory ? pattern.slice(0, -3) : pattern;
    if (!protectedPath(prefix) || /[*?\[\]{}]/.test(prefix) || prefix === "protected" || prefix.startsWith("protected/")) throw Error("PACKAGE_INVALID");
    if (directory && !["presets", "previews", "licenses", "recipes"].includes(prefix)) throw Error("PACKAGE_INVALID");
  }
  const matches = (path8) => d.public.some((p) => p.endsWith("/**") ? path8.startsWith(p.slice(0, -2)) : path8 === p);
  const publicPaths = [], corePaths = [], seen = /* @__PURE__ */ new Set();
  for (const path8 of paths) {
    if (!protectedPath(path8) || seen.has(path8.toLowerCase()) || path8.startsWith("protected/")) throw Error("PACKAGE_INVALID");
    seen.add(path8.toLowerCase());
    if (path8 === "integrity.json") continue;
    if (matches(path8)) {
      if (path8 === d.fullEntry || !/\.(json|md|txt|png|jpe?g|webp|mp4|webm)$/i.test(path8) || /(?:^|\/)(?:source[-_.]?map|source[-_.]?spans)(?:\.|\/)/i.test(path8)) throw Error("PACKAGE_INVALID");
      publicPaths.push(path8);
    } else corePaths.push(path8);
  }
  for (const needed of ["motion.json", "README.md", manifest.parameters?.schema, manifest.ai?.guide, manifest.license?.file, manifest.parameters?.defaultPreset, ...(manifest.variants ?? []).map((v) => v.preset)]) {
    if (typeof needed !== "string" || !publicPaths.includes(needed)) throw Error("PACKAGE_INVALID");
  }
  if (!corePaths.includes(d.fullEntry)) throw Error("PACKAGE_INVALID");
  return { publicPaths: publicPaths.sort(), corePaths: corePaths.sort(), distribution: d };
}
function exactFields(value, fields) {
  if (!value || typeof value !== "object" || Array.isArray(value) || Object.keys(value).sort().join("\0") !== [...fields].sort().join("\0")) throw Error("PACKAGE_INVALID");
}
function base64(value, bytes) {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]+$/.test(value)) throw Error("PACKAGE_INVALID");
  const result = Buffer.from(value, "base64url");
  if (result.length !== bytes || result.toString("base64url") !== value) throw Error("PACKAGE_INVALID");
  return result;
}
function aadOf(descriptor) {
  return Object.fromEntries(AAD_FIELDS.map((key) => [key, descriptor[key]]));
}
function validateDescriptor(value) {
  exactFields(value, DESCRIPTOR_FIELDS);
  if (value.protocol !== PROTECTED_PROTOCOL || value.profile !== PROTECTED_PROFILE || value.core !== PROTECTED_FILES[0]) throw Error("PACKAGE_INVALID");
  if (![value.templateId, value.releaseId].every((n) => Number.isSafeInteger(n) && n > 0) || ![value.buildId, value.keyId, value.signingKeyId].every((s) => typeof s === "string" && ID.test(s))) throw Error("PACKAGE_INVALID");
  if (typeof value.fullEntry !== "string" || !protectedPath(value.fullEntry) || value.fullEntry.startsWith("protected/")) throw Error("PACKAGE_INVALID");
  if (![value.publicManifestSha256, value.plaintextCoreSha256, value.ciphertextSha256].every((s) => typeof s === "string" && HEX.test(s))) throw Error("PACKAGE_INVALID");
  if (!Number.isSafeInteger(value.ciphertextBytes) || value.ciphertextBytes < 1 || value.ciphertextBytes > RELEASE_MAX_BYTES) throw Error("PACKAGE_INVALID");
  base64(value.nonce, 12);
  base64(value.tag, 16);
  if (!value.publicFiles || typeof value.publicFiles !== "object" || Array.isArray(value.publicFiles)) throw Error("PACKAGE_INVALID");
  const entries = Object.entries(value.publicFiles);
  if (!entries.length || entries.length > 4996) throw Error("PACKAGE_INVALID");
  const seen = /* @__PURE__ */ new Set();
  for (const [path8, info] of entries) {
    if (!protectedPath(path8) || path8.startsWith("protected/") || path8 === "integrity.json" || path8 === value.fullEntry || seen.has(path8.toLowerCase())) throw Error("PACKAGE_INVALID");
    seen.add(path8.toLowerCase());
    exactFields(info, ["sha256", "bytes"]);
    if (!HEX.test(info.sha256) || !Number.isSafeInteger(info.bytes) || info.bytes < 0 || info.bytes > 150 * 1024 * 1024) throw Error("PACKAGE_INVALID");
  }
  if (!Object.hasOwn(value.publicFiles, "motion.json")) throw Error("PACKAGE_INVALID");
}
function verifyDescriptor(descriptor, signature, trusted) {
  validateDescriptor(descriptor);
  exactFields(signature, ["algorithm", "keyId", "signature"]);
  if (signature.algorithm !== "Ed25519" || signature.keyId !== descriptor.signingKeyId) throw Error("SIGNATURE_INVALID");
  const key = trusted[descriptor.signingKeyId];
  if (!key || (typeof key === "string" ? crypto.createPublicKey(key) : key).asymmetricKeyType !== "ed25519" || !crypto.verify(null, Buffer.from(jcs(descriptor)), key, base64(signature.signature, 64))) throw Error("SIGNATURE_INVALID");
  return descriptor;
}
function verifyEnvelope(descriptor, signature, ciphertext, publicFiles, trusted) {
  descriptor = verifyDescriptor(descriptor, signature, trusted);
  validateDescriptor(descriptor);
  if (ciphertext.length !== descriptor.ciphertextBytes || hashBytes(ciphertext) !== descriptor.ciphertextSha256) throw Error("PACKAGE_INVALID");
  if (publicFiles.size !== Object.keys(descriptor.publicFiles).length) throw Error("PACKAGE_INVALID");
  for (const [path8, info] of Object.entries(descriptor.publicFiles)) {
    const data = publicFiles.get(path8);
    if (!data || data.length !== info.bytes || hashBytes(data) !== info.sha256) throw Error("PACKAGE_INVALID");
  }
  const manifest = JSON.parse(publicFiles.get("motion.json").toString("utf8"));
  if (hashBytes(jcs(manifest)) !== descriptor.publicManifestSha256) throw Error("PACKAGE_INVALID");
  return { descriptor, descriptorSha256: hashBytes(jcs(descriptor)), manifest };
}
function decryptCore(verified, ciphertext, dek) {
  if (dek.length !== 32) throw Error("PACKAGE_INVALID");
  const d = verified.descriptor;
  if (ciphertext.length !== d.ciphertextBytes || hashBytes(ciphertext) !== d.ciphertextSha256) throw Error("PACKAGE_INVALID");
  try {
    const cipher = crypto.createDecipheriv("aes-256-gcm", dek, base64(d.nonce, 12), { authTagLength: 16 });
    cipher.setAAD(Buffer.from(jcs(aadOf(d))));
    cipher.setAuthTag(base64(d.tag, 16));
    const plaintext = Buffer.concat([cipher.update(ciphertext), cipher.final()]);
    if (hashBytes(plaintext) !== d.plaintextCoreSha256) {
      plaintext.fill(0);
      throw Error("PACKAGE_INVALID");
    }
    return plaintext;
  } catch {
    throw Error("PACKAGE_INVALID");
  }
}

// packages/motion-spec/src/safe-archive.ts
var import_yauzl = __toESM(require_yauzl(), 1);
var import_yazl = __toESM(require_yazl(), 1);
import crypto2 from "node:crypto";
import fs from "node:fs";
import * as zlib from "node:zlib";
var ARCHIVE_LIMITS = Object.freeze({
  maxArchiveBytes: RELEASE_MAX_BYTES,
  maxFiles: 5e3,
  maxFileBytes: 150 * 1024 * 1024,
  maxTotalBytes: 600 * 1024 * 1024,
  maxRatio: 200,
  ratioThresholdBytes: 10 * 1024 * 1024
});
var crcTable = Array.from({ length: 256 }, (_, n) => {
  for (let bit = 0; bit < 8; bit++) n = n & 1 ? 3988292384 ^ n >>> 1 : n >>> 1;
  return n >>> 0;
});
function crc322(data, previous = 0) {
  if (typeof zlib.crc32 === "function") return zlib.crc32(data, previous) >>> 0;
  let crc = previous ^ 4294967295;
  for (const byte of data) crc = crcTable[(crc ^ byte) & 255] ^ crc >>> 8;
  return (crc ^ 4294967295) >>> 0;
}
function assertArchivePaths(paths) {
  const seen = /* @__PURE__ */ new Set();
  for (const name of paths) {
    const normalized = name.normalize("NFC").toLowerCase();
    if (!protectedPath(name) || seen.has(normalized)) throw Error("PACKAGE_INVALID");
    seen.add(normalized);
  }
  for (const name of seen) {
    const parts = name.split("/");
    for (let n = 1; n < parts.length; n++) if (seen.has(parts.slice(0, n).join("/"))) throw Error("PACKAGE_INVALID");
  }
}
async function readSafeArchive(bytes, overrides = {}) {
  const limits = { ...ARCHIVE_LIMITS, ...overrides };
  if (bytes.length > limits.maxArchiveBytes) throw Error("PACKAGE_INVALID");
  let zip;
  try {
    zip = await new Promise((resolve, reject) => import_yauzl.default.fromBuffer(
      bytes,
      { lazyEntries: true, validateEntrySizes: true, strictFileNames: true, autoClose: true },
      (error, result) => error ? reject(error) : resolve(result)
    ));
    if (zip.entryCount > limits.maxFiles) throw Error();
    const files = /* @__PURE__ */ new Map();
    let total = 0, entries = 0;
    for await (const entry of zip.eachEntry()) {
      const name = entry.fileName;
      if (++entries > limits.maxFiles) throw Error();
      const type = entry.externalFileAttributes >>> 16 & 61440;
      if (name.endsWith("/") || !protectedPath(name) || type !== 0 && type !== 32768 || entry.generalPurposeBitFlag & 1 || ![0, 8].includes(entry.compressionMethod)) throw Error();
      if (entry.uncompressedSize > limits.maxFileBytes || entry.uncompressedSize > limits.ratioThresholdBytes && entry.uncompressedSize / Math.max(1, entry.compressedSize) > limits.maxRatio) throw Error();
      total += entry.uncompressedSize;
      if (total > limits.maxTotalBytes || files.has(name)) throw Error();
      const data = Buffer.allocUnsafe(entry.uncompressedSize);
      let size = 0;
      for await (const chunk of await zip.openReadStreamPromise(entry)) {
        const offset = size;
        size += chunk.length;
        if (size > entry.uncompressedSize || size > limits.maxFileBytes) throw Error();
        chunk.copy(data, offset);
      }
      if (size !== entry.uncompressedSize || crc322(data) !== entry.crc32) throw Error();
      files.set(name, data);
    }
    assertArchivePaths([...files.keys()]);
    return files;
  } catch {
    throw Error("PACKAGE_INVALID");
  } finally {
    zip?.close();
  }
}
async function verifySafeArchiveIntegrity(source2, overrides = {}) {
  const limits = { ...ARCHIVE_LIMITS, ...overrides };
  if ((Buffer.isBuffer(source2) ? source2.length : fs.statSync(source2).size) > limits.maxArchiveBytes) throw Error("PACKAGE_INVALID");
  let zip;
  try {
    const options2 = { lazyEntries: true, validateEntrySizes: true, strictFileNames: true, autoClose: true };
    zip = Buffer.isBuffer(source2) ? await new Promise((resolve, reject) => import_yauzl.default.fromBuffer(source2, options2, (e, z) => e ? reject(e) : resolve(z))) : await import_yauzl.default.openPromise(source2, options2);
    if (zip.entryCount > limits.maxFiles) throw Error();
    const hashes = /* @__PURE__ */ new Map();
    let total = 0, count = 0, integrity;
    for await (const entry of zip.eachEntry()) {
      const name = entry.fileName, type = entry.externalFileAttributes >>> 16 & 61440;
      if (++count > limits.maxFiles || name.endsWith("/") || !protectedPath(name) || hashes.has(name) || type !== 0 && type !== 32768 || entry.generalPurposeBitFlag & 1 || ![0, 8].includes(entry.compressionMethod) || entry.uncompressedSize > limits.maxFileBytes || entry.uncompressedSize > limits.ratioThresholdBytes && entry.uncompressedSize / Math.max(1, entry.compressedSize) > limits.maxRatio) throw Error();
      total += entry.uncompressedSize;
      if (total > limits.maxTotalBytes) throw Error();
      const digest4 = crypto2.createHash("sha256"), chunks = [];
      let size = 0, crc = 0;
      if (name === "integrity.json" && entry.uncompressedSize > 2 * 1024 * 1024) throw Error();
      for await (const chunk of await zip.openReadStreamPromise(entry)) {
        size += chunk.length;
        if (size > entry.uncompressedSize || size > limits.maxFileBytes) throw Error();
        digest4.update(chunk);
        crc = crc322(chunk, crc);
        if (name === "integrity.json") chunks.push(chunk);
      }
      if (size !== entry.uncompressedSize || crc >>> 0 !== entry.crc32) throw Error();
      hashes.set(name, digest4.digest("hex"));
      if (name === "integrity.json") integrity = Buffer.concat(chunks);
    }
    assertArchivePaths([...hashes.keys()]);
    if (!integrity) throw Error();
    const value = parseProtectedJson(integrity);
    if (value.algorithm !== "sha256" || !value.files || typeof value.files !== "object" || Array.isArray(value.files) || Object.keys(value).sort().join() !== "algorithm,files") throw Error();
    const expected = [...hashes.keys()].filter((n) => n !== "integrity.json").sort();
    if (JSON.stringify(Object.keys(value.files).sort()) !== JSON.stringify(expected)) throw Error();
    for (const name of expected) if (value.files[name] !== hashes.get(name)) throw Error();
  } catch {
    throw Error("PACKAGE_INVALID");
  } finally {
    zip?.close();
  }
}
function withFrozenIntegrity(files) {
  const list = new Map(files);
  list.delete("integrity.json");
  const frozen = Object.fromEntries([...list.keys()].sort().map((name) => [name, hashBytes(list.get(name))]));
  list.set("integrity.json", Buffer.from(JSON.stringify({ algorithm: "sha256", files: frozen }, null, 2) + "\n"));
  return list;
}
function verifyFrozenIntegrity(files) {
  const bytes = files.get("integrity.json");
  if (!bytes) throw Error("PACKAGE_INVALID");
  const value = parseProtectedJson(bytes);
  if (value.algorithm !== "sha256" || !value.files || typeof value.files !== "object" || Array.isArray(value.files) || Object.keys(value).sort().join() !== "algorithm,files") throw Error("PACKAGE_INVALID");
  const expected = [...files.keys()].filter((name) => name !== "integrity.json").sort();
  if (JSON.stringify(Object.keys(value.files).sort()) !== JSON.stringify(expected)) throw Error("PACKAGE_INVALID");
  for (const name of expected) if (value.files[name] !== hashBytes(files.get(name))) throw Error("PACKAGE_INVALID");
}

// packages/motion-spec/src/preview.ts
var PREVIEW_LANGUAGES = ["en", "zh", "ja", "ko", "es", "fr", "de", "pt", "ru"];
var isPreviewLanguage = (value) => typeof value === "string" && PREVIEW_LANGUAGES.includes(value);

// packages/motion-spec/src/reference-scopes.ts
var CORE_FIELDS = /* @__PURE__ */ new Set([
  "parameters.mapping",
  "preview.controls",
  "services.creator.client",
  "extensions.motiongit.com:motion-kit.originalNativeEntry"
]);
function collectPackageReferences(manifest) {
  const references = [];
  function walk2(value, field) {
    if (field === "ai.summary") return;
    if (typeof value === "string" && /^[\w./-]+\.(json|md|js|mjs|sh|py|png|jpe?g|webp|gif|mp4|webm|txt|html|css|srt)$/.test(value) && !value.startsWith("http")) {
      references.push({ field, path: value, scope: field.startsWith("runtime.") || field === "distribution.fullEntry" || field.startsWith("motiongit.brand.") || CORE_FIELDS.has(field) ? "core" : "public" });
    } else if (value && typeof value === "object") for (const [key, next] of Object.entries(value)) walk2(next, field ? field + "." + key : key);
  }
  walk2(manifest, "");
  return references;
}
function assertResolvedPackageReferences(manifest, paths) {
  const names = new Set(paths);
  for (const reference of collectPackageReferences(manifest)) {
    if (!protectedPath(reference.path) || !names.has(reference.path)) throw Error("PACKAGE_INVALID");
  }
}

// packages/motion-spec/src/inspect.ts
var SPEC_VERSION = "0.1.0-draft.1";
var PERSONAL_KEY_FILE = "motiongit.key.json";
var FORMAT_ID = "motiongit-template";
var LIMITS = {
  maxFiles: 5e3,
  maxFileBytes: 150 * 1024 * 1024,
  maxTotalBytes: 600 * 1024 * 1024,
  maxRatio: 200,
  // 单文件压缩比上限（防压缩炸弹）
  maxPathLength: 240,
  maxTextScanBytes: 2 * 1024 * 1024
};
var textScanLimit = (name) => name === "locales/index.json" ? 8 * 1024 * 1024 : LIMITS.maxTextScanBytes;
var FORBIDDEN_DIRS = ["node_modules/", ".venv/", "venv/", "__pycache__/", ".git/", ".cache/", ".next/", ".turbo/", ".DS_Store"];
var FORBIDDEN_NAMES = [/^\.env(\..+)?$/i, /\.pem$/i, /\.key$/i, /^id_(rsa|ed25519|ecdsa)(\.pub)?$/i, /\.p12$/i, /\.keystore$/i, /^\.npmrc$/i, /^\.netrc$/i];
var AUTO_LOADED = [/^CLAUDE\.md$/i, /^AGENTS\.md$/i, /^\.cursorrules$/i, /^\.cursor\//i, /^\.claude\//i, /^\.github\/copilot-instructions\.md$/i, /^GEMINI\.md$/i];
var TEXT_EXT = /\.(json|js|mjs|cjs|ts|tsx|jsx|html?|css|md|txt|ya?ml|toml|ini|py|sh|srt|vtt|xml|svg|csv)$/i;
var SECRET_RULES = [
  { code: "secret.motiongit", label: "MotionGit API Key", re: /\bmgk_[A-Za-z0-9_-]{20,}/ },
  { code: "secret.openai", label: "OpenAI / Anthropic \u98CE\u683C API \u5BC6\u94A5", re: /\bsk-(?:ant-|proj-)?[A-Za-z0-9_-]{20,}/ },
  { code: "secret.aws", label: "AWS Access Key", re: /\bAKIA[0-9A-Z]{16}\b/ },
  { code: "secret.github", label: "GitHub \u4EE4\u724C", re: /\b(?:ghp|gho|ghu|ghs|github_pat)_[A-Za-z0-9_]{20,}/ },
  { code: "secret.google", label: "Google API Key", re: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { code: "secret.slack", label: "Slack \u4EE4\u724C", re: /\bxox[abprs]-[A-Za-z0-9-]{10,}/ },
  { code: "secret.private-key", label: "\u79C1\u94A5\u5185\u5BB9", re: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/ },
  { code: "secret.jwt", label: "JWT \u4EE4\u724C", re: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/ }
];
var PII_RULES = [
  { code: "pii.phone-cn", label: "\u4E2D\u56FD\u5927\u9646\u624B\u673A\u53F7", re: /(?<![0-9A-Za-z])1[3-9]\d{9}(?![0-9A-Za-z])/ },
  { code: "pii.email", label: "\u90AE\u7BB1\u5730\u5740", re: /\b[A-Za-z0-9._%+-]+@(?!example\.(?:com|org)|motiongit\.com)[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/ },
  { code: "pii.id-cn", label: "\u8EAB\u4EFD\u8BC1\u53F7", re: /(?<![0-9A-Za-z])[1-9]\d{5}(?:19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dXx](?![0-9A-Za-z])/ },
  { code: "path.abs-unix", label: "\u672C\u673A\u7EDD\u5BF9\u8DEF\u5F84", re: /(?:\/Users\/[^/\s"'`]+\/|\/home\/[^/\s"'`]+\/)/ },
  { code: "path.abs-win", label: "\u672C\u673A\u7EDD\u5BF9\u8DEF\u5F84", re: /\b[A-Za-z]:\\(?:Users|Documents and Settings)\\[^\\\s"'`]+/ }
];
function scanText(s) {
  const out = [];
  for (const r of SECRET_RULES) if (r.re.test(s)) out.push({ level: "error", code: r.code, label: r.label });
  for (const r of PII_RULES) if (r.re.test(s)) out.push({ level: r.code === "pii.email" ? "warn" : "error", code: r.code, label: r.label });
  return out;
}
var isTextFile = (p) => TEXT_EXT.test(p);
var isForbidden = (p) => {
  const base = p.split("/").pop();
  if (FORBIDDEN_DIRS.some((d) => p.includes(d) || base === d)) return "\u7F13\u5B58\u3001\u4F9D\u8D56\u6216\u7248\u672C\u5E93\u76EE\u5F55";
  if (FORBIDDEN_NAMES.some((r) => r.test(base))) return "\u5BC6\u94A5\u6216\u73AF\u5883\u53D8\u91CF\u6587\u4EF6";
  if (AUTO_LOADED.some((r) => r.test(p))) return "\u4F1A\u88AB AI \u5DE5\u5177\u81EA\u52A8\u52A0\u8F7D\u4E3A\u6307\u4EE4\u7684\u6587\u4EF6";
  return null;
};
function pathProblem(p) {
  if (!p || p.length > LIMITS.maxPathLength) return "\u8DEF\u5F84\u4E3A\u7A7A\u6216\u8FC7\u957F";
  if (p.includes("\\")) return "\u5305\u542B\u53CD\u659C\u6760";
  if (p.startsWith("/") || /^[A-Za-z]:/.test(p)) return "\u7EDD\u5BF9\u8DEF\u5F84\u6216\u76D8\u7B26";
  if (p.split("/").some((s) => s === ".." || s === ".")) return "\u5305\u542B . \u6216 .. \u6BB5";
  if (/[\u0000-\u001f]/.test(p)) return "\u5305\u542B\u63A7\u5236\u5B57\u7B26";
  return null;
}
function req(obj, path8) {
  return path8.split(".").reduce((o, k) => o == null ? void 0 : o[k], obj);
}
async function digest(stream, cap, keepUnder) {
  const h = crypto3.createHash("sha256");
  const chunks = [];
  let n = 0;
  let keep = true;
  for await (const c of stream) {
    n += c.length;
    if (n > cap) throw new Error("entry exceeds limit");
    h.update(c);
    if (keep) {
      if (n <= keepUnder) chunks.push(c);
      else {
        keep = false;
        chunks.length = 0;
      }
    }
  }
  return { size: n, sha256: h.digest("hex"), buf: keep ? Buffer.concat(chunks) : null };
}
var RECOMMENDED_AUTHORING = ["claude"];
var AUTHORING_LABELS = { claude: "Claude", codex: "Codex" };
async function inspectPackage(filePath, opts = {}) {
  const findings = [];
  const add = (level, code, message, path8) => findings.push({ level, code, message, path: path8 });
  const files = [];
  const texts = /* @__PURE__ */ new Map();
  let manifest = null, params = null, readme = null, guide = null;
  const variants = [];
  let total = 0;
  const fs10 = await import("node:fs");
  const packageSize = Buffer.isBuffer(filePath) ? filePath.length : fs10.statSync(filePath).size;
  const packageSha256 = Buffer.isBuffer(filePath) ? hashBytes(filePath) : (await digest(fs10.createReadStream(filePath), Infinity, 0)).sha256;
  let zip;
  try {
    const options2 = { lazyEntries: true, validateEntrySizes: true, strictFileNames: true, autoClose: true };
    zip = Buffer.isBuffer(filePath) ? await new Promise((resolve, reject) => import_yauzl2.default.fromBuffer(filePath, options2, (e, z) => e ? reject(e) : resolve(z))) : await import_yauzl2.default.openPromise(filePath, options2);
  } catch (e) {
    add("error", "zip.invalid", `\u4E0D\u662F\u6709\u6548\u7684 ZIP \u5BB9\u5668\uFF1A${e.message}`);
    return finalize();
  }
  const seen = /* @__PURE__ */ new Map();
  try {
    for await (const entry of zip.eachEntry()) {
      const name = entry.fileName;
      if (files.length >= LIMITS.maxFiles) {
        add("error", "zip.too-many-files", `\u6587\u4EF6\u6570\u8D85\u8FC7\u4E0A\u9650 ${LIMITS.maxFiles}`);
        break;
      }
      const problem = pathProblem(name.replace(/\/$/, ""));
      if (problem) {
        add("error", "path.unsafe", `\u4E0D\u5B89\u5168\u7684\u8DEF\u5F84\uFF08${problem}\uFF09`, name);
        continue;
      }
      const mode = entry.externalFileAttributes >>> 16 & 61440;
      if (mode === 40960) {
        add("error", "path.symlink", "\u5305\u5185\u4E0D\u5141\u8BB8\u7B26\u53F7\u94FE\u63A5", name);
        continue;
      }
      if (name.endsWith("/")) continue;
      const lower = name.toLowerCase();
      if (seen.has(lower)) {
        add("error", "path.case-collision", `\u4E0E ${seen.get(lower)} \u5927\u5C0F\u5199\u51B2\u7A81`, name);
        continue;
      }
      seen.set(lower, name);
      const base = name.split("/").pop();
      if (FORBIDDEN_DIRS.some((d2) => name.includes(d2) || base === d2)) add("error", "content.forbidden-dir", "\u7F13\u5B58\u3001\u4F9D\u8D56\u6216\u7248\u672C\u5E93\u76EE\u5F55\u4E0D\u80FD\u968F\u5305\u5206\u53D1", name);
      if (FORBIDDEN_NAMES.some((r) => r.test(base))) add("error", "content.secret-file", "\u5BC6\u94A5\u6216\u73AF\u5883\u53D8\u91CF\u6587\u4EF6\u4E0D\u80FD\u968F\u5305\u5206\u53D1", name);
      if (name === PERSONAL_KEY_FILE) add("error", "content.personal-key", "\u5305\u5185\u542B\u6709\u4E2A\u4EBA MotionGit API Key\uFF08motiongit.key.json\uFF09\u3002\u8FD9\u662F\u4E0B\u8F7D\u8005\u7684\u79C1\u4EBA\u51ED\u636E\uFF0C\u53D1\u5E03\u524D\u8BF7\u5220\u9664", name);
      if (AUTO_LOADED.some((r) => r.test(name))) add("error", "content.auto-loaded", "\u4F1A\u88AB AI \u5DE5\u5177\u81EA\u52A8\u52A0\u8F7D\u4E3A\u6307\u4EE4\u7684\u6587\u4EF6\u4E0D\u5141\u8BB8\u653E\u5728\u5305\u5185\uFF08\u89C1\u89C4\u8303 \xA714\uFF09", name);
      const entryCap = name === "protected/core.enc" ? RELEASE_MAX_BYTES : LIMITS.maxFileBytes;
      if (entry.uncompressedSize > entryCap) {
        add("error", "zip.file-too-large", `\u5355\u6587\u4EF6\u8D85\u8FC7 ${entryCap / 1048576} MB`, name);
        continue;
      }
      if (entry.compressedSize > 0 && entry.uncompressedSize / entry.compressedSize > LIMITS.maxRatio && entry.uncompressedSize > 10 * 1024 * 1024) {
        add("error", "zip.bomb", "\u538B\u7F29\u6BD4\u5F02\u5E38\uFF0C\u7591\u4F3C\u538B\u7F29\u70B8\u5F39", name);
        continue;
      }
      total += entry.uncompressedSize;
      if (total > LIMITS.maxTotalBytes) {
        add("error", "zip.too-large", `\u89E3\u538B\u603B\u91CF\u8D85\u8FC7 ${LIMITS.maxTotalBytes / 1048576} MB`);
        break;
      }
      const rs = await zip.openReadStreamPromise(entry);
      const d = await digest(rs, entryCap, TEXT_EXT.test(name) ? textScanLimit(name) : 0);
      files.push({ path: name, size: d.size, sha256: d.sha256 });
      if (d.buf) texts.set(name, d.buf);
    }
  } catch (e) {
    add("error", "zip.read", `\u8BFB\u53D6 ZIP \u5931\u8D25\uFF1A${e.message}`);
  }
  const mBuf = texts.get("motion.json");
  if (!files.some((f) => f.path === "motion.json")) {
    const nested = files.find((f) => /^[^/]+\/motion\.json$/.test(f.path));
    add("error", "manifest.missing", nested ? `motion.json \u5FC5\u987B\u4F4D\u4E8E\u5305\u6839\u76EE\u5F55\uFF0C\u4E0D\u80FD\u5957\u4E00\u5C42\u76EE\u5F55\uFF08\u53D1\u73B0 ${nested.path}\uFF09` : "\u7F3A\u5C11\u6839 motion.json");
  } else if (mBuf) {
    try {
      manifest = JSON.parse(mBuf.toString("utf8"));
    } catch (e) {
      add("error", "manifest.json", `motion.json \u4E0D\u662F\u4E25\u683C JSON\uFF1A${e.message}`, "motion.json");
    }
  }
  if (manifest) {
    if (manifest.format !== FORMAT_ID) add("error", "manifest.format", `format \u5FC5\u987B\u4E3A "${FORMAT_ID}"`, "motion.json");
    if (typeof manifest.specVersion !== "string") add("error", "manifest.spec-version", "\u7F3A\u5C11 specVersion", "motion.json");
    else if (manifest.specVersion !== SPEC_VERSION) add("error", "manifest.spec-unsupported", `\u6682\u4E0D\u652F\u6301\u89C4\u8303\u7248\u672C ${manifest.specVersion}`, "motion.json");
    for (const k of ["template.id", "template.version", "template.name", "runtime.profile", "runtime.entry", "output.width", "output.height", "output.fps"]) {
      if (req(manifest, k) == null) add("error", "manifest.required", `\u7F3A\u5C11\u5FC5\u9700\u5B57\u6BB5 ${k}`, "motion.json");
    }
    const id2 = req(manifest, "template.id");
    if (id2 != null && !/^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/.test(String(id2))) add("error", "manifest.id", "template.id \u53EA\u80FD\u7528\u5C0F\u5199\u5B57\u6BCD\u3001\u6570\u5B57\u548C\u4E2D\u5212\u7EBF\uFF083\u201364 \u4F4D\uFF09", "motion.json");
    const ver = req(manifest, "template.version");
    if (ver != null && !parseSemVer(ver)) add("error", "manifest.version", "template.version \u9700\u4E3A\u8BED\u4E49\u5316\u7248\u672C\uFF0C\u5982 1.0.0", "motion.json");
    const protectedMode = manifest.distribution?.mode === "protected";
    const sealed = files.some((f) => PROTECTED_FILES.includes(f.path));
    if (manifest.distribution?.mode != null && !["open", "protected"].includes(manifest.distribution.mode)) add("error", "manifest.distribution", "Unsupported distribution mode", "motion.json");
    if (protectedMode) {
      try {
        await verifySafeArchiveIntegrity(filePath, { maxFileBytes: RELEASE_MAX_BYTES });
        parseProtectedJson(texts.get("motion.json"));
        if (files.some((f) => isTextFile(f.path) && f.size > textScanLimit(f.path))) throw Error("PACKAGE_INVALID");
        if (!sealed) partitionProtected(manifest, files.map((f) => f.path));
        else {
          const descriptor = verifyDescriptor(parseProtectedJson(texts.get(PROTECTED_FILES[1])), parseProtectedJson(texts.get(PROTECTED_FILES[2])), opts.trustedSigningKeys ?? {});
          if (manifest.distribution.profile !== descriptor.profile || manifest.distribution.fullEntry !== descriptor.fullEntry || manifest.distribution.runtimeContract !== "split-root-v1" || hashBytes(jcs(manifest)) !== descriptor.publicManifestSha256) throw Error("PACKAGE_INVALID");
          const expected = [...Object.keys(descriptor.publicFiles), ...PROTECTED_FILES, "integrity.json"].sort();
          if (jcs(files.map((f) => f.path).sort()) !== jcs(expected)) throw Error("PACKAGE_INVALID");
          for (const [path8, info] of Object.entries(descriptor.publicFiles)) {
            const f = files.find((f2) => f2.path === path8);
            if (!f || f.sha256 !== info.sha256 || f.size !== info.bytes) throw Error("PACKAGE_INVALID");
          }
          const core = files.find((f) => f.path === PROTECTED_FILES[0]);
          if (!core || core.sha256 !== descriptor.ciphertextSha256 || core.size !== descriptor.ciphertextBytes) throw Error("PACKAGE_INVALID");
          const contract = partitionProtected(manifest, [...Object.keys(descriptor.publicFiles), descriptor.fullEntry]);
          if (contract.corePaths.length !== 1 || contract.publicPaths.length !== Object.keys(descriptor.publicFiles).length) throw Error("PACKAGE_INVALID");
        }
      } catch {
        add("error", "manifest.protected-invalid", "Protected profile, file set or trusted signature is invalid", "motion.json");
      }
    } else if (sealed || /\.enc$/i.test(String(manifest.runtime?.entry))) add("error", "manifest.protected-required", "Encrypted entries require a verified protected profile", "motion.json");
    const preview = manifest.preview;
    if (preview?.language !== void 0 && (!isPreviewLanguage(preview.language) || !preview.video))
      add("error", "preview.language", "preview.language \u9700\u4E3A\u652F\u6301\u7684\u7F51\u7AD9\u8BED\u8A00\u4EE3\u7801\uFF0C\u4E14\u5FC5\u987B\u58F0\u660E\u9ED8\u8BA4 video", "motion.json");
    if (preview?.locales !== void 0) {
      const locales = preview.locales;
      if (!preview.video || !locales || typeof locales !== "object" || Array.isArray(locales))
        add("error", "preview.locales", "preview.locales \u9700\u4E3A\u8BED\u8A00\u6620\u5C04\uFF0C\u5E76\u4FDD\u7559 preview.video \u4F5C\u4E3A\u9ED8\u8BA4\u9884\u89C8", "motion.json");
      else for (const [language, entry] of Object.entries(locales)) {
        if (!isPreviewLanguage(language) || language === preview.language || !entry || typeof entry !== "object" || Array.isArray(entry) || typeof entry.video !== "string") {
          add("error", "preview.locale", "\u8BED\u8A00 demo \u9700\u4F7F\u7528\u652F\u6301\u7684\u8BED\u8A00\u4EE3\u7801\u3001\u5305\u542B video\uFF0C\u4E14\u4E0D\u80FD\u91CD\u590D\u9ED8\u8BA4\u89C6\u9891\u7684\u8BED\u8A00", `preview.locales.${language}`);
          continue;
        }
        if (Object.keys(entry).some((key) => !["video", "card", "cover"].includes(key)))
          add("error", "preview.locale-field", "\u8BED\u8A00 demo \u53EA\u652F\u6301 video\u3001card\u3001cover", `preview.locales.${language}`);
      }
    }
    const demos = [preview, ...Object.values(preview?.locales && typeof preview.locales === "object" && !Array.isArray(preview.locales) ? preview.locales : {})];
    for (const demo of demos) {
      if (!demo || typeof demo !== "object") continue;
      for (const [field, value] of Object.entries(demo)) {
        if (!["video", "card", "cover"].includes(field)) continue;
        const ext = field === "cover" ? /\.(png|jpe?g|webp)$/i : /\.(mp4|webm)$/i;
        if (typeof value !== "string" || pathProblem(value) || value.includes(":") || !ext.test(value) || !files.some((file) => file.path === value))
          add("error", "preview.path", `preview.${field} \u9700\u4E3A\u5305\u5185\u6709\u6548\u5A92\u4F53\u8DEF\u5F84`, "motion.json");
      }
    }
    for (const reference of collectPackageReferences(manifest)) {
      const r = reference.path;
      if (pathProblem(r)) add("error", "manifest.ref-unsafe", `\u5F15\u7528\u4E86\u4E0D\u5B89\u5168\u7684\u8DEF\u5F84 ${r}`, "motion.json");
      else if (!(protectedMode && sealed && reference.scope === "core") && !files.some((f) => f.path === r))
        add("error", "manifest.ref-missing", `motion.json \u5F15\u7528\u7684\u6587\u4EF6\u4E0D\u5B58\u5728\uFF1A${r}`, "motion.json");
    }
    if (manifest.permissions?.network === true) add("warn", "permissions.network", "\u6A21\u677F\u58F0\u660E\u9700\u8981\u7F51\u7EDC\u3002\u5BBF\u4E3B\u5FC5\u987B\u5355\u72EC\u6388\u6743\uFF0C\u5E73\u53F0\u4F1A\u5728\u9875\u9762\u4E0A\u6807\u51FA\u3002", "motion.json");
    if (!manifest.ai?.summary && !manifest.ai?.entry) add("warn", "ai.summary", "\u5EFA\u8BAE\u63D0\u4F9B ai.summary \u6216 ai.entry\uFF0C\u5E2E\u52A9\u5404\u5BB6\u52A9\u624B\u6B63\u786E\u8BC6\u522B\uFF08\u89C4\u8303 \xA714\uFF09", "motion.json");
  }
  const pPath = manifest?.parameters?.schema ?? "params.schema.json";
  const pBuf = texts.get(pPath);
  if (pBuf) {
    try {
      params = JSON.parse(pBuf.toString("utf8"));
      if (params.type !== "object" || typeof params.properties !== "object") add("error", "params.shape", "\u53C2\u6570\u58F0\u660E\u9876\u5C42\u5FC5\u987B\u662F type: object \u4E14\u5305\u542B properties", pPath);
    } catch (e) {
      add("error", "params.json", `\u53C2\u6570\u58F0\u660E\u4E0D\u662F\u4E25\u683C JSON\uFF1A${e.message}`, pPath);
    }
  } else add("warn", "params.missing", "\u6CA1\u6709\u53C2\u6570\u58F0\u660E\uFF0C\u4F7F\u7528\u8005\u5C06\u65E0\u6CD5\u77E5\u9053\u54EA\u4E9B\u5185\u5BB9\u53EF\u4EE5\u66FF\u6362", pPath);
  if (manifest?.variants != null) {
    if (!Array.isArray(manifest.variants)) add("error", "variants.shape", "variants \u5FC5\u987B\u662F\u6570\u7EC4", "motion.json");
    else {
      const ids = /* @__PURE__ */ new Set();
      if (manifest.variants.length > 24) add("error", "variants.too-many", "\u6837\u5F0F\u5206\u652F\u6700\u591A 24 \u4E2A", "motion.json");
      for (const [i, v] of manifest.variants.slice(0, 24).entries()) {
        const at = `variants[${i}]`;
        if (!v || typeof v !== "object") {
          add("error", "variants.item", `${at} \u5FC5\u987B\u662F\u5BF9\u8C61`, "motion.json");
          continue;
        }
        if (typeof v.id !== "string" || !/^[a-z0-9][a-z0-9-]{0,39}$/.test(v.id)) {
          add("error", "variants.id", `${at}.id \u53EA\u80FD\u7528\u5C0F\u5199\u5B57\u6BCD\u3001\u6570\u5B57\u548C\u4E2D\u5212\u7EBF`, "motion.json");
          continue;
        }
        if (ids.has(v.id)) {
          add("error", "variants.duplicate", `\u6837\u5F0F\u5206\u652F id \u91CD\u590D\uFF1A${v.id}`, "motion.json");
          continue;
        }
        ids.add(v.id);
        if (typeof v.name !== "string" || !v.name.trim()) add("error", "variants.name", `${at}.name \u4E0D\u80FD\u4E3A\u7A7A`, "motion.json");
        if (v.swatch != null && !/^#[0-9a-fA-F]{6}$/.test(String(v.swatch))) add("warn", "variants.swatch", `${at}.swatch \u5E94\u4E3A #RRGGBB`, "motion.json");
        let values = {};
        const pb = typeof v.preset === "string" ? texts.get(v.preset) : void 0;
        if (typeof v.preset !== "string") add("error", "variants.preset", `${at} \u7F3A\u5C11 preset`, "motion.json");
        else if (!pb) add("error", "variants.preset-missing", `\u6837\u5F0F\u5206\u652F ${v.id} \u7684\u9884\u8BBE\u6587\u4EF6\u4E0D\u5B58\u5728\uFF1A${v.preset}`, "motion.json");
        else {
          try {
            values = JSON.parse(pb.toString("utf8"));
          } catch (e) {
            add("error", "variants.preset-json", `\u9884\u8BBE\u4E0D\u662F\u4E25\u683C JSON\uFF1A${e.message}`, v.preset);
          }
          const props = params?.properties ?? {};
          if (params && params.additionalProperties === false) {
            for (const k of Object.keys(values)) if (!(k in props)) add("error", "variants.unknown-param", `\u9884\u8BBE\u5305\u542B\u672A\u58F0\u660E\u7684\u53C2\u6570 ${k}`, v.preset);
          }
        }
        if (v.preview != null && !files.some((f) => f.path === v.preview)) add("error", "variants.preview-missing", `\u6837\u5F0F\u5206\u652F ${v.id} \u7684\u9884\u89C8\u6587\u4EF6\u4E0D\u5B58\u5728\uFF1A${v.preview}`, "motion.json");
        variants.push({ id: v.id, name: String(v.name ?? v.id).slice(0, 40), preset: String(v.preset ?? ""), swatch: v.swatch ?? null, preview: v.preview ?? null, description: String(v.description ?? "").slice(0, 200), values });
      }
    }
  }
  const gPath = manifest?.ai?.guide;
  if (typeof gPath !== "string") add("warn", "guide.missing", "\u7F3A\u5C11 ai.guide\uFF08guide.json\uFF09\uFF1A\u52A9\u624B\u5C06\u4E0D\u77E5\u9053\u600E\u4E48\u5F15\u5BFC\u7528\u6237\u63D0\u4F9B\u7D20\u6750\u3001\u600E\u4E48\u8C03\u6574\u65F6\u957F", "motion.json");
  else if (texts.has(gPath)) {
    try {
      guide = JSON.parse(texts.get(gPath).toString("utf8"));
    } catch (e) {
      add("error", "guide.json", `guide.json \u4E0D\u662F\u4E25\u683C JSON\uFF1A${e.message}`, gPath);
    }
    if (guide) for (const g of checkGuide(guide, params, manifest)) add(g.level, g.code, g.message, gPath);
  }
  const rBuf = texts.get("README.md");
  if (rBuf) readme = rBuf.toString("utf8").slice(0, 2e5);
  else add("warn", "readme.missing", "\u7F3A\u5C11 README.md");
  if (!files.some((f) => f.path.startsWith("licenses/")) && !manifest?.license?.file) add("warn", "license.missing", "\u7F3A\u5C11 licenses/ \u8BB8\u53EF\u6587\u4EF6");
  if (!files.some((f) => /^previews\//.test(f.path))) add("info", "preview.missing", "\u5305\u5185\u6CA1\u6709 previews/\uFF0C\u5E73\u53F0\u5C06\u4F7F\u7528\u4F60\u5355\u72EC\u4E0A\u4F20\u7684\u9884\u89C8");
  if (!files.some((f) => f.path === "asset-manifest.json")) add("info", "assets.manifest", "\u5EFA\u8BAE\u63D0\u4F9B asset-manifest.json \u8BB0\u5F55\u7D20\u6750\u6765\u6E90\u4E0E\u8BB8\u53EF");
  const iPath = manifest?.integrity ?? "integrity.json";
  const iBuf = texts.get(iPath);
  if (iBuf) {
    try {
      const integ = JSON.parse(iBuf.toString("utf8"));
      const map = integ.files ?? integ;
      let bad = 0, missing = 0;
      for (const f of files) {
        if (f.path === iPath || f.path === PERSONAL_KEY_FILE) continue;
        const want = map[f.path];
        if (!want) {
          missing++;
          continue;
        }
        if (String(want).replace(/^sha256[:-]/, "").toLowerCase() !== f.sha256) {
          bad++;
          add("error", "integrity.mismatch", "SHA256 \u4E0E integrity.json \u4E0D\u4E00\u81F4", f.path);
        }
      }
      if (missing) {
        if (manifest?.distribution?.mode === "protected") add("error", "integrity.incomplete", `${missing} \u4E2A\u6587\u4EF6\u672A\u5217\u5165 integrity.json`);
        else add("warn", "integrity.incomplete", `${missing} \u4E2A\u6587\u4EF6\u672A\u5217\u5165 integrity.json`);
      }
      if (!bad && !missing) add("info", "integrity.ok", "\u6240\u6709\u6587\u4EF6\u6458\u8981\u4E00\u81F4");
    } catch (e) {
      add("error", "integrity.json", `integrity.json \u65E0\u6CD5\u89E3\u6790\uFF1A${e.message}`, iPath);
    }
  } else add("warn", "integrity.missing", "\u7F3A\u5C11 integrity.json\uFF0C\u65E0\u6CD5\u6821\u9A8C\u6587\u4EF6\u5B8C\u6574\u6027");
  for (const [p, buf] of texts) {
    if (p === iPath) continue;
    const s = buf.toString("utf8");
    for (const r of SECRET_RULES) if (r.re.test(s)) add("error", r.code, `\u68C0\u6D4B\u5230${r.label}\uFF0C\u8BF7\u5728\u672C\u5730\u7528 MotionGit Skill \u53BB\u9664\u540E\u91CD\u65B0\u6253\u5305`, p);
    for (const r of PII_RULES) if (r.re.test(s)) add(r.code === "pii.email" ? "warn" : "error", r.code, r.code === "pii.email" ? `\u68C0\u6D4B\u5230${r.label}\uFF0C\u5982\u679C\u4E0D\u662F\u516C\u5F00\u8054\u7CFB\u65B9\u5F0F\u8BF7\u53BB\u9664` : `\u68C0\u6D4B\u5230${r.label}\uFF0C\u8BF7\u5728\u672C\u5730\u7528 MotionGit Skill \u53BB\u9664\u540E\u91CD\u65B0\u6253\u5305`, p);
  }
  const tool = manifest?.ai?.authoring?.tool ?? manifest?.authoring?.tool ?? null;
  const recommendation = opts.recommendAuthoring ?? opts.expectAuthoring;
  if (recommendation) {
    const allowed = (Array.isArray(recommendation) ? recommendation : [recommendation]).map((x) => x.toLowerCase());
    const names = allowed.map((x) => AUTHORING_LABELS[x] ?? x).join(" / ");
    if (!tool) add("warn", "authoring.missing", "\u5EFA\u8BAE\u5982\u5B9E\u586B\u5199 ai.authoring.tool\uFF1B\u5236\u4F5C\u4E0E\u6253\u5305\u5DE5\u5177\u5206\u522B\u8BB0\u5F55\uFF0C\u6700\u7EC8\u4EE5\u6548\u679C\u5BA1\u6838\u4E3A\u51C6\u3002", "motion.json");
    else if (!allowed.some((x) => String(tool).trim().toLowerCase() === x)) add("warn", "authoring.recommended", `\u5236\u4F5C\u6765\u6E90\u4E3A ${tool}\uFF1B\u5EFA\u8BAE\u4F7F\u7528 ${names}\uFF0C\u4E0D\u6309\u5DE5\u5177\u540D\u79F0\u9650\u5236\u4E0A\u4F20\uFF0C\u6700\u7EC8\u4EE5\u6548\u679C\u5BA1\u6838\u4E3A\u51C6\u3002`, "motion.json");
  }
  return finalize();
  function finalize() {
    const has = (pre, lvl) => findings.some((f) => f.code.startsWith(pre) && (!lvl || f.level === lvl));
    const st = (pre) => pre.some((p) => has(p, "error")) ? "fail" : pre.some((p) => has(p, "warn")) ? "warn" : "pass";
    const checks = [
      { id: "structure", label: "\u5305\u7ED3\u6784\u4E0E\u8DEF\u5F84\u5B89\u5168", status: st(["zip", "path", "content"]) },
      { id: "manifest", label: "\u6839\u6E05\u5355 motion.json", status: st(["manifest", "permissions", "ai."]) },
      { id: "params", label: "\u53C2\u6570\u5951\u7EA6\u4E0E\u6837\u5F0F\u5206\u652F", status: st(["params", "variants"]) },
      { id: "guide", label: "\u7528\u6237\u5F15\u5BFC\u4E0E\u65F6\u957F\u9002\u914D", status: st(["guide"]) },
      { id: "integrity", label: "\u6587\u4EF6\u5B8C\u6574\u6027", status: st(["integrity"]) },
      { id: "privacy", label: "\u4E2A\u4EBA\u4FE1\u606F\u4E0E\u51ED\u636E", status: st(["secret", "pii", "path.abs"]) },
      { id: "license", label: "\u8BF4\u660E\u4E0E\u8BB8\u53EF", status: st(["readme", "license"]) },
      { id: "authoring", label: "\u5236\u4F5C\u6765\u6E90", status: st(["authoring"]) }
    ];
    return {
      ok: !findings.some((f) => f.level === "error"),
      specVersion: SPEC_VERSION,
      packageSha256,
      packageSize,
      fileCount: files.length,
      totalUncompressed: total,
      files,
      manifest,
      params,
      readme,
      guide,
      variants,
      authoring: { tool: manifest?.ai?.authoring?.tool ?? null, declared: !!manifest?.ai?.authoring?.tool },
      findings,
      checks
    };
  }
}

// packages/motion-spec/src/pack.ts
var import_yazl2 = __toESM(require_yazl(), 1);
import crypto4 from "node:crypto";
import fs2 from "node:fs";
var FIXED_TIME = /* @__PURE__ */ new Date("2026-01-01T00:00:00Z");
async function buildPackage(files, outPath) {
  const list = files.filter((f) => f.path !== "integrity.json").map((f) => ({ path: f.path, data: Buffer.isBuffer(f.data) ? f.data : Buffer.from(f.data) }));
  for (const f of list) {
    const p = pathProblem(f.path);
    if (p) throw new Error(`${f.path}: ${p}`);
  }
  list.sort((a, b) => a.path.localeCompare(b.path));
  const integrity = { algorithm: "sha256", files: Object.fromEntries(list.map((f) => [f.path, crypto4.createHash("sha256").update(f.data).digest("hex")])) };
  list.push({ path: "integrity.json", data: Buffer.from(JSON.stringify(integrity, null, 2) + "\n") });
  const zip = new import_yazl2.default.ZipFile();
  for (const f of list) zip.addBuffer(f.data, f.path, { mtime: FIXED_TIME, mode: 33188, compress: !/\.(mp4|webm|png|jpe?g|webp|zip)$/i.test(f.path) });
  zip.end();
  await new Promise((res, rej) => zip.outputStream.pipe(fs2.createWriteStream(outPath)).on("close", () => res()).on("error", rej));
  const buf = fs2.readFileSync(outPath);
  return { sha256: crypto4.createHash("sha256").update(buf).digest("hex"), size: buf.length };
}

// packages/motion-spec/src/cli.ts
import { fileURLToPath } from "node:url";

// packages/motion-spec/src/official-helper.ts
import fs7 from "node:fs/promises";
import path5 from "node:path";
import os3 from "node:os";
import crypto9 from "node:crypto";
import { spawn } from "node:child_process";

// packages/motion-spec/src/official-trust.ts
import crypto5 from "node:crypto";
import fs3 from "node:fs/promises";
import path from "node:path";
import os from "node:os";
var MOTION_HELPER_VERSION = "1.0.0-rc.13";
var OFFICIAL_SIGNING_DIRECTORY = "https://motiongit.com/api/v1/signing-keys";
var BUILTIN_PERSONAL_SIGNING_KEYS = Object.freeze({});
var BUILTIN_PROTECTED_SIGNING_KEYS = Object.freeze({});
function defaultSigningTrustCacheDirectory() {
  if (process.platform === "darwin") return path.join(os.homedir(), "Library", "Caches", "MotionGit", "signing-trust");
  if (process.platform === "win32") return path.join(process.env.LOCALAPPDATA ?? path.join(os.homedir(), "AppData", "Local"), "MotionGit", "signing-trust");
  return path.join(process.env.XDG_CACHE_HOME ?? path.join(os.homedir(), ".cache"), "motiongit", "signing-trust");
}
function privateOwned(stat) {
  return (process.platform === "win32" || !(stat.mode & 63)) && (typeof process.getuid !== "function" || stat.uid === process.getuid());
}
async function trustCacheFile(directory, create = false) {
  if (directory === false) return null;
  const root = path.resolve(directory);
  if (create) await fs3.mkdir(root, { recursive: true, mode: 448 });
  try {
    const stat = await fs3.lstat(root);
    if (!stat.isDirectory() || stat.isSymbolicLink() || !privateOwned(stat) || await fs3.realpath(root) !== root) throw Error("SIGNING_TRUST_CACHE_INVALID");
    return path.join(root, "official-signing-keys-v1.json");
  } catch (error) {
    if (!create && error.code === "ENOENT") return null;
    throw error;
  }
}
async function readCachedTrust(directory) {
  const file = await trustCacheFile(directory);
  if (!file) throw Error("SIGNING_TRUST_UNAVAILABLE");
  let stat;
  try {
    stat = await fs3.lstat(file);
  } catch {
    throw Error("SIGNING_TRUST_UNAVAILABLE");
  }
  if (!stat.isFile() || stat.isSymbolicLink() || !privateOwned(stat) || stat.size > 64 * 1024) throw Error("SIGNING_TRUST_CACHE_INVALID");
  const trust = parseOfficialSigningDirectory(await fs3.readFile(file));
  if (!Object.keys(trust.personal).length) throw Error("SIGNING_TRUST_UNAVAILABLE");
  return trust;
}
async function cacheOfficialDirectory(directory, bytes) {
  const file = await trustCacheFile(directory, true);
  if (!file) return;
  try {
    const current = await fs3.lstat(file);
    if (!current.isFile() || current.isSymbolicLink() || !privateOwned(current)) throw Error("SIGNING_TRUST_CACHE_INVALID");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const temporary = file + "." + crypto5.randomUUID() + ".tmp";
  try {
    await fs3.writeFile(temporary, jcs(parseProtectedJson(bytes, 64 * 1024)) + "\n", { flag: "wx", mode: 384 });
    await fs3.rename(temporary, file);
  } finally {
    await fs3.rm(temporary, { force: true });
  }
}
async function boundedResponse(response, maximum) {
  if (Number(response.headers.get("content-length") ?? 0) > maximum || !response.body) throw Error("RESPONSE_LIMIT_EXCEEDED");
  const reader = response.body.getReader(), chunks = [];
  let size = 0;
  try {
    for (; ; ) {
      const next = await reader.read();
      if (next.done) break;
      size += next.value.length;
      if (size > maximum) {
        await reader.cancel();
        throw Error("RESPONSE_LIMIT_EXCEEDED");
      }
      chunks.push(next.value);
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks);
}
function parseOfficialSigningDirectory(bytes) {
  const value = parseProtectedJson(bytes, 64 * 1024);
  if (!value || Object.keys(value).sort().join() !== "keys,profile" || value.profile !== "motiongit.public-signing-keys/1" || !Array.isArray(value.keys) || value.keys.length > 32) throw Error("SIGNING_TRUST_INVALID");
  const personal = {}, protectedKeys = {};
  for (const entry of value.keys) {
    if (!entry || Object.keys(entry).sort().join() !== "algorithm,id,publicKey,purpose" || entry.algorithm !== "Ed25519" || typeof entry.id !== "string" || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(entry.id) || !["personal-download", "protected-release"].includes(entry.purpose) || typeof entry.publicKey !== "string" || entry.publicKey.length > 2048 || !/^-----BEGIN PUBLIC KEY-----\n[\s\S]+\n-----END PUBLIC KEY-----\n?$/.test(entry.publicKey)) throw Error("SIGNING_TRUST_INVALID");
    let publicKey;
    try {
      publicKey = crypto5.createPublicKey(entry.publicKey);
    } catch {
      throw Error("SIGNING_TRUST_INVALID");
    }
    if (publicKey.asymmetricKeyType !== "ed25519") throw Error("SIGNING_TRUST_INVALID");
    const target = entry.purpose === "personal-download" ? personal : protectedKeys;
    if (Object.hasOwn(target, entry.id)) throw Error("SIGNING_TRUST_INVALID");
    target[entry.id] = publicKey.export({ type: "spki", format: "pem" }).toString();
  }
  return { personal: Object.freeze(personal), protected: Object.freeze(protectedKeys) };
}
async function loadOfficialTrust(options2 = {}) {
  if (options2.trust) return options2.trust;
  const builtin = { personal: BUILTIN_PERSONAL_SIGNING_KEYS, protected: BUILTIN_PROTECTED_SIGNING_KEYS };
  if (Object.keys(builtin.personal).length) return builtin;
  const cache = options2.trustCacheDirectory ?? defaultSigningTrustCacheDirectory();
  if (options2.offline) return readCachedTrust(cache);
  let response;
  try {
    response = await (options2.transport ?? fetch)(
      OFFICIAL_SIGNING_DIRECTORY,
      { redirect: "error", signal: AbortSignal.timeout(15e3) }
    );
  } catch {
    return readCachedTrust(cache);
  }
  try {
    if (!response.ok || response.redirected) throw Error();
    const bytes = await boundedResponse(response, 64 * 1024), trust = parseOfficialSigningDirectory(bytes);
    if (!Object.keys(trust.personal).length) throw Error();
    await cacheOfficialDirectory(cache, bytes);
    return trust;
  } catch {
    throw Error("SIGNING_TRUST_UNAVAILABLE");
  }
}

// packages/motion-spec/src/assistant-entry.ts
var ASSISTANT_PROFILE = "motiongit.assistant-entry/1";
var ASSISTANT_FILES = [
  "00-START-HERE.md",
  "assistant/guide.json",
  "assistant/motion.mjs",
  "assistant/BUILD.json",
  "assistant/THIRD-PARTY-NOTICES.txt"
];
var ASSISTANT_EXTENSION = "motiongit.com:assistant-entry";
function validateAssistantBundle(bundle) {
  const build = JSON.parse(bundle.build.toString("utf8"));
  if (build.profile !== "motiongit.public-helper-build/1" || build.sha256 !== hashBytes(bundle.helper) || build.bytes !== bundle.helper.length || build.minimumNode !== 22 || !/^1\.0\.0-rc\.(?:[7-9]|[1-9]\d+)$/.test(build.helperVersion) || !bundle.notices.length)
    throw Error("ASSISTANT_BUNDLE_INVALID");
  return build;
}
function assistantGuide(manifest, version, helperVersion = MOTION_HELPER_VERSION) {
  const output = manifest.output ?? {};
  const poster = manifest.extensions?.["motiongit.com:poster-kit"];
  const textWorkflow = poster?.guide === "poster-kit-guide.json" && poster?.timelineSchema === "poster-timeline.schema.json";
  return {
    profile: ASSISTANT_PROFILE,
    template: {
      id: manifest.template.id,
      name: manifest.template.name,
      version,
      layout: output.defaultLayout ?? (output.width > output.height ? "landscape" : "portrait"),
      width: output.width,
      height: output.height
    },
    firstRead: "00-START-HERE.md",
    templateGuide: manifest.ai?.guide ?? "guide.json",
    parameterSchema: manifest.parameters?.schema ?? "params.schema.json",
    bootstrap: {
      extractOnly: [...ASSISTANT_FILES, "README.md"],
      keepInsideOriginalArchive: ["motion.json", "personal/", "content/"],
      directoryMode: "0700 on POSIX; current-user-only access on Windows",
      instruction: "Extract only the listed guide/tool files. The verified helper reads credentials and content from the original .motion; no extracted personal identifier is needed."
    },
    workflowRouting: textWorkflow ? {
      decideBefore: "setup, check-params, plan, or loading any demo preset",
      textOnly: {
        when: "\u7528\u6237\u53EA\u6709\u6587\u6848\uFF0C\u6216\u660E\u786E\u4E0D\u8981\u771F\u4EBA/\u914D\u97F3\uFF1A\u9009 poster-kit\u3002\u7EAF\u6587\u5B57\u52A8\u6548\u4E0D\u9700\u8981\u771F\u4EBA\u3001\u5B57\u5E55\u3001ASR \u6216\u65C1\u767D\uFF1B\u80CC\u666F\u97F3\u4E50\u4ECD\u6309\u9ED8\u8BA4\u5339\u914D\u89C4\u5219\u5904\u7406\u3002",
        workflow: "poster-kit",
        guide: poster.guide,
        parameterSchema: poster.timelineSchema,
        readFirst: ["poster-kit-guide.json", "poster-timeline.schema.json", ...typeof poster.controlContract === "string" ? [poster.controlContract] : []],
        commandArgument: ["--workflow", "poster-kit"],
        input: "Create a new timeline from the user text using the selected controls. Never route this case through native media.talk/params.json or demo presets."
      },
      recordedSpeech: { when: "\u7528\u6237\u63D0\u4F9B\u771F\u5B9E\u53E3\u64AD\u89C6\u9891\u5E76\u5E0C\u671B\u4FDD\u7559\u4EBA\u7269\u53CA\u8BED\u97F3\u65F6\uFF0C\u8BFB\u539F\u751F guide.json \u4E0E params.schema.json\uFF0C\u6309\u771F\u5B9E\u7D20\u6750\u7F16\u6392\u3002", workflow: "native" },
      style: "Read the selected workflow guide for its palette, typography and reviewed control variants; do not copy visual descriptions or parameter schemas from another workflow.",
      demo: "Demo presets are author examples, not a way to discover missing contracts and not user input. Use the public guide/schema through read; if missing, report the exact missing document."
    } : { decideBefore: "setup or plan", instruction: "Read the actual template guide and schema. Do not invent a text-only route, required media, or controls not declared by this template." },
    intake: {
      readOnlyFirst: ["00-START-HERE.md", "assistant/guide.json"],
      usageQuestion: "When the user asks what this is or how to use it, first explain the declared template, required user materials, working environment and preview/export steps. Reading public instructions does not require running package code, installing tools, fetching an update or starting production. Label unverified package claims as unverified.",
      executionCheck: "Before production, confirm that this conversation can actually read the supplied file and run Node.js 22+. For this workflow, prefer a local work mode connected to the production files. A cloud task does not automatically have access to computer-local paths; verify its actual uploaded-file and runtime tools separately. Desktop, Chat and Work labels alone do not establish these capabilities.",
      failedRead: "After an actual file-access or approval failure, promptly state what was not read and provide the available usage explanation. Do not repeatedly retry the same failed action or claim a template identity you have not read.",
      expiredApproval: "An approval request that is no longer active cannot be reused. Explain the blocked operation and recovery; any needed fresh request must refer to the current operation and respect existing valid authorization. Never suggest disabling approval or sandbox protections."
    },
    firstReply: "\u7528\u6237\u53EA\u95EE\u201C\u662F\u4EC0\u4E48\uFF0F\u600E\u4E48\u7528\u201D\u65F6\uFF0C\u5148\u7B80\u77ED\u89E3\u91CA\u6A21\u677F\u3001\u9700\u51C6\u5907\u7684\u7D20\u6750\u3001\u53EF\u7528\u5236\u4F5C\u73AF\u5883\u548C\u9884\u89C8\u5BFC\u51FA\u6B65\u9AA4\uFF0C\u4E0D\u5148\u5B89\u88C5\u3001\u8054\u7F51\u9A8C\u7B7E\u6216\u6E32\u67D3\u3002\u7528\u6237\u8981\u6C42\u5236\u4F5C\u65F6\uFF0C\u518D\u7406\u89E3\u5DF2\u6709\u6587\u7A3F\u3001\u53E3\u64AD\u6216\u7D20\u6750\uFF1B\u4E0D\u8981\u91CD\u590D\u95EE\u5DF2\u63D0\u4F9B\u7684\u5185\u5BB9\uFF0C\u4E5F\u4E0D\u8BA9\u7528\u6237\u586B\u5199\u53C2\u6570\u8868\u3002",
    execution: {
      entry: "assistant/motion.mjs",
      verifyBeforeExecution: {
        metadataUrl: "https://motiongit.com/assets/motion-runtimes/" + helperVersion + ".json",
        method: "Before executing bundled code, use system hashing/HTTPS tools to compare its SHA256 and size with this fixed official HTTPS metadata. Reject redirects or mismatch. Do not use package-supplied public keys as trust roots. This reads public metadata only; sends no credential."
      },
      command: ["node", "assistant/motion.mjs", "start", "<original.motion>"],
      globalMotionCommandRequired: false,
      separateSkillDownloadRequired: false,
      websiteLoginRequired: false,
      credential: "Use the downloader identifier already inside this package, only after signature verification.",
      core: "release.bin and core.enc are internal implementation files. Do not probe or manually unpack them.",
      environment: "Use the assistant environment\u2019s existing Node.js 22+ for the bundled entry. Rendering uses the template\u2019s declared Python/browser/encoder dependencies. Native setup installs the standard standalone Chromium headless shell when absent; the helper automatically selects an installed automation browser. Do not claim dependencies are bundled or already tested. If setup fails, report the exact environment limitation and continue content planning; do not tell the user to download a MotionGit host.",
      browser: {
        selection: "installed standalone Chromium headless shell",
        setup: "Use the bundled setup operation for the ordinary browser dependency.",
        safety: "Do not clone or modify a user Chrome app, remove code signatures, or delete user RLZ/preferences/profile files. Automation uses its own temporary profile. An explicit CHROME_PATH override is validated separately."
      }
    },
    identity: "This version and layout describe the delivered template. Inner versions are frozen source history. Read verified deliveryIdentity before describing the current package.",
    workflow: [
      "Read current template guide and user materials",
      "Match one licensed background track through the API from the copy, template style and planned duration; respect explicit user music choices",
      "Choose suitable controls and adapt their style, colors, size and position",
      "Create user inputs and a plan; show the proposed content to the user",
      "Prepare and inspect actual previews",
      "Render and check the complete video"
    ],
    productionContract: {
      copy: {
        preserve: ["negation", "conditions", "qualifiers and frequency", "numbers and units", "causal relations", "names"],
        fitOrder: ["wrap by phrases", "use the declared size range", "split across suitable controls", "show a proposed rewrite for user confirmation"],
        evidence: "Keep the original user copy and the actual on-screen copy in the instance; compare them before preview and after revisions. Do not silently remove words to fit a card."
      },
      controls: "Choose by meaning as well as appearance. A crossed-out or completed checklist does not represent unanswered questions or required outputs. Read the actual variant contract; use a supported neutral control if completion semantics do not fit.",
      revisions: {
        preservePrevious: true,
        deleteToRetry: false,
        instruction: "Save every changed plan, preview and complete video to a fresh revision path. Reuse only verified immutable inputs; do not delete prior output or reset a review flag without inspecting the new result."
      },
      sound: "Distinguish narration, music, motion sound effects and complete silence. Read the selected workflow audio controls and limitations; no narration does not imply no sound.",
      backgroundMusic: {
        default: "api-matched",
        trigger: "After receiving the user copy and estimating the intended duration, request one licensed background track using the verified downloader identifier already in this package.",
        match: ["copy meaning and mood", "template category and visual style", "planned duration", "speech clarity"],
        exceptions: ["The user explicitly requests no background music or complete silence.", "The user provides or explicitly selects a particular track; use it according to the supplied rights and instructions."],
        preserveReviewedMusic: "When revising an already approved video, retain its approved music unless the user requests a change.",
        contract: "motiongit.music-recommendation/1",
        minHelperVersion: "1.0.0-rc.10",
        prepare: {
          command: ["node", "assistant/motion.mjs", "api", "<original.motion>", "music-prepare", "<instance/music-request.json>", "<instance/music-v1>"],
          input: { text: "The actual user copy", template_category: "The actual template category", template_style: "Its palette/style and desired music mood", duration_s: 45, language: "zh" },
          instruction: "Replace example fields with the current video. The parent instance must exist and music-v1 must be new. This free operation returns a complete duration-matched background.wav and saves recommendation, source license/SHA, download and preparation receipts. It uses existing FFmpeg/ffprobe. It does not mix or render the video.",
          result: "Bind returned output to the documented music input, using the input vault rules. Keep all receipts. No music is ready if failure.json exists. After voice timing changes, check the duration and prepare a fresh version if necessary."
        },
        execution: "Use the live official music recommendation contract through the bundled entry, select/download the returned track into this production instance, verify its identity, and bind the local file to the workflow music input. Record track ID, license, attribution, source SHA and intended mix in the instance; never insert personal credentials.",
        mix: "Preserve motion sound effects and narration separately. Keep music below speech, use appropriate fades, and check the complete final soundtrack. Loop only when the returned music metadata permits it; otherwise request a track long enough for the video.",
        failure: "An unavailable service, scope denial, missing track or unsupported template music input is an unresolved music step. Continue independent planning, report the actual limitation, and do not silently substitute no music, an old demo soundtrack or paid generation.",
        noExtraUserSetup: true
      },
      validation: "Inspect actual frames and the complete encoded video in the declared layout. Record rendered, visually checked and listened separately; never treat a successful plan as a rendered or approved video."
    },
    assistantResponsibilities: [
      "Choose native or component workflow from user content; do not burden the user with a technical A/B decision.",
      "All inner commands beginning with motion are shorthand for node <this-package>/assistant/motion.mjs.",
      "Ignore historical instructions to download a separate helper or skill. This package already includes the entry.",
      "Do not print or ask for the personal identifier; keep it in the original package and never copy it to a project or output.",
      "Do not invent installed tools, successful rendering, word timings, media, or authentication.",
      "Check updates using the bundled entry and existing identifier. Download an update only after user confirmation; retain the old package and project.",
      "No paid generation or account changes are implied by opening the package."
    ]
  };
}

// packages/motion-spec/src/personal-package.ts
import crypto6 from "node:crypto";
var import_yauzl3 = __toESM(require_yauzl(), 1);

// packages/motion-spec/src/delivery-stage.ts
function english(name, text = "") {
  return /(?:^|\/)en(?:-[A-Za-z]+)?\//.test(name) || !!text && !new RegExp("\\p{Script=Han}", "u").test(text.slice(0, 256));
}
function historicalParagraphs(text, en) {
  return text.split(/\n\s*\n/).map((p) => !p.trimStart().startsWith(">") && /(?:尚未封装|尚不是已封装|not yet (?:a )?sealed)/i.test(p) ? (en ? "**Author input stage (historical; not the current release stage):**" : "**\u4F5C\u8005\u8F93\u5165\u9636\u6BB5\uFF08\u5386\u53F2\u8BB0\u5F55\uFF0C\u4E0D\u4EE3\u8868\u5F53\u524D\u53D1\u884C\u9636\u6BB5\uFF09\uFF1A**") + "\n\n" + p.split("\n").map((line) => "> " + line).join("\n") : p).join("\n\n");
}
function personalDeliveryDescription(identity, en = false, verified = false) {
  return en ? `# Current delivery stage: ${verified ? "verified personal download" : "personal download (verify before use)"}

Template ${identity.templateId}, release ${identity.releaseId}, carrier ${identity.templateVersion}; recipient account ${identity.recipientAccountId}, original Key ID ${identity.apiKeyId}. The recipient envelope and release identity must be verified against external trusted signing keys before use.

The content layer is ${identity.protection === "protected" ? "a separately signed, sealed protected core" : "an open release"}. Its stage descriptions refer to that inner layer. The signed personal receipt identifies this recipient copy; original unsigned author build receipts are source history, not its current status. Neither this note nor an author-declared stage grants publication, download or unlock permission. The host uses the existing recipient Key without copying it into instances or exports.

---

` : `# \u5F53\u524D\u4EA4\u4ED8\u9636\u6BB5\uFF1A${verified ? "\u5DF2\u9A8C\u7B7E\u7684\u4E2A\u4EBA\u4E0B\u8F7D" : "\u4E2A\u4EBA\u4E0B\u8F7D\uFF08\u4F7F\u7528\u524D\u987B\u9A8C\u7B7E\uFF09"}

\u6A21\u677F ${identity.templateId}\uFF0C\u53D1\u884C ${identity.releaseId}\uFF0C\u4EA4\u4ED8\u7248\u672C ${identity.templateVersion}\uFF1B\u6536\u4EF6\u4EBA\u8D26\u6237 ${identity.recipientAccountId}\uFF0C\u672C\u4EBA\u539F Key \u7F16\u53F7 ${identity.apiKeyId}\u3002\u4F7F\u7528\u524D\u987B\u4EE5\u5916\u90E8\u53EF\u4FE1\u7B7E\u540D\u516C\u94A5\u6838\u9A8C\u6536\u4EF6\u4EBA\u4FE1\u5C01\u53CA\u53D1\u884C\u8EAB\u4EFD\u3002

\u5185\u5BB9\u5C42\u662F${identity.protection === "protected" ? "\u53E6\u884C\u7B7E\u540D\u3001\u5DF2\u7ECF\u5C01\u88C5\u7684\u53D7\u4FDD\u62A4\u6838\u5FC3" : "\u5F00\u653E\u53D1\u884C"}\uFF0C\u5176\u4E2D\u7684\u4EA4\u4ED8\u9636\u6BB5\u8BF4\u660E\u63CF\u8FF0\u5185\u5C42\u6838\u5FC3\u3002\u5DF2\u7B7E\u540D\u4E2A\u4EBA\u56DE\u6267\u51B3\u5B9A\u8FD9\u4E00\u6536\u4EF6\u4EBA\u526F\u672C\u7684\u8EAB\u4EFD\uFF1B\u539F\u672A\u7B7E\u540D\u4F5C\u8005\u6784\u5EFA\u56DE\u6267\u4EC5\u662F\u6765\u6E90\u5386\u53F2\uFF0C\u4E0D\u662F\u5F53\u524D\u72B6\u6001\u3002\u672C\u8BF4\u660E\u53CA\u4F5C\u8005\u81EA\u62A5\u9636\u6BB5\u4E0D\u6388\u4E88\u53D1\u5E03\u3001\u4E0B\u8F7D\u6216\u89E3\u9501\u6743\u9650\u3002\u5BBF\u4E3B\u4F7F\u7528\u6536\u4EF6\u4EBA\u672C\u4EBA\u5DF2\u6709 Key\uFF0C\u4E0D\u628A\u5B83\u590D\u5236\u5230\u5B9E\u4F8B\u6216\u5BFC\u51FA\u7269\u3002

---

`;
}
function personalizeDocumentDescription(identity, name, text) {
  const en = english(name, text);
  return personalDeliveryDescription(identity, en, true) + historicalParagraphs(text, en);
}

// packages/motion-spec/src/protected-archive.ts
function parsePublicContract(name, data) {
  return parseProtectedJson(data, name === "locales/index.json" ? textScanLimit(name) : void 0);
}
function required(files, name) {
  const value = files.get(name);
  if (!value) throw Error("PACKAGE_INVALID");
  return value;
}
function checkPlaintext(files) {
  for (const [name, bytes] of files) {
    if (isForbidden(name) || name === PERSONAL_KEY_FILE) throw Error("PACKAGE_INVALID");
    if (isTextFile(name) && (bytes.length > textScanLimit(name) || scanText(new TextDecoder("utf-8", { fatal: true }).decode(bytes)).some((f) => f.level === "error"))) throw Error("PACKAGE_INVALID");
  }
}
async function verifyProtectedPackage(archive, trusted) {
  const files = await readSafeArchive(archive, { maxFileBytes: RELEASE_MAX_BYTES });
  const descriptor = parseProtectedJson(required(files, PROTECTED_FILES[1]));
  const signature = parseProtectedJson(required(files, PROTECTED_FILES[2]));
  const ciphertext = required(files, PROTECTED_FILES[0]);
  const publicFiles = new Map([...files].filter(([name]) => name !== "integrity.json" && !PROTECTED_FILES.includes(name)));
  const verified = verifyEnvelope(descriptor, signature, ciphertext, publicFiles, trusted);
  verifyFrozenIntegrity(files);
  const manifest = parseProtectedJson(required(publicFiles, "motion.json"));
  const partition = partitionProtected(manifest, [...publicFiles.keys(), verified.descriptor.fullEntry]);
  if (partition.corePaths.length !== 1 || partition.publicPaths.length !== publicFiles.size || manifest.distribution.fullEntry !== verified.descriptor.fullEntry) throw Error("PACKAGE_INVALID");
  for (const [name, data] of publicFiles) if (name.endsWith(".json")) parsePublicContract(name, data);
  return { ...verified, ciphertext, publicFiles };
}
async function decryptProtectedPackage(verified, dek) {
  const plaintext = decryptCore(verified, verified.ciphertext, dek);
  try {
    const files = await readSafeArchive(plaintext);
    verifyFrozenIntegrity(files);
    checkPlaintext(files);
    if (!files.has(verified.descriptor.fullEntry) || files.has("motion.json") || [...files.keys()].some((name) => name.startsWith("protected/") || verified.publicFiles.has(name))) throw Error("PACKAGE_INVALID");
    const combined = [...verified.publicFiles.keys(), ...[...files.keys()].filter((name) => name !== "integrity.json")];
    const expected = partitionProtected(verified.manifest, combined).corePaths;
    if (JSON.stringify(expected) !== JSON.stringify([...files.keys()].filter((name) => name !== "integrity.json").sort())) throw Error("PACKAGE_INVALID");
    assertResolvedPackageReferences(verified.manifest, [...combined, "integrity.json"]);
    return files;
  } finally {
    plaintext.fill(0);
  }
}

// packages/motion-spec/src/personal-package.ts
var PERSONAL_SPEC_VERSION = "1.0.0-rc.1";
var PERSONAL_PROFILE = "personal-download-v1";
var PERSONAL_API_ORIGIN = "https://motiongit.com/api/v1";
var PERSONAL_FILES = Object.freeze([
  "motion.json",
  "README.md",
  "content/release.bin",
  "personal/motiongit.key.json",
  "personal/receipt.json",
  "personal/signature.json"
]);
var SIGNED_FILES = PERSONAL_FILES.slice(0, 4);
var ALL_PERSONAL_FILES = [...PERSONAL_FILES, ...ASSISTANT_FILES];
function signedFiles(files) {
  const names = Object.keys(files);
  const expected = names.length === SIGNED_FILES.length ? [...SIGNED_FILES] : [...SIGNED_FILES, ...ASSISTANT_FILES];
  if (names.length !== expected.length || expected.some((name) => !Object.hasOwn(files, name))) invalid();
  return expected;
}
var KiB = 1024;
var PERSONAL_LIMITS = Object.freeze({
  releaseBytes: RELEASE_MAX_BYTES,
  metadataBytes: 256 * KiB,
  assistantBytes: 1024 * KiB,
  manifestBytes: 16 * KiB,
  credentialBytes: 16 * KiB,
  receiptBytes: 64 * KiB,
  signatureBytes: 4 * KiB,
  zipOverheadBytes: 64 * KiB,
  archiveBytes: RELEASE_MAX_BYTES + 1344 * KiB
});
var VerifiedPersonalCredentials = class {
  credentialVersion = "1";
  recipientAccountId;
  apiKeyId;
  apiOrigin = PERSONAL_API_ORIGIN;
  #token;
  constructor(value) {
    this.recipientAccountId = value.recipientAccountId;
    this.apiKeyId = value.apiKeyId;
    this.#token = value.key;
  }
  get key() {
    return this.#token;
  }
  toJSON() {
    return {
      credentialVersion: this.credentialVersion,
      recipientAccountId: this.recipientAccountId,
      apiKeyId: this.apiKeyId,
      apiOrigin: this.apiOrigin,
      key: "[REDACTED]"
    };
  }
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return this.toJSON();
  }
};
function invalid() {
  throw Error("PERSONAL_PACKAGE_INVALID");
}
function object(value) {
  if (!value || typeof value !== "object" || Array.isArray(value) || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) invalid();
}
function exact(value, required2, optional = []) {
  object(value);
  if (required2.some((key) => !Object.hasOwn(value, key)) || Object.keys(value).some((key) => !required2.includes(key) && !optional.includes(key))) invalid();
}
function id(value) {
  if (!Number.isSafeInteger(value) || value <= 0) invalid();
}
function namedId(value) {
  if (typeof value !== "string" || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(value)) invalid();
}
function digest2(value) {
  if (typeof value !== "string" || !/^[a-f0-9]{64}$/.test(value)) invalid();
}
function cleanText(bytes) {
  let text;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    invalid();
  }
  if (scanText(text).some((f) => f.level === "error")) invalid();
}
function validateCredentials(value) {
  exact(value, ["credentialVersion", "recipientAccountId", "apiKeyId", "key", "apiOrigin"]);
  id(value.recipientAccountId);
  id(value.apiKeyId);
  if (value.credentialVersion !== "1" || value.apiOrigin !== PERSONAL_API_ORIGIN || typeof value.key !== "string" || !/^mgk_[A-Za-z0-9_-]{32}$/.test(value.key)) invalid();
}
function validateManifest(value) {
  exact(value, ["format", "specVersion", "packageProfile", "content", "personal", "runtime", "services"], ["extensions"]);
  if (value.format !== "motiongit-template" || value.specVersion !== PERSONAL_SPEC_VERSION || value.packageProfile !== PERSONAL_PROFILE) invalid();
  exact(value.content, ["path", "sha256", "protection"]);
  digest2(value.content.sha256);
  if (value.content.path !== PERSONAL_FILES[2] || !["open", "protected"].includes(value.content.protection)) invalid();
  exact(value.personal, ["credentials", "receipt", "signature"]);
  if (value.personal.credentials !== PERSONAL_FILES[3] || value.personal.receipt !== PERSONAL_FILES[4] || value.personal.signature !== PERSONAL_FILES[5]) invalid();
  exact(value.runtime, ["profile", "operation"]);
  if (value.runtime.profile !== "motiongit-host/1" || value.runtime.operation !== "motion.run") invalid();
  exact(value.services, ["creator"]);
  exact(value.services.creator, ["contract", "execution", "credentials", "origin"]);
  const s = value.services.creator;
  if (s.contract !== "motiongit.creator/2" || s.execution !== "host" || s.credentials !== "personal-envelope" || s.origin !== PERSONAL_API_ORIGIN) invalid();
  if (value.extensions !== void 0) {
    object(value.extensions);
    if (Object.keys(value.extensions).some((key) => !/^[a-z0-9][a-z0-9.-]*:[A-Za-z0-9][A-Za-z0-9._-]*$/.test(key))) invalid();
    jcs(value.extensions);
  }
}
function validateReceipt(value) {
  exact(value, [
    "profile",
    "receiptVersion",
    "downloadId",
    "recipientAccountId",
    "apiKeyId",
    "authorAccountId",
    "templateId",
    "templateSlug",
    "releaseId",
    "templateVersion",
    "releaseArchiveSha256",
    "descriptorSha256",
    "apiOrigin",
    "issuedAt",
    "signingKeyId",
    "files"
  ]);
  if (value.profile !== PERSONAL_PROFILE || value.receiptVersion !== "1" || value.apiOrigin !== PERSONAL_API_ORIGIN) invalid();
  for (const key of ["recipientAccountId", "apiKeyId", "authorAccountId", "templateId", "releaseId"]) id(value[key]);
  if (typeof value.downloadId !== "string" || !/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(value.downloadId)) invalid();
  namedId(value.signingKeyId);
  if (typeof value.templateSlug !== "string" || !/^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/.test(value.templateSlug) || !parseSemVer(value.templateVersion) || !Number.isSafeInteger(value.issuedAt) || value.issuedAt < 0) invalid();
  digest2(value.releaseArchiveSha256);
  if (value.descriptorSha256 !== null) digest2(value.descriptorSha256);
  object(value.files);
  for (const name of signedFiles(value.files)) {
    exact(value.files[name], ["sha256", "bytes"]);
    digest2(value.files[name].sha256);
    if (!Number.isSafeInteger(value.files[name].bytes) || value.files[name].bytes < 0) invalid();
  }
}
function maxFile(name) {
  if (name === ASSISTANT_FILES[2]) return PERSONAL_LIMITS.assistantBytes;
  if (name === PERSONAL_FILES[2]) return PERSONAL_LIMITS.releaseBytes;
  if (name === PERSONAL_FILES[0]) return PERSONAL_LIMITS.manifestBytes;
  if (name === PERSONAL_FILES[3]) return PERSONAL_LIMITS.credentialBytes;
  if (name === PERSONAL_FILES[4]) return PERSONAL_LIMITS.receiptBytes;
  if (name === PERSONAL_FILES[5]) return PERSONAL_LIMITS.signatureBytes;
  return PERSONAL_LIMITS.metadataBytes;
}
async function readPersonalArchive(archive) {
  if (!Buffer.isBuffer(archive) || archive.length > PERSONAL_LIMITS.archiveBytes) invalid();
  let zip;
  try {
    zip = await new Promise((resolve, reject) => import_yauzl3.default.fromBuffer(
      archive,
      { lazyEntries: true, validateEntrySizes: true, strictFileNames: true, autoClose: true },
      (error, value) => error ? reject(error) : resolve(value)
    ));
    if (![PERSONAL_FILES.length, ALL_PERSONAL_FILES.length].includes(zip.entryCount) || zip.comment) invalid();
    let compressed = 0, metadata = 0;
    const seen = /* @__PURE__ */ new Set();
    for await (const entry of zip.eachEntry()) {
      const name = entry.fileName;
      if (!ALL_PERSONAL_FILES.includes(name) || seen.has(name) || entry.uncompressedSize > maxFile(name)) invalid();
      seen.add(name);
      compressed += entry.compressedSize;
      if (name === PERSONAL_FILES[2]) {
        if (entry.compressionMethod !== 0) invalid();
      } else if (name !== ASSISTANT_FILES[2]) metadata += entry.uncompressedSize;
    }
    if (seen.size !== zip.entryCount || PERSONAL_FILES.some((name) => !seen.has(name)) || seen.size > PERSONAL_FILES.length && ASSISTANT_FILES.some((name) => !seen.has(name)) || metadata > PERSONAL_LIMITS.metadataBytes || archive.length - compressed > PERSONAL_LIMITS.zipOverheadBytes) invalid();
  } catch {
    invalid();
  } finally {
    zip?.close();
  }
  return readSafeArchive(archive, {
    maxFiles: ALL_PERSONAL_FILES.length,
    maxArchiveBytes: PERSONAL_LIMITS.archiveBytes,
    maxFileBytes: PERSONAL_LIMITS.releaseBytes,
    maxTotalBytes: PERSONAL_LIMITS.releaseBytes + PERSONAL_LIMITS.metadataBytes + PERSONAL_LIMITS.assistantBytes
  });
}
async function verifyRelease(archive, trusted) {
  if (!Buffer.isBuffer(archive) || archive.length > PERSONAL_LIMITS.releaseBytes) invalid();
  const files = await readSafeArchive(archive, { maxFileBytes: RELEASE_MAX_BYTES });
  verifyFrozenIntegrity(files);
  const manifest = parseProtectedJson(files.get("motion.json") ?? invalid());
  if (manifest.format !== "motiongit-template" || manifest.specVersion !== "0.1.0-draft.1" || manifest.packageProfile !== void 0 || manifest.personal !== void 0 || [...files.keys()].some((name) => name === "motiongit.key.json" || name.startsWith("personal/"))) invalid();
  const protection = manifest.distribution?.mode === "protected" ? "protected" : "open";
  let descriptorSha256 = null;
  if (protection === "protected") {
    const verified = await verifyProtectedPackage(archive, trusted);
    descriptorSha256 = verified.descriptorSha256;
  }
  const report = await inspectPackage(archive, { trustedSigningKeys: trusted });
  if (!report.ok) invalid();
  for (const [name, bytes] of files) {
    if (isForbidden(name)) invalid();
    if (isTextFile(name)) {
      if (bytes.length > textScanLimit(name)) invalid();
      cleanText(bytes);
    }
  }
  return { manifest, protection, descriptorSha256 };
}
async function verifyPersonalPackage(archive, trustedKeys, options2 = {}) {
  const files = await readPersonalArchive(archive);
  const receipt = parseProtectedJson(files.get(PERSONAL_FILES[4]), PERSONAL_LIMITS.receiptBytes);
  validateReceipt(receipt);
  const signature = parseProtectedJson(files.get(PERSONAL_FILES[5]), PERSONAL_LIMITS.signatureBytes);
  exact(signature, ["algorithm", "keyId", "signature"]);
  if (signature.algorithm !== "Ed25519" || signature.keyId !== receipt.signingKeyId || typeof signature.signature !== "string" || !/^[A-Za-z0-9_-]{86}$/.test(signature.signature)) throw Error("PERSONAL_SIGNATURE_INVALID");
  const signatureBytes = Buffer.from(signature.signature, "base64url");
  if (signatureBytes.length !== 64 || signatureBytes.toString("base64url") !== signature.signature || !Object.hasOwn(trustedKeys, signature.keyId)) throw Error("PERSONAL_SIGNATURE_INVALID");
  try {
    const trusted = trustedKeys[signature.keyId], key = typeof trusted === "string" ? crypto6.createPublicKey(trusted) : trusted;
    if (!key || key.asymmetricKeyType !== "ed25519" || !crypto6.verify(null, Buffer.from(jcs(receipt)), key, signatureBytes)) throw Error();
  } catch {
    throw Error("PERSONAL_SIGNATURE_INVALID");
  }
  for (const name of signedFiles(receipt.files)) {
    const data = files.get(name);
    if (!data || receipt.files[name].bytes !== data.length || receipt.files[name].sha256 !== hashBytes(data)) invalid();
  }
  if (files.size !== Object.keys(receipt.files).length + 2) invalid();
  for (const name of files.keys()) if (name !== PERSONAL_FILES[2] && name !== PERSONAL_FILES[3]) cleanText(files.get(name));
  const manifest = parseProtectedJson(files.get(PERSONAL_FILES[0]), PERSONAL_LIMITS.manifestBytes);
  validateManifest(manifest);
  const hasAssistant = files.has(ASSISTANT_FILES[0]);
  if (hasAssistant !== Object.hasOwn(manifest.extensions ?? {}, ASSISTANT_EXTENSION)) invalid();
  if (hasAssistant) {
    const entry = manifest.extensions[ASSISTANT_EXTENSION];
    exact(entry, ["profile", "firstRead", "guide", "entry"]);
    if (entry.profile !== ASSISTANT_PROFILE || entry.firstRead !== ASSISTANT_FILES[0] || entry.guide !== ASSISTANT_FILES[1] || entry.entry !== ASSISTANT_FILES[2]) invalid();
    validateAssistantBundle({ helper: files.get(ASSISTANT_FILES[2]), build: files.get(ASSISTANT_FILES[3]), notices: files.get(ASSISTANT_FILES[4]) });
  }
  const releaseArchive = files.get(PERSONAL_FILES[2]);
  const releaseArchiveSha256 = hashBytes(releaseArchive);
  if (manifest.content.sha256 !== releaseArchiveSha256 || receipt.releaseArchiveSha256 !== releaseArchiveSha256) invalid();
  const release = await verifyRelease(releaseArchive, options2.trustedReleaseSigningKeys ?? trustedKeys);
  if (manifest.content.protection !== release.protection || receipt.descriptorSha256 !== release.descriptorSha256 || release.manifest.template?.id !== receipt.templateSlug || release.manifest.template?.version !== receipt.templateVersion) invalid();
  if (release.protection === "protected") {
    const verified = await verifyProtectedPackage(releaseArchive, options2.trustedReleaseSigningKeys ?? trustedKeys);
    if (verified.descriptor.templateId !== receipt.templateId || verified.descriptor.releaseId !== receipt.releaseId) invalid();
  }
  const credential = parseProtectedJson(files.get(PERSONAL_FILES[3]), PERSONAL_LIMITS.credentialBytes);
  validateCredentials(credential);
  if (credential.recipientAccountId !== receipt.recipientAccountId || credential.apiKeyId !== receipt.apiKeyId || credential.apiOrigin !== receipt.apiOrigin) invalid();
  const personalDownloadSha256 = hashBytes(archive), receiptSha256 = hashBytes(files.get(PERSONAL_FILES[4]));
  const publicSummary = {
    profile: PERSONAL_PROFILE,
    specVersion: PERSONAL_SPEC_VERSION,
    recipientAccountId: receipt.recipientAccountId,
    apiKeyId: receipt.apiKeyId,
    authorAccountId: receipt.authorAccountId,
    templateId: receipt.templateId,
    templateSlug: receipt.templateSlug,
    releaseId: receipt.releaseId,
    templateVersion: receipt.templateVersion,
    downloadId: receipt.downloadId,
    issuedAt: receipt.issuedAt,
    protection: release.protection,
    releaseArchiveSha256,
    personalDownloadSha256,
    receiptSha256,
    descriptorSha256: receipt.descriptorSha256,
    signingKeyId: receipt.signingKeyId,
    releaseBytes: releaseArchive.length,
    personalBytes: archive.length
  };
  return {
    manifest,
    receipt,
    credentials: new VerifiedPersonalCredentials(credential),
    releaseArchive,
    releaseArchiveSha256,
    receiptSha256,
    personalDownloadSha256,
    publicSummary
  };
}

// packages/motion-spec/src/official-client.ts
import fs5 from "node:fs/promises";
import path3 from "node:path";
import crypto8 from "node:crypto";

// packages/motion-spec/src/music-recommendation.ts
var MUSIC_MAX_BYTES = 32 * 1024 * 1024;
function musicDownloadRoute(id2) {
  if (typeof id2 !== "string" || !/^[a-z0-9][a-z0-9_-]{0,99}$/.test(id2)) throw Error("INVALID_MUSIC_ID");
  return "/music/" + id2 + "?mode=download";
}
function validateMusicRecommendation(value, pkg, targetDuration) {
  const fail = () => {
    throw Error("MUSIC_RECOMMENDATION_INVALID");
  };
  const expectedSource = {
    downloadId: pkg.receipt.downloadId,
    receiptSha256: pkg.receiptSha256,
    recipientAccountId: pkg.receipt.recipientAccountId,
    apiKeyId: pkg.receipt.apiKeyId,
    authorAccountId: pkg.receipt.authorAccountId,
    templateId: pkg.receipt.templateId,
    releaseId: pkg.receipt.releaseId,
    releaseArchiveSha256: pkg.releaseArchiveSha256,
    descriptorSha256: pkg.receipt.descriptorSha256,
    templateVersion: pkg.receipt.templateVersion
  };
  if (!value || value.profile !== "motiongit.music-recommendation/1" || value.credits !== 0 || value.billing?.recommend_credits !== 0 || value.billing?.download_credits !== 0 || value.billing?.paid_generation !== false || value.source_status !== "verified" || !value.package_source || Object.entries(expectedSource).some(([key, expected]) => value.package_source[key] !== expected)) fail();
  const t = value.track, f = value.fit;
  if (!t || !f || t.kind !== "music" || t.provider !== "licensed" || t.id !== t.source_asset_id || typeof t.id !== "string" || !/^[a-z0-9][a-z0-9_-]{0,99}$/.test(t.id) || t.download !== "/api/v1" + musicDownloadRoute(t.id) || !/^audio\/[a-z0-9.+-]+$/i.test(t.mime ?? "") || !Number.isSafeInteger(t.bytes) || t.bytes < 1 || t.bytes > MUSIC_MAX_BYTES || !/^[a-f0-9]{64}$/.test(t.sha256 ?? "") || !Number.isSafeInteger(t.actual_specs?.duration_ms) || t.actual_specs.duration_ms < 1e3 || t.duration_s !== t.actual_specs.duration_ms / 1e3 || typeof t.source_ref !== "string" || !t.source_ref || typeof t.title !== "string" || typeof t.attribution !== "string" || !t.attribution || typeof t.source_url !== "string" || !t.source_url.startsWith("https://") || t.license?.commercial_use !== "allowed" || t.license?.adaptation !== "allowed" || t.license?.standalone_redistribution !== "allowed") fail();
  if (typeof f.target_duration_s !== "number" || !Number.isFinite(f.target_duration_s) || f.target_duration_s <= 0 || f.target_duration_s > 3600 || targetDuration !== void 0 && targetDuration !== f.target_duration_s || f.track_duration_s !== t.duration_s || typeof f.loop_allowed !== "boolean") fail();
  const targetMs = Math.ceil(f.target_duration_s * 1e3), sourceMs = t.actual_specs.duration_ms;
  const mode = sourceMs < targetMs ? "loop" : sourceMs === targetMs ? "exact" : "trim";
  if (f.mode !== mode || f.repeat_count !== Math.ceil(targetMs / sourceMs) || mode === "loop" && (f.loop_allowed !== true || t.music?.loopable !== true)) fail();
}

// packages/motion-spec/src/bearer-update-client.ts
import fs4 from "node:fs/promises";
import path2 from "node:path";
import crypto7 from "node:crypto";
var PROFILE = "motiongit.bearer-template-update/1";
var DELIVERY = "motiongit.bearer-personal-download/1";
var uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
var source = (pkg) => ({
  downloadId: pkg.receipt.downloadId,
  receiptSha256: pkg.receiptSha256,
  recipientAccountId: pkg.receipt.recipientAccountId,
  apiKeyId: pkg.receipt.apiKeyId,
  authorAccountId: pkg.receipt.authorAccountId,
  templateId: pkg.receipt.templateId,
  releaseId: pkg.receipt.releaseId,
  templateVersion: pkg.receipt.templateVersion,
  releaseArchiveSha256: pkg.releaseArchiveSha256
});
var helperDownloadCapabilities = () => ({
  profile: "motiongit.helper-update-download/1",
  helperVersion: MOTION_HELPER_VERSION,
  bearerUpdateSupported: true,
  requiresWebsiteSession: false,
  confirmationRequired: true,
  credentialPolicy: "reuse-source-package-key",
  explicitOwnCredentialRecoverySupported: true,
  existingSignedPackageGuidanceOverride: "current-official-helper-capability"
});
function credentials(current, recovery) {
  if (recovery && (recovery.receipt.recipientAccountId !== current.receipt.recipientAccountId || recovery.receipt.apiKeyId === current.receipt.apiKeyId))
    throw Error("EXPLICIT_DIFFERENT_OWN_KEY_REQUIRED");
  return recovery ?? current;
}
function validateBearerTemplateDownload(value, current, update, recovery) {
  const credential = credentials(current, recovery), mode = recovery ? "explicit-recovery" : "original";
  if (!value || Object.keys(value).sort().join() !== "confirmationRequired,credentialKeyId,credits,mode,prepareUrl,profile,reason,requiresWebsiteSession,source,status,target" || value.profile !== PROFILE || value.mode !== mode || jcs(value.source) !== jcs(source(current)) || value.credentialKeyId !== credential.receipt.apiKeyId || !["available", "closed", "denied", "unavailable", "current", "helper-upgrade-required"].includes(value.status) || value.requiresWebsiteSession !== false || value.confirmationRequired !== true || value.credits !== 0 || value.prepareUrl !== PERSONAL_API_ORIGIN + "/template-updates/" + (recovery ? "recovery-download" : "download") || value.reason !== null && (typeof value.reason !== "string" || !/^[A-Za-z0-9_]{1,80}$/.test(value.reason))) throw Error("BEARER_UPDATE_CONTRACT_INVALID");
  if (value.target !== null) {
    const t = value.target;
    if (!update || Object.keys(t).sort().join() !== "releaseArchiveSha256,releaseId,releaseSize,templateVersion" || t.releaseId !== update.releaseId || t.templateVersion !== update.latestVersion || t.releaseArchiveSha256 !== update.releaseArchiveSha256 || t.releaseSize !== update.releaseSize)
      throw Error("BEARER_UPDATE_TARGET_INVALID");
  }
  if (value.status === "available" && (!value.target || !update?.available || update.compatibility_status !== "compatible" || value.reason !== null))
    throw Error("BEARER_UPDATE_CONTRACT_INVALID");
}
async function request(current, recovery, url, options2, body, operationId) {
  const parsed = new URL(url), base = PERSONAL_API_ORIGIN + "/template-updates/", prepare = base + (recovery ? "recovery-download" : "download");
  const snapshot = new RegExp("^" + (base + (recovery ? "recovery-downloads" : "downloads")).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "/[a-f0-9-]{36}\\.motion$");
  if (parsed.origin !== "https://motiongit.com" || parsed.username || parsed.password || parsed.search || parsed.hash || body === void 0 && !(url === base + (recovery ? "recovery-status" : "status") || snapshot.test(url)) || body !== void 0 && (url !== prepare || !operationId || !uuid.test(operationId))) throw Error("BEARER_UPDATE_ROUTE_INVALID");
  const credential = credentials(current, recovery), token = credential.credentials.key;
  const headers = {
    "authorization": "Bearer " + token,
    "X-MotionGit-Package-Context": Buffer.from(jcs({ v: 1, downloadId: current.receipt.downloadId, receiptSha256: current.receiptSha256 })).toString("base64url"),
    "X-MotionGit-Helper-Version": MOTION_HELPER_VERSION,
    ...body === void 0 ? {} : { "content-type": "application/json" },
    ...operationId ? { "idempotency-key": operationId } : {}
  };
  let r;
  try {
    r = await (options2.transport ?? fetch)(url, {
      method: body === void 0 ? "GET" : "POST",
      headers,
      body: body === void 0 ? void 0 : jcs(body),
      credentials: "omit",
      redirect: "error",
      signal: AbortSignal.timeout(body === void 0 && (url.endsWith("status") || url === PERSONAL_API_ORIGIN + "/usage") ? 5e3 : 9e4)
    });
  } catch {
    throw Error("API_REQUEST_UNAVAILABLE");
  }
  if (r.redirected || r.status >= 300 && r.status < 400) {
    await r.body?.cancel();
    throw Error("API_REDIRECT_BLOCKED");
  }
  return r;
}
async function atomicState(file, value) {
  const temp = file + "." + crypto7.randomUUID() + ".tmp";
  let handle;
  try {
    handle = await fs4.open(temp, "wx", 384);
    await handle.writeFile(jcs(value) + "\n");
    await handle.sync();
    await handle.close();
    handle = void 0;
    await fs4.rename(temp, file);
  } finally {
    await handle?.close();
    await fs4.rm(temp, { force: true });
  }
}
async function acquireUpdateLock(file) {
  const temp = file + "." + crypto7.randomUUID() + ".tmp";
  try {
    await fs4.writeFile(temp, jcs({ profile: "motiongit.update-lock/1", pid: process.pid }) + "\n", { flag: "wx", mode: 384, flush: true });
    try {
      await fs4.link(temp, file);
    } catch (e) {
      if (e.code !== "EEXIST") throw e;
      const before = await fs4.lstat(file);
      if (!before.isFile() || before.isSymbolicLink() || process.platform !== "win32" && before.mode & 63 || typeof process.getuid === "function" && before.uid !== process.getuid() || before.size > 1024) throw Error("UPDATE_LOCK_INVALID");
      const state = parseProtectedJson(await fs4.readFile(file));
      if (Object.keys(state).sort().join() !== "pid,profile" || state.profile !== "motiongit.update-lock/1" || !Number.isSafeInteger(state.pid) || state.pid < 1) throw Error("UPDATE_LOCK_INVALID");
      try {
        process.kill(state.pid, 0);
        throw Error("UPDATE_OPERATION_BUSY");
      } catch (error) {
        if (error.code !== "ESRCH") throw error;
      }
      const after = await fs4.lstat(file);
      if (after.ino !== before.ino || after.dev !== before.dev) throw Error("UPDATE_OPERATION_BUSY");
      await fs4.unlink(file);
      try {
        await fs4.link(temp, file);
      } catch {
        throw Error("UPDATE_OPERATION_BUSY");
      }
    }
    const owned = await fs4.lstat(file);
    return async () => {
      const live = await fs4.lstat(file);
      if (live.ino !== owned.ino || live.dev !== owned.dev) throw Error("UPDATE_LOCK_CHANGED");
      await fs4.unlink(file);
    };
  } finally {
    await fs4.rm(temp, { force: true });
  }
}
async function writeExclusive(file, bytes) {
  const handle = await fs4.open(file, "wx", 384), owned = await handle.stat();
  let complete = false;
  try {
    await handle.writeFile(bytes);
    await handle.sync();
    complete = true;
  } finally {
    await handle.close();
    if (!complete) {
      const live = await fs4.lstat(file);
      if (live.ino === owned.ino && live.dev === owned.dev) await fs4.unlink(file);
    }
  }
}
async function json(r, credential) {
  if (!r.headers.get("content-type")?.includes("application/json")) {
    await r.body?.cancel();
    throw Error("API_RESPONSE_INVALID");
  }
  const value = parseProtectedJson(await boundedResponse(r, 128 * 1024));
  if (JSON.stringify(value).includes(credential.credentials.key)) throw Error("API_SECRET_REJECTED");
  if (!r.ok) {
    const code = value.error?.code;
    throw Error(typeof code === "string" && /^[A-Za-z0-9_]{1,80}$/.test(code) ? code : "UPDATE_DOWNLOAD_UNAVAILABLE");
  }
  return value;
}
async function queryBearerTemplateDownload(current, options2 = {}) {
  const recovery = options2.recoveryPackage, credential = credentials(current, recovery);
  const value = await json(await request(current, recovery, PERSONAL_API_ORIGIN + "/template-updates/" + (recovery ? "recovery-status" : "status"), options2), credential);
  validateTemplateUpdateCheck(value.template_update, current);
  if (value.template_download === void 0) throw Error("BEARER_UPDATE_UNSUPPORTED");
  validateBearerTemplateDownload(value.template_download, current, value.template_update.update, recovery);
  return { template_update: value.template_update, template_download: value.template_download };
}
function validateDelivery(m, current, contract, recovery) {
  const credential = credentials(current, recovery), t = contract.target;
  if (!m || Object.keys(m).sort().join() !== "apiKeyId,authorAccountId,downloadId,downloadUrl,expiresAt,personalArchiveSha256,personalBytes,profile,recipientAccountId,releaseArchiveSha256,releaseId,templateId,templateVersion" || m.profile !== DELIVERY || !uuid.test(m.downloadId) || m.recipientAccountId !== current.receipt.recipientAccountId || m.apiKeyId !== credential.receipt.apiKeyId || m.authorAccountId !== current.receipt.authorAccountId || m.templateId !== current.receipt.templateId || m.releaseId !== t.releaseId || m.templateVersion !== t.templateVersion || m.releaseArchiveSha256 !== t.releaseArchiveSha256 || !/^[a-f0-9]{64}$/.test(m.personalArchiveSha256) || !Number.isSafeInteger(m.personalBytes) || m.personalBytes < 1 || m.personalBytes > PERSONAL_LIMITS.archiveBytes || !Number.isSafeInteger(m.expiresAt) || m.downloadUrl !== PERSONAL_API_ORIGIN + "/template-updates/" + (recovery ? "recovery-downloads" : "downloads") + "/" + m.downloadId + ".motion") throw Error("UPDATE_DELIVERY_INVALID");
}
async function downloadBearerTemplateUpdate(current, contract, destination, options2) {
  validateTemplateUpdate(options2.update, current);
  validateBearerTemplateDownload(contract, current, options2.update, options2.recoveryPackage);
  if (options2.update.minHelperVersion && compareSemVer(MOTION_HELPER_VERSION, options2.update.minHelperVersion) < 0 || options2.update.requiredProfiles.some((p) => !["personal-download-v1", "motiongit-host/1", "protected-v1", "split-root-v1", "native-python-node/1"].includes(p))) throw Error("HELPER_UPGRADE_REQUIRED");
  const credential = credentials(current, options2.recoveryPackage), target = path2.resolve(destination), parent = await fs4.realpath(path2.dirname(target));
  if (parent !== path2.dirname(target)) throw Error("SYMLINK_OUTPUT_REJECTED");
  try {
    await fs4.lstat(target);
    throw Error("UPDATE_OUTPUT_EXISTS");
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
  if (contract.status !== "available" || !contract.target) throw Error(contract.reason ?? "UPDATE_DOWNLOAD_UNAVAILABLE");
  const stateFile = target + ".motion-update.json", lock = stateFile + ".lock", releaseLock = await acquireUpdateLock(lock);
  try {
    let state;
    try {
      const stat = await fs4.lstat(stateFile);
      if (!stat.isFile() || stat.isSymbolicLink() || process.platform !== "win32" && stat.mode & 63 || typeof process.getuid === "function" && stat.uid !== process.getuid() || stat.size > 128 * 1024) throw Error("UPDATE_STATE_INVALID");
      state = parseProtectedJson(await fs4.readFile(stateFile));
    } catch (e) {
      if (e.code !== "ENOENT") throw e;
    }
    const binding = { source: source(current), credentialKeyId: credential.receipt.apiKeyId, mode: contract.mode, target: contract.target };
    if (state) {
      if (Object.keys(state).sort().join() !== "binding,delivery,operationId,profile" || state.profile !== "motiongit.bearer-update-operation/1" || !uuid.test(state.operationId) || jcs(state.binding) !== jcs(binding)) throw Error("UPDATE_OPERATION_SOURCE_CHANGED");
      if (state.delivery !== null) validateDelivery(state.delivery, current, contract, options2.recoveryPackage);
    } else {
      state = { profile: "motiongit.bearer-update-operation/1", operationId: crypto7.randomUUID(), binding, delivery: null };
      await atomicState(stateFile, state);
    }
    if (!state.delivery) {
      state.delivery = await json(await request(
        current,
        options2.recoveryPackage,
        contract.prepareUrl,
        options2,
        { profile: PROFILE, target: contract.target, ...options2.recoveryPackage ? { acknowledgeCredentialChange: true } : {} },
        state.operationId
      ), credential);
      validateDelivery(state.delivery, current, contract, options2.recoveryPackage);
      await atomicState(stateFile, state);
    }
    const m = state.delivery, r = await request(current, options2.recoveryPackage, m.downloadUrl, options2);
    if (!r.ok) {
      await json(r, credential);
      throw Error("UPDATE_DOWNLOAD_UNAVAILABLE");
    }
    if (r.headers.get("content-length") !== String(m.personalBytes) || r.headers.get("x-content-sha256") !== m.personalArchiveSha256 || r.headers.get("x-archive-sha256") !== m.personalArchiveSha256 || r.headers.get("x-release-archive-sha256") !== contract.target.releaseArchiveSha256 || r.headers.get("x-motiongit-download-id") !== m.downloadId) {
      await r.body?.cancel();
      throw Error("UPDATE_INTEGRITY_INVALID");
    }
    const bytes = await boundedResponse(r, m.personalBytes);
    try {
      if (bytes.length !== m.personalBytes || hashBytes(bytes) !== m.personalArchiveSha256) throw Error("UPDATE_INTEGRITY_INVALID");
      const pkg = await verifyPersonalPackage(bytes, options2.trust.personal, { trustedReleaseSigningKeys: options2.trust.protected });
      if (pkg.receipt.downloadId !== m.downloadId || pkg.receipt.recipientAccountId !== current.receipt.recipientAccountId || pkg.receipt.apiKeyId !== credential.receipt.apiKeyId || pkg.credentials.key !== credential.credentials.key || pkg.receipt.authorAccountId !== current.receipt.authorAccountId || pkg.receipt.templateId !== current.receipt.templateId || pkg.receipt.releaseId !== contract.target.releaseId || pkg.receipt.templateVersion !== contract.target.templateVersion || pkg.releaseArchiveSha256 !== contract.target.releaseArchiveSha256 || pkg.releaseArchive.length !== contract.target.releaseSize || r.headers.get("x-motiongit-receipt-sha256") !== pkg.receiptSha256) throw Error("UPDATE_IDENTITY_INVALID");
      await writeExclusive(target, bytes);
      return pkg.publicSummary;
    } finally {
      bytes.fill(0);
    }
  } finally {
    await releaseLock();
  }
}

// packages/motion-spec/src/official-client.ts
var packageContextHeader = (pkg) => Buffer.from(jcs({
  v: 1,
  downloadId: pkg.receipt.downloadId,
  receiptSha256: pkg.receiptSha256
})).toString("base64url");
var voiceDirectoryLanguage = (language) => language === "zh" ? "zh-cn" : language;
var identifier = (id2) => {
  if (!/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,159}$/.test(id2)) throw Error("INVALID_RESOURCE_ID");
  return encodeURIComponent(id2);
};
function noToken(value, token) {
  if (JSON.stringify(value).includes(token)) throw Error("API_SECRET_REJECTED");
}
var context = (pkg) => ({
  recipientAccountId: pkg.receipt.recipientAccountId,
  apiKeyId: pkg.receipt.apiKeyId,
  downloadId: pkg.receipt.downloadId,
  receiptSha256: pkg.receiptSha256
});
async function regularPath(file, exists = false) {
  const absolute = path3.resolve(file), parent = await fs5.realpath(path3.dirname(absolute));
  if (parent !== path3.dirname(absolute)) throw Error("SYMLINK_OUTPUT_REJECTED");
  try {
    const stat = await fs5.lstat(absolute);
    if (stat.isSymbolicLink() || !stat.isFile()) throw Error("UNSAFE_STATE_FILE");
  } catch (error) {
    if (error.code !== "ENOENT" || exists) throw error;
  }
  return absolute;
}
async function writeNew(file, bytes) {
  const target = await regularPath(file), handle = await fs5.open(target, "wx", 384);
  try {
    await handle.writeFile(bytes);
  } catch (error) {
    await handle.close();
    await fs5.rm(target);
    throw error;
  }
  await handle.close();
}
async function stateRead(file) {
  const target = await regularPath(file, true), stat = await fs5.stat(target);
  if (stat.size > 2 * 1024 * 1024) throw Error("STATE_LIMIT_EXCEEDED");
  return parseProtectedJson(await fs5.readFile(target));
}
async function stateWrite(file, value) {
  const target = await regularPath(file), temporary = target + "." + crypto8.randomUUID() + ".tmp";
  try {
    await fs5.writeFile(temporary, Buffer.from(jcs(value) + "\n"), { flag: "wx", mode: 384 });
    await fs5.rename(temporary, target);
  } finally {
    await fs5.rm(temporary, { force: true });
  }
}
async function locked(file, action) {
  const target = await regularPath(file), lock = target + ".lock";
  let handle;
  try {
    handle = await fs5.open(lock, "wx", 384);
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
    const previous = await stateRead(lock);
    if (!Number.isSafeInteger(previous.pid) || previous.pid <= 0) throw Error("OPERATION_BUSY");
    let alive = true;
    try {
      process.kill(previous.pid, 0);
    } catch (e) {
      if (e.code === "ESRCH") alive = false;
    }
    if (alive) throw Error("OPERATION_BUSY");
    await fs5.rm(lock);
    handle = await fs5.open(lock, "wx", 384);
  }
  await handle.writeFile(jcs({ pid: process.pid }));
  try {
    return await action();
  } finally {
    await handle.close();
    await fs5.rm(lock, { force: true });
  }
}
var uuid2 = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
var OfficialCreatorClient = class {
  #pkg;
  #transport;
  #timeout;
  constructor(pkg, options2 = {}) {
    this.#pkg = pkg;
    this.#transport = options2.transport ?? fetch;
    this.#timeout = options2.requestTimeoutMs ?? 9e4;
    if (!Number.isSafeInteger(this.#timeout) || this.#timeout < 1 || this.#timeout > 9e4) throw Error("INVALID_API_TIMEOUT");
  }
  async #request(route, body, operation, publicRequest = false) {
    if (!route.startsWith("/") || route.startsWith("//") || route.includes("..") || route.includes("#")) throw Error("INVALID_API_PATH");
    if (body !== void 0) noToken(body, this.#pkg.credentials.key);
    let response;
    try {
      response = await this.#transport(PERSONAL_API_ORIGIN + route, {
        method: body === void 0 ? "GET" : "POST",
        redirect: "error",
        signal: AbortSignal.timeout(this.#timeout),
        headers: {
          ...publicRequest ? {} : {
            authorization: "Bearer " + this.#pkg.credentials.key,
            "X-MotionGit-Package-Context": packageContextHeader(this.#pkg),
            "X-MotionGit-Helper-Version": MOTION_HELPER_VERSION
          },
          ...body === void 0 ? {} : { "content-type": "application/json" },
          ...operation ? { "Idempotency-Key": operation } : {}
        },
        body: body === void 0 ? void 0 : jcs(body)
      });
    } catch {
      throw Error("API_REQUEST_UNAVAILABLE");
    }
    if (response.redirected || response.status >= 300 && response.status < 400) throw Error("API_REDIRECT_BLOCKED");
    if (!response.headers.get("content-type")?.includes("application/json")) {
      await response.body?.cancel();
      throw Error(response.ok ? "API_RESPONSE_INVALID" : "API_REQUEST_FAILED");
    }
    const bytes = await boundedResponse(response, 2 * 1024 * 1024);
    let value;
    try {
      value = parseProtectedJson(bytes);
    } catch {
      throw Error("API_RESPONSE_INVALID");
    }
    noToken(value, this.#pkg.credentials.key);
    if (!response.ok) {
      const code = value?.error?.code;
      throw Error(typeof code === "string" && /^[A-Za-z0-9_.-]{1,80}$/.test(code) ? code : "API_REQUEST_FAILED");
    }
    return value;
  }
  capabilities() {
    return this.#request("/capabilities", void 0, void 0, true);
  }
  async usage() {
    const usage = await this.#request("/usage");
    let template_update;
    if (usage.template_update === void 0) template_update = unavailableTemplateUpdateCheck(this.#pkg, "UPDATE_CHECK_UNSUPPORTED");
    else {
      try {
        validateTemplateUpdateCheck(usage.template_update, this.#pkg);
        template_update = usage.template_update;
      } catch {
        template_update = unavailableTemplateUpdateCheck(this.#pkg, "UPDATE_CHECK_INVALID");
      }
    }
    let template_download = null;
    if (usage.template_download !== void 0) try {
      validateBearerTemplateDownload(usage.template_download, this.#pkg, template_update.update);
      template_download = usage.template_download;
    } catch {
    }
    return { ...usage, template_update, template_download, helper_download: helperDownloadCapabilities() };
  }
  async status() {
    const [capabilities, usage] = await Promise.all([this.capabilities(), this.usage().catch(async (e) => {
      if (e.message !== "scope_denied") throw e;
      const update = await queryBearerTemplateDownload(this.#pkg, { transport: this.#transport });
      return { unavailable: true, error_code: "scope_denied", ...update, helper_download: helperDownloadCapabilities() };
    })]);
    return {
      capabilities,
      usage,
      template_update: usage.template_update,
      template_download: usage.template_download,
      helper_download: helperDownloadCapabilities(),
      checkedAt: usage.template_update.checked_at
    };
  }
  voices(query = {}) {
    const allowed = ["model", "q", "gender", "category", "language", "page", "limit"];
    if (Object.keys(query).some((k) => !allowed.includes(k)) || Object.values(query).some((v) => typeof v !== "string" || v.length > 100)) throw Error("INVALID_VOICE_QUERY");
    const mapped = { ...query };
    if (mapped.language) mapped.language = voiceDirectoryLanguage(mapped.language);
    return this.#request("/tts/voices?" + new URLSearchParams(mapped), void 0, void 0, true);
  }
  musicCategories() {
    return this.#request("/music/categories");
  }
  async recommendMusic(input) {
    const recommendation = await this.#request("/music/recommend", input);
    validateMusicRecommendation(recommendation, this.#pkg, input.duration_s);
    return recommendation;
  }
  async downloadRecommendedMusic(recommendation, destination) {
    noToken(recommendation, this.#pkg.credentials.key);
    validateMusicRecommendation(recommendation, this.#pkg);
    const track = recommendation.track, route = musicDownloadRoute(track.id);
    const current = await this.#request("/music/" + track.id);
    if (current.id !== track.id || current.sha256 !== track.sha256 || current.bytes !== track.bytes || current.duration_s !== track.duration_s) throw Error("MUSIC_SOURCE_CHANGED");
    let response;
    try {
      response = await this.#transport(PERSONAL_API_ORIGIN + route, {
        headers: {
          authorization: "Bearer " + this.#pkg.credentials.key,
          "X-MotionGit-Package-Context": packageContextHeader(this.#pkg),
          "X-MotionGit-Helper-Version": MOTION_HELPER_VERSION
        },
        redirect: "error",
        signal: AbortSignal.timeout(this.#timeout)
      });
    } catch {
      throw Error("API_REQUEST_UNAVAILABLE");
    }
    if (response.redirected || response.status >= 300 && response.status < 400) throw Error("API_REDIRECT_BLOCKED");
    if (!response.ok) {
      let code;
      if (response.headers.get("content-type")?.includes("application/json")) {
        const error = parseProtectedJson(await boundedResponse(response, 64 * 1024));
        noToken(error, this.#pkg.credentials.key);
        code = error?.error?.code;
      } else await response.body?.cancel();
      throw Error(typeof code === "string" && /^[A-Za-z0-9_.-]{1,80}$/.test(code) ? code : "MUSIC_DOWNLOAD_FAILED");
    }
    if (response.status !== 200 || !response.headers.get("content-type")?.startsWith("audio/") || response.headers.get("X-MotionGit-Media-SHA256") !== track.sha256) {
      await response.body?.cancel();
      throw Error("MUSIC_DOWNLOAD_METADATA_INVALID");
    }
    const bytes = await boundedResponse(response, track.bytes);
    if (bytes.length !== track.bytes || hashBytes(bytes) !== track.sha256) throw Error("MUSIC_INTEGRITY_INVALID");
    await writeNew(destination, bytes);
    return {
      profile: "motiongit.music-download/1",
      trackId: track.id,
      output: path3.resolve(destination),
      bytes: bytes.length,
      sha256: track.sha256,
      duration_s: track.duration_s,
      fit: recommendation.fit,
      license: track.license,
      attribution: track.attribution,
      source_url: track.source_url,
      credits: 0
    };
  }
  search(query) {
    if (Object.values(query).some((v) => typeof v !== "string" || v.length > 200)) throw Error("INVALID_SEARCH_QUERY");
    return this.#request("/search?" + new URLSearchParams(query));
  }
  selectAsset(source_ref) {
    if (typeof source_ref !== "string" || source_ref.length > 4096) throw Error("INVALID_SOURCE_REFERENCE");
    return this.#request("/assets/select", { source_ref, purpose: "local_creation" });
  }
  registerProduction(event) {
    const fields = ["production_id", "client_instance_id", "event_id", "stage", "host", "layout", "duration_s", "materials", "language"];
    if (Object.keys(event).some((field) => !fields.includes(field))) throw Error("INVALID_PRODUCTION_EVENT");
    if (![event.production_id, event.client_instance_id, event.event_id].every((id2) => uuid2.test(id2))) throw Error("INVALID_PRODUCTION_ID");
    return this.#request("/productions", {
      ...event,
      template: this.#pkg.receipt.templateSlug + "@" + this.#pkg.receipt.templateVersion,
      package_sha256: this.#pkg.releaseArchiveSha256
    });
  }
  task(id2) {
    return this.#request("/tasks/" + identifier(id2));
  }
  receipt(id2) {
    return this.#request("/tasks/" + identifier(id2) + "/receipt");
  }
  asset(id2) {
    return this.#request("/assets/" + identifier(id2));
  }
  async prepareGeneration(request2, stateFile) {
    if (!request2 || Object.keys(request2).sort().join() !== "capability,input,model" || typeof request2.capability !== "string" || typeof request2.model !== "string" || !request2.input || typeof request2.input !== "object" || Array.isArray(request2.input)) throw Error("INVALID_GENERATION_REQUEST");
    noToken(request2, this.#pkg.credentials.key);
    return locked(stateFile, async () => {
      const fingerprint = hashBytes(jcs(request2));
      let state;
      try {
        state = await stateRead(stateFile);
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
      if (state) {
        this.#stateBinding(state);
        if (state.requestFingerprint !== fingerprint) throw Error("OPERATION_INPUT_CHANGED");
        return this.#publicState(state);
      }
      const { capabilities, usage } = await this.status();
      const model = capabilities.models?.find((m) => m.id === request2.model && m.capability === request2.capability && m.status === "ready");
      const permission = usage.models?.find((m) => m.model === request2.model && m.capability === request2.capability && m.available === true);
      if (!model || !permission) throw Error("MODEL_NOT_AVAILABLE");
      const quote = await this.#request("/quotes", request2);
      if (!quote || typeof quote.quote_id !== "string" || quote.model !== request2.model || quote.capability !== request2.capability || !quote.input || !Number.isSafeInteger(quote.max_credits) || quote.max_credits < 0) throw Error("INVALID_QUOTE_RESPONSE");
      state = {
        profile: "motiongit.operation/1",
        source: context(this.#pkg),
        operationId: crypto8.randomUUID(),
        requestFingerprint: fingerprint,
        request: request2,
        quote,
        submissionBody: {
          quote_id: quote.quote_id,
          capability: quote.capability,
          model: quote.model,
          input: quote.input,
          max_credits: quote.max_credits
        },
        taskId: null
      };
      await stateWrite(stateFile, state);
      return this.#publicState(state);
    });
  }
  #stateBinding(state) {
    if (!state || Object.keys(state).sort().join() !== "operationId,profile,quote,request,requestFingerprint,source,submissionBody,taskId" || state.profile !== "motiongit.operation/1" || jcs(state.source) !== jcs(context(this.#pkg)) || !uuid2.test(state.operationId) || !/^[a-f0-9]{64}$/.test(state.requestFingerprint) || !state.request || hashBytes(jcs(state.request)) !== state.requestFingerprint || !state.submissionBody || Object.keys(state.submissionBody).sort().join() !== "capability,input,max_credits,model,quote_id" || !Number.isSafeInteger(state.submissionBody.max_credits) || state.submissionBody.max_credits < 0 || state.taskId !== null && (typeof state.taskId !== "string" || !/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,159}$/.test(state.taskId)) || state.submissionBody.quote_id !== state.quote?.quote_id || state.submissionBody.max_credits !== state.quote?.max_credits || state.submissionBody.capability !== state.quote?.capability || state.submissionBody.model !== state.quote?.model || jcs(state.submissionBody.input) !== jcs(state.quote?.input)) throw Error("OPERATION_SOURCE_CHANGED");
    noToken(state, this.#pkg.credentials.key);
  }
  #publicState(state) {
    return {
      operationId: state.operationId,
      quote_id: state.quote.quote_id,
      model: state.quote.model,
      max_credits: state.quote.max_credits,
      expires_at: state.quote.expires_at,
      taskId: state.taskId
    };
  }
  async submitGeneration(stateFile, authorizedMaximum) {
    return locked(stateFile, async () => {
      const state = await stateRead(stateFile);
      this.#stateBinding(state);
      if (state.taskId) return this.task(state.taskId);
      if (!Number.isSafeInteger(authorizedMaximum) || authorizedMaximum < state.submissionBody.max_credits) throw Error("EXPLICIT_BUDGET_REQUIRED");
      const accepted = await this.#request("/generations", state.submissionBody, state.operationId);
      if (typeof accepted.task_id !== "string") throw Error("INVALID_TASK_RESPONSE");
      identifier(accepted.task_id);
      state.taskId = accepted.task_id;
      await stateWrite(stateFile, state);
      return accepted;
    });
  }
  async downloadAsset(id2, destination) {
    const asset = await this.asset(id2);
    if (asset?.status !== "ready") throw Error("ASSET_NOT_READY");
    const response = await this.#transport(
      PERSONAL_API_ORIGIN + "/assets/" + identifier(id2) + "/download",
      {
        headers: { authorization: "Bearer " + this.#pkg.credentials.key, "X-MotionGit-Package-Context": packageContextHeader(this.#pkg), "X-MotionGit-Helper-Version": MOTION_HELPER_VERSION },
        redirect: "error",
        signal: AbortSignal.timeout(9e4)
      }
    );
    if (response.redirected || response.status >= 300 && response.status < 400) throw Error("API_REDIRECT_BLOCKED");
    if (!response.ok) throw Error("ASSET_DOWNLOAD_FAILED");
    if (response.headers.get("content-type")?.includes("application/json")) {
      const hotlink = parseProtectedJson(await boundedResponse(response, 64 * 1024));
      noToken(hotlink, this.#pkg.credentials.key);
      if (hotlink.policy !== "hotlink; do not mirror" || typeof hotlink.external_url !== "string" || new URL(hotlink.external_url).protocol !== "https:") throw Error("INVALID_HOTLINK");
      return { ...hotlink, downloaded: false };
    }
    if (!Number.isSafeInteger(asset.bytes) || asset.bytes < 1 || asset.bytes > 150 * 1024 * 1024 || !/^[a-f0-9]{64}$/.test(asset.sha256)) throw Error("INVALID_ASSET_METADATA");
    const bytes = await boundedResponse(response, asset.bytes);
    if (bytes.length !== asset.bytes || hashBytes(bytes) !== asset.sha256) throw Error("ASSET_INTEGRITY_INVALID");
    await writeNew(destination, bytes);
    return { assetId: id2, bytes: bytes.length, sha256: asset.sha256, rights: asset.rights ?? null, output: path3.resolve(destination) };
  }
  async unlock(descriptorSha256) {
    if (!/^[a-f0-9]{64}$/.test(descriptorSha256) || descriptorSha256 !== this.#pkg.receipt.descriptorSha256) throw Error("PACKAGE_CONTEXT_INVALID");
    const releaseId = this.#pkg.receipt.releaseId;
    const ticket = await this.#request("/releases/" + releaseId + "/unlock-ticket", { descriptorSha256 });
    if (typeof ticket.ticket !== "string" || ticket.releaseId !== releaseId || ticket.descriptorSha256 !== descriptorSha256) throw Error("INVALID_UNLOCK_TICKET");
    const result = await this.#request("/unlock-exchange", { ticket: ticket.ticket });
    if (result.releaseId !== releaseId || result.descriptorSha256 !== descriptorSha256 || result.keyId !== ticket.keyId || result.cacheProfile !== "personal-key-cache-v1" || typeof result.dek !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(result.dek)) throw Error("INVALID_UNLOCK_RESPONSE");
    const dek = Buffer.from(result.dek, "base64url");
    if (dek.length !== 32 || dek.toString("base64url") !== result.dek) throw Error("INVALID_UNLOCK_RESPONSE");
    return dek;
  }
};
var templateUpdateSource = (pkg) => ({
  authorAccountId: pkg.receipt.authorAccountId,
  templateId: pkg.receipt.templateId,
  releaseId: pkg.receipt.releaseId,
  currentVersion: pkg.receipt.templateVersion,
  releaseArchiveSha256: pkg.releaseArchiveSha256
});
function unavailableTemplateUpdateCheck(pkg, error_code) {
  return { status: "unavailable", checked_at: (/* @__PURE__ */ new Date()).toISOString(), source: templateUpdateSource(pkg), update: null, error_code };
}
function validateTemplateUpdateCheck(value, pkg) {
  if (!value || !["checked", "unavailable"].includes(value.status) || Object.keys(value).sort().join() !== (value.status === "checked" ? ["status", "checked_at", "source", "update"] : ["status", "checked_at", "source", "update", "error_code"]).sort().join() || typeof value.checked_at !== "string" || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(value.checked_at) || !Number.isFinite(Date.parse(value.checked_at)) || jcs(value.source) !== jcs(templateUpdateSource(pkg))) throw Error("UPDATE_CHECK_CONTRACT_INVALID");
  if (value.status === "checked") validateTemplateUpdate(value.update, pkg);
  else if (value.update !== null || typeof value.error_code !== "string" || !/^UPDATE_CHECK_[A-Z_]{1,50}$/.test(value.error_code)) throw Error("UPDATE_CHECK_CONTRACT_INVALID");
}
async function checkPersonalPackageAccess(pkg, options2 = {}) {
  const fallback = {
    template_update: unavailableTemplateUpdateCheck(pkg, options2.offline ? "UPDATE_CHECK_OFFLINE" : "UPDATE_CHECK_UNAVAILABLE"),
    template_download: null,
    helper_download: helperDownloadCapabilities()
  };
  if (options2.offline) return fallback;
  try {
    const update = await queryBearerTemplateDownload(pkg, options2);
    return { ...update, helper_download: helperDownloadCapabilities() };
  } catch {
    return fallback;
  }
}
function officialURL(value) {
  const url = new URL(value);
  if (url.origin !== "https://motiongit.com" || url.protocol !== "https:" || url.username || url.password || url.hash || value.length > 2048) throw Error("UPDATE_ORIGIN_INVALID");
  return url;
}
function validateTemplateUpdate(value, current) {
  const fields = [
    "identity_status",
    "update_status",
    "compatibility_status",
    "entitlement_status",
    "available",
    "templateId",
    "currentVersion",
    "latestVersion",
    "releaseId",
    "templateUrl",
    "downloadUrl",
    "downloadAvailable",
    "authenticationRequired",
    "releaseArchiveSha256",
    "releaseSize",
    "requiredProfiles",
    "minHelperVersion",
    "notes"
  ];
  if (!value || Object.keys(value).sort().join() !== fields.sort().join() || !["verified", "unregistered", "conflict"].includes(value.identity_status) || !["newer", "current", "no-release", "unregistered", "identity-conflict"].includes(value.update_status) || !["compatible", "helper-upgrade-required", "unknown"].includes(value.compatibility_status) || !["not-checked", "allowed", "denied"].includes(value.entitlement_status) || value.templateId !== null && value.templateId !== current.receipt.templateId || value.currentVersion !== null && (typeof value.currentVersion !== "string" || value.currentVersion.length > 100) || value.identity_status === "verified" && (value.templateId !== current.receipt.templateId || value.currentVersion !== current.receipt.templateVersion) || [value.available, value.downloadAvailable, value.authenticationRequired].some((x) => typeof x !== "boolean") || !Array.isArray(value.requiredProfiles) || value.requiredProfiles.length > 20 || value.requiredProfiles.some((x) => typeof x !== "string" || x.length > 100) || !Array.isArray(value.notes) || value.notes.length > 50 || value.notes.some((x) => typeof x !== "string" || x.length > 4e3) || value.minHelperVersion !== null && !parseSemVer(value.minHelperVersion)) throw Error("UPDATE_CONTRACT_INVALID");
  const target = value.releaseId !== null;
  if (target && (!Number.isSafeInteger(value.releaseId) || value.releaseId < 1 || typeof value.latestVersion !== "string" || value.latestVersion.length > 100 || typeof value.releaseArchiveSha256 !== "string" || !/^[a-f0-9]{64}$/.test(value.releaseArchiveSha256) || !Number.isSafeInteger(value.releaseSize) || value.releaseSize < 1 || value.releaseSize > PERSONAL_LIMITS.releaseBytes)) throw Error("UPDATE_CONTRACT_INVALID");
  if (!target && [value.latestVersion, value.releaseArchiveSha256, value.releaseSize, value.downloadUrl].some((x) => x !== null)) throw Error("UPDATE_CONTRACT_INVALID");
  if (value.available !== (value.update_status === "newer") || value.available && (!target || value.identity_status !== "verified") || value.downloadAvailable && (!target || value.identity_status !== "verified") || value.downloadAvailable !== (value.downloadUrl !== null)) throw Error("UPDATE_CONTRACT_INVALID");
  if (value.identity_status === "verified" && target) {
    const order = compareSemVer(value.latestVersion, current.receipt.templateVersion);
    if (order < 0 || value.available !== order > 0 || order === 0 && (value.releaseId !== current.receipt.releaseId || value.releaseArchiveSha256 !== current.releaseArchiveSha256)) throw Error("UPDATE_IDENTITY_INVALID");
  }
  for (const url of [value.templateUrl, value.downloadUrl]) if (url !== null) {
    if (typeof url !== "string") throw Error("UPDATE_CONTRACT_INVALID");
    officialURL(url);
  }
}
async function queryTemplateUpdate(current, options2 = {}) {
  const query = new URLSearchParams({
    registry: "https://motiongit.com",
    templateId: String(current.receipt.templateId),
    releaseId: String(current.receipt.releaseId),
    authorAccountId: String(current.receipt.authorAccountId),
    currentVersion: current.receipt.templateVersion,
    releaseArchiveSha256: current.releaseArchiveSha256,
    helperVersion: MOTION_HELPER_VERSION
  });
  const response = await (options2.transport ?? fetch)(
    PERSONAL_API_ORIGIN + "/template-updates?" + query,
    { redirect: "error", signal: AbortSignal.timeout(15e3) }
  );
  if (!response.ok || response.redirected) throw Error("UPDATE_QUERY_UNAVAILABLE");
  const result = parseProtectedJson(await boundedResponse(response, 128 * 1024)), update = result.update;
  validateTemplateUpdate(update, current);
  return update;
}
async function downloadTemplateUpdate(current, update, destination, options2) {
  validateTemplateUpdate(update, current);
  if (!update.available || update.compatibility_status !== "compatible") throw Error("UPDATE_DOWNLOAD_UNAVAILABLE");
  if (update.minHelperVersion && compareSemVer(MOTION_HELPER_VERSION, update.minHelperVersion) < 0 || update.requiredProfiles.some((profile) => !["personal-download-v1", "motiongit-host/1", "protected-v1", "split-root-v1", "native-python-node/1"].includes(profile))) throw Error("HELPER_UPGRADE_REQUIRED");
  const status = await queryBearerTemplateDownload(current, options2);
  validateBearerTemplateDownload(status.template_download, current, update, options2.recoveryPackage);
  return downloadBearerTemplateUpdate(current, status.template_download, destination, { ...options2, update });
}

// packages/motion-spec/src/automation-browser.ts
import fs6 from "node:fs/promises";
import { constants } from "node:fs";
import path4 from "node:path";
import os2 from "node:os";
async function automationBrowserPath(options2 = {}) {
  const platform = options2.platform ?? process.platform, home = options2.homeDirectory ?? os2.homedir(), env = options2.environment ?? process.env;
  const executable = async (file) => {
    try {
      const real = await fs6.realpath(file), stat = await fs6.stat(real);
      if (!stat.isFile()) return null;
      if (platform !== "win32") await fs6.access(real, constants.X_OK);
      return real;
    } catch {
      return null;
    }
  };
  if (env.CHROME_PATH) {
    if (!path4.isAbsolute(env.CHROME_PATH)) throw Error("BROWSER_PATH_INVALID");
    const explicit = await executable(env.CHROME_PATH);
    if (!explicit) throw Error("BROWSER_PATH_INVALID");
    return explicit;
  }
  const standard = platform === "darwin" ? path4.join(home, "Library", "Caches", "ms-playwright") : platform === "win32" ? path4.join(env.LOCALAPPDATA ?? path4.join(home, "AppData", "Local"), "ms-playwright") : path4.join(home, ".cache", "ms-playwright");
  const roots = options2.cacheDirectories ?? [...env.PLAYWRIGHT_BROWSERS_PATH && path4.isAbsolute(env.PLAYWRIGHT_BROWSERS_PATH) ? [env.PLAYWRIGHT_BROWSERS_PATH] : [], standard];
  for (const root of roots) {
    let entries;
    try {
      entries = await fs6.readdir(root, { withFileTypes: true });
    } catch {
      continue;
    }
    const shells = entries.filter((e) => e.isDirectory() && /^chromium_headless_shell-\d+$/.test(e.name)).sort((a, b) => Number(b.name.split("-").at(-1)) - Number(a.name.split("-").at(-1)));
    for (const entry of shells) {
      const folder = path4.join(root, entry.name);
      try {
        if (!(await fs6.lstat(path4.join(folder, "INSTALLATION_COMPLETE"))).isFile()) continue;
      } catch {
        continue;
      }
      const paths = platform === "darwin" ? ["chrome-headless-shell-mac-arm64/chrome-headless-shell", "chrome-headless-shell-mac-x64/chrome-headless-shell"] : platform === "win32" ? ["chrome-headless-shell-win64/chrome-headless-shell.exe"] : ["chrome-headless-shell-linux64/chrome-headless-shell"];
      let realFolder;
      try {
        realFolder = await fs6.realpath(folder);
      } catch {
        continue;
      }
      for (const candidate of paths) {
        const found = await executable(path4.join(folder, candidate));
        if (found && found.startsWith(realFolder + path4.sep)) return found;
      }
    }
  }
  return null;
}
var AUTOMATION_BROWSER_INSTALL_ARGS = ["--yes", "--package", "playwright-core@1.55.0", "playwright-core", "install", "chromium", "--only-shell"];
var AUTOMATION_BROWSER_MISSING = "BROWSER_DEPENDENCY_MISSING: Run the bundled setup operation to install the standard Chromium headless-shell dependency, then retry.";

// packages/motion-spec/src/official-helper.ts
async function verifyOfficialPersonalPackage(archive, options2 = {}) {
  const trust = await loadOfficialTrust(options2);
  return { verified: await verifyPersonalPackage(archive, trust.personal, { trustedReleaseSigningKeys: trust.protected }), trust };
}
async function packageIsPersonal(archive) {
  const files = await readSafeArchive(archive, {
    maxArchiveBytes: PERSONAL_LIMITS.archiveBytes,
    maxFileBytes: PERSONAL_LIMITS.releaseBytes,
    maxTotalBytes: 600 * 1024 * 1024
  });
  return parseProtectedJson(files.get("motion.json") ?? Buffer.from("{}"), 2 * 1024 * 1024).packageProfile === PERSONAL_PROFILE;
}
async function readPackageDocument(pkg, name) {
  const files = await readSafeArchive(pkg.releaseArchive, { maxFileBytes: PERSONAL_LIMITS.releaseBytes });
  const manifest = parseProtectedJson(files.get("motion.json"));
  const wanted = name ?? manifest.ai?.guide ?? "README.md";
  if (!protectedPath(wanted) || !/\.(json|md|txt)$/.test(wanted) || wanted === "motiongit.key.json" || wanted.startsWith("personal/") || !files.has(wanted)) throw Error("PUBLIC_DOCUMENT_UNAVAILABLE");
  const bytes = files.get(wanted);
  if (bytes.length > 2 * 1024 * 1024) throw Error("DOCUMENT_LIMIT_EXCEEDED");
  const deliveryIdentity = {
    stage: "personal-download",
    templateId: pkg.receipt.templateId,
    releaseId: pkg.receipt.releaseId,
    templateVersion: pkg.receipt.templateVersion,
    recipientAccountId: pkg.receipt.recipientAccountId,
    apiKeyId: pkg.receipt.apiKeyId,
    releaseArchiveSha256: pkg.releaseArchiveSha256,
    protection: pkg.publicSummary.protection
  };
  const text = wanted.endsWith(".json") ? null : new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  const contextual = wanted === "README.md" || /(?:^|\/)PROTECTED-DELIVERY\.md$/.test(wanted);
  const sourceReceipt = /(?:^|\/)(?:publication|packaging)-receipt\.json$/.test(wanted);
  const consumerGuide = assistantGuide(manifest, pkg.receipt.templateVersion);
  return {
    path: wanted,
    deliveryIdentity,
    currentTemplate: consumerGuide.template,
    consumerExecution: {
      entry: "assistant/motion.mjs",
      commandPrefix: ["node", "<outer-package>/assistant/motion.mjs"],
      sourceVersionsAreHistorical: true,
      globalMotionInstallationRequired: false,
      instruction: "For a package with the assistant-entry extension use its bundled entry. Historical motion commands mean this entry; do not download a separate host. Read currentTemplate for delivered version/layout."
    },
    documentLayer: "release-public-document",
    archiveDocumentSha256: hashBytes(bytes),
    documentRole: sourceReceipt ? "author-build-provenance" : "public-instructions",
    ...sourceReceipt ? { sourceBuildReceiptIsCurrentStatus: false } : {},
    renderedWithVerifiedRecipientContext: contextual,
    content: wanted.endsWith(".json") ? parseProtectedJson(bytes) : contextual ? personalizeDocumentDescription(deliveryIdentity, wanted, text) : text
  };
}
async function startPersonalPackage(pkg) {
  const document = await readPackageDocument(pkg);
  const files = await readSafeArchive(pkg.releaseArchive, { maxFileBytes: PERSONAL_LIMITS.releaseBytes });
  const manifest = parseProtectedJson(files.get("motion.json"));
  return {
    profile: "motiongit.assistant-start/1",
    verified: true,
    assistantGuide: assistantGuide(manifest, pkg.receipt.templateVersion),
    templateGuide: document,
    runtime: {
      node: process.versions.node,
      nodeReady: Number(process.versions.node.split(".")[0]) >= 22,
      platform: process.platform,
      renderDependencies: "not-yet-checked",
      coreExecuted: false
    }
  };
}
function cacheIdentity(pkg) {
  return {
    purpose: "motiongit.personal-dek-cache/1",
    registry: "https://motiongit.com",
    recipientAccountId: pkg.receipt.recipientAccountId,
    apiKeyId: pkg.receipt.apiKeyId,
    releaseId: pkg.receipt.releaseId,
    descriptorSha256: pkg.receipt.descriptorSha256
  };
}
function cacheKey(pkg) {
  return Buffer.from(crypto9.hkdfSync(
    "sha256",
    Buffer.from(pkg.credentials.key),
    Buffer.from(pkg.receipt.descriptorSha256, "hex"),
    Buffer.from(jcs(cacheIdentity(pkg))),
    32
  ));
}
function defaultCoreCacheDirectory() {
  if (process.platform === "darwin") return path5.join(os3.homedir(), "Library", "Caches", "MotionGit", "core-keys");
  if (process.platform === "win32") return path5.join(process.env.LOCALAPPDATA ?? path5.join(os3.homedir(), "AppData", "Local"), "MotionGit", "core-keys");
  return path5.join(process.env.XDG_CACHE_HOME ?? path5.join(os3.homedir(), ".cache"), "motiongit", "core-keys");
}
async function cachePath(pkg, directory) {
  if (directory === false) return null;
  const root = path5.resolve(directory);
  await fs7.mkdir(root, { recursive: true, mode: 448 });
  const stat = await fs7.lstat(root), real = await fs7.realpath(root);
  if (!stat.isDirectory() || stat.isSymbolicLink() || real !== root || process.platform !== "win32" && stat.mode & 63) throw Error("SECURE_CACHE_UNAVAILABLE");
  return path5.join(root, hashBytes(jcs(cacheIdentity(pkg))) + ".json");
}
async function loadCachedDek(pkg, file) {
  if (!file) return null;
  let bytes;
  try {
    const stat = await fs7.lstat(file);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 4096 || process.platform !== "win32" && stat.mode & 63) throw Error("SECURE_CACHE_UNAVAILABLE");
    bytes = await fs7.readFile(file);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
  const value = parseProtectedJson(bytes, 4096);
  if (!value || Object.keys(value).sort().join() !== "ciphertext,identity,nonce,profile,tag" || value.profile !== "personal-key-cache-v1" || jcs(value.identity) !== jcs(cacheIdentity(pkg))) throw Error("CACHE_INVALID");
  const key = cacheKey(pkg);
  try {
    const nonce = Buffer.from(value.nonce, "base64url"), tag = Buffer.from(value.tag, "base64url"), ciphertext = Buffer.from(value.ciphertext, "base64url");
    if (nonce.length !== 12 || tag.length !== 16 || ciphertext.length !== 32) throw Error();
    const decipher = crypto9.createDecipheriv("aes-256-gcm", key, nonce);
    decipher.setAAD(Buffer.from(jcs(value.identity)));
    decipher.setAuthTag(tag);
    const dek = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    if (dek.length !== 32) throw Error();
    return dek;
  } catch {
    throw Error("CACHE_INVALID");
  } finally {
    key.fill(0);
  }
}
async function storeCachedDek(pkg, file, dek) {
  if (!file) return;
  const key = cacheKey(pkg), nonce = crypto9.randomBytes(12), identity = cacheIdentity(pkg);
  try {
    const cipher = crypto9.createCipheriv("aes-256-gcm", key, nonce);
    cipher.setAAD(Buffer.from(jcs(identity)));
    const ciphertext = Buffer.concat([cipher.update(dek), cipher.final()]);
    const temporary = file + "." + crypto9.randomUUID() + ".tmp";
    try {
      await fs7.writeFile(temporary, jcs({
        profile: "personal-key-cache-v1",
        identity,
        nonce: nonce.toString("base64url"),
        tag: cipher.getAuthTag().toString("base64url"),
        ciphertext: ciphertext.toString("base64url")
      }) + "\n", { flag: "wx", mode: 384 });
      await fs7.rename(temporary, file);
    } finally {
      await fs7.rm(temporary, { force: true });
    }
  } finally {
    key.fill(0);
  }
}
async function unlockPackageFiles(pkg, trust, options2 = {}) {
  if (pkg.publicSummary.protection === "open") return { files: await readSafeArchive(pkg.releaseArchive), cacheHit: false };
  const verified = await verifyProtectedPackage(pkg.releaseArchive, trust.protected);
  if (verified.descriptorSha256 !== pkg.receipt.descriptorSha256 || verified.descriptor.releaseId !== pkg.receipt.releaseId || verified.descriptor.templateId !== pkg.receipt.templateId) throw Error("PACKAGE_CONTEXT_INVALID");
  const file = await cachePath(pkg, options2.cacheDirectory ?? defaultCoreCacheDirectory());
  let dek = await loadCachedDek(pkg, file), cacheHit = dek !== null;
  if (!dek) {
    if (options2.offline) throw Error("OFFLINE_UNLOCK_UNAVAILABLE");
    dek = await new OfficialCreatorClient(pkg, options2).unlock(verified.descriptorSha256);
  }
  try {
    const core = await decryptProtectedPackage(verified, dek);
    if (!cacheHit) await storeCachedDek(pkg, file, dek);
    const files = new Map(verified.publicFiles);
    for (const [name, bytes] of core) if (name !== "integrity.json") files.set(name, bytes);
    return { files: withFrozenIntegrity(files), cacheHit };
  } finally {
    dek.fill(0);
  }
}
async function writable(root) {
  let stat;
  try {
    stat = await fs7.lstat(root);
  } catch (error) {
    if (error.code === "ENOENT") return;
    throw error;
  }
  if (stat.isSymbolicLink()) return;
  if (stat.isDirectory()) {
    await fs7.chmod(root, 448);
    for (const entry of await fs7.readdir(root)) await writable(path5.join(root, entry));
  } else await fs7.chmod(root, 384);
}
async function readonly(root) {
  for (const entry of await fs7.readdir(root, { withFileTypes: true })) {
    const file = path5.join(root, entry.name);
    if (entry.isDirectory()) await readonly(file);
    else await fs7.chmod(file, 256);
  }
  await fs7.chmod(root, 320);
}
var sessionProfile = "motiongit.temporary-core/1";
function processAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code !== "ESRCH";
  }
}
async function cleanupAbandonedPackageCores(temporaryDirectory = os3.tmpdir()) {
  const base = await fs7.realpath(temporaryDirectory);
  for (const entry of await fs7.readdir(base, { withFileTypes: true })) {
    if (!entry.isDirectory() || !/^motiongit-core-[A-Za-z0-9]{6}$/.test(entry.name)) continue;
    const root = path5.join(base, entry.name);
    try {
      const stat = await fs7.lstat(root), marker = path5.join(root, ".host-session.json"), markerStat = await fs7.lstat(marker);
      if (!stat.isDirectory() || stat.isSymbolicLink() || typeof process.getuid === "function" && stat.uid !== process.getuid() || !markerStat.isFile() || markerStat.isSymbolicLink() || markerStat.size > 1024) continue;
      const session = parseProtectedJson(await fs7.readFile(marker), 1024);
      if (Object.keys(session).sort().join() !== "children,pid,profile" || session.profile !== sessionProfile || !Number.isSafeInteger(session.pid) || session.pid < 1 || !Array.isArray(session.children) || session.children.length > 8 || session.children.some((pid) => !Number.isSafeInteger(pid) || pid < 1) || processAlive(session.pid) || session.children.some(processAlive)) continue;
      await writable(root);
      await fs7.rm(root, { recursive: true, force: true });
    } catch {
    }
  }
}
async function withTemporaryPackageCore(pkg, trust, action, options2 = {}) {
  const { files, cacheHit } = await unlockPackageFiles(pkg, trust, options2);
  await cleanupAbandonedPackageCores();
  const sessionRoot = await fs7.mkdtemp(path5.join(await fs7.realpath(os3.tmpdir()), "motiongit-core-"));
  const root = path5.join(sessionRoot, "core"), session = { profile: sessionProfile, pid: process.pid, children: [] };
  await fs7.mkdir(root, { mode: 448 });
  const saveSession = () => fs7.writeFile(path5.join(sessionRoot, ".host-session.json"), jcs(session), { mode: 384 });
  try {
    await saveSession();
    for (const [name, bytes] of files) {
      const target = path5.join(root, ...name.split("/"));
      await fs7.mkdir(path5.dirname(target), { recursive: true, mode: 448 });
      await fs7.writeFile(target, bytes, { flag: "wx", mode: 256 });
    }
    await readonly(root);
    return await action(root, { cacheHit, registerProcess: async (pid) => {
      if (!Number.isSafeInteger(pid) || pid < 1 || session.children.length >= 8) throw Error("RUNTIME_PROCESS_INVALID");
      session.children.push(pid);
      await saveSession();
    } });
  } finally {
    await writable(sessionRoot);
    await fs7.rm(sessionRoot, { recursive: true, force: true });
  }
}
async function createPersonalInstance(pkg, destination) {
  const root = path5.resolve(destination);
  await fs7.mkdir(root, { recursive: false, mode: 448 });
  try {
    const identity = {
      profile: "motiongit.instance/1",
      client_instance_id: crypto9.randomUUID(),
      production_id: crypto9.randomUUID(),
      registry: "https://motiongit.com",
      recipientAccountId: pkg.receipt.recipientAccountId,
      apiKeyId: pkg.receipt.apiKeyId,
      templateId: pkg.receipt.templateId,
      template: pkg.receipt.templateSlug + "@" + pkg.receipt.templateVersion,
      releaseId: pkg.receipt.releaseId,
      releaseArchiveSha256: pkg.releaseArchiveSha256,
      downloadId: pkg.receipt.downloadId,
      receiptSha256: pkg.receiptSha256,
      descriptorSha256: pkg.receipt.descriptorSha256
    };
    await fs7.writeFile(path5.join(root, "motiongit-source.json"), jcs(identity) + "\n", { flag: "wx", mode: 384 });
    return identity;
  } catch (error) {
    await fs7.rm(root, { recursive: true, force: true });
    throw error;
  }
}
async function runPersonalPackage(pkg, trust, args, options2 = {}) {
  const publicManifest = parseProtectedJson((await readSafeArchive(pkg.releaseArchive, { maxFileBytes: PERSONAL_LIMITS.releaseBytes })).get("motion.json"));
  const minimum = publicManifest.distribution?.minHelperVersion ?? publicManifest.extensions?.["motiongit.com:release-capacity"]?.minHelperVersion;
  if (minimum !== void 0 && (!parseSemVer(minimum) || compareSemVer(MOTION_HELPER_VERSION, minimum) < 0)) throw Error("HELPER_UPGRADE_REQUIRED");
  let operationIndex = 0;
  const globalArguments = /* @__PURE__ */ new Map();
  while (args[operationIndex]?.startsWith("--")) {
    const option = args[operationIndex], value = args[operationIndex + 1];
    if (!["--cache", "--instance"].includes(option) || globalArguments.has(option) || !value || value.startsWith("--")) throw Error("INVALID_RUNTIME_ARGUMENTS");
    globalArguments.set(option, value);
    operationIndex += 2;
  }
  if (!args.length || !["doctor", "setup", "capabilities", "check-params", "plan", "prepare", "preview", "render"].includes(args[operationIndex])) throw Error("UNSUPPORTED_RUNTIME_OPERATION");
  return withTemporaryPackageCore(pkg, trust, async (core, metadata) => {
    const manifest = parseProtectedJson(await fs7.readFile(path5.join(core, "motion.json"))), entry = manifest.runtime?.entry;
    if (typeof entry !== "string" || !protectedPath(entry) || !/\.(py|mjs|js)$/.test(entry)) throw Error("RUNTIME_UNSUPPORTED");
    if (manifest.runtime?.splitRoot) {
      if (jcs(manifest.runtime.splitRoot) !== jcs({ schema: "motiongit-split-root/1", instanceArgument: "--instance", coreLifetime: "operation", inputVault: "inputs" })) throw Error("RUNTIME_UNSUPPORTED");
      const instance = globalArguments.get("--instance");
      if (!instance) throw Error("INSTANCE_REQUIRED");
      const root = path5.resolve(instance), real = await fs7.realpath(root), stat = await fs7.lstat(root);
      if (real !== root || !stat.isDirectory() || stat.isSymbolicLink()) throw Error("INSTANCE_INVALID");
      const sourceFile = path5.join(root, "motiongit-source.json"), sourceStat = await fs7.lstat(sourceFile);
      if (!sourceStat.isFile() || sourceStat.isSymbolicLink() || sourceStat.size > 16 * 1024) throw Error("INSTANCE_INVALID");
      const source2 = parseProtectedJson(await fs7.readFile(sourceFile), 16 * 1024);
      for (const [field, expected] of Object.entries({
        profile: "motiongit.instance/1",
        registry: "https://motiongit.com",
        recipientAccountId: pkg.receipt.recipientAccountId,
        apiKeyId: pkg.receipt.apiKeyId,
        templateId: pkg.receipt.templateId,
        releaseId: pkg.receipt.releaseId,
        releaseArchiveSha256: pkg.releaseArchiveSha256,
        downloadId: pkg.receipt.downloadId,
        receiptSha256: pkg.receiptSha256
      }))
        if (source2[field] !== expected) throw Error("INSTANCE_SOURCE_CHANGED");
    }
    if (pkg.publicSummary.protection === "protected" && (!manifest.runtime?.splitRoot || (manifest.runtime.hostProfile ?? manifest.runtime.profile) !== "native-python-node/1")) throw Error("PROTECTED_RUNTIME_ADAPTER_REQUIRED");
    const interpreter = entry.endsWith(".py") ? process.platform === "win32" ? "python" : "python3" : process.execPath;
    const env = {};
    for (const name of ["PATH", "HOME", "USERPROFILE", "SYSTEMROOT", "WINDIR", "TEMP", "TMP", "TMPDIR", "LANG", "LC_ALL", "APPDATA", "LOCALAPPDATA"])
      if (process.env[name]) env[name] = process.env[name];
    const operation = args[operationIndex], browser = await automationBrowserPath();
    if (browser) env.CHROME_PATH = browser;
    if (process.env.PLAYWRIGHT_BROWSERS_PATH && path5.isAbsolute(process.env.PLAYWRIGHT_BROWSERS_PATH)) env.PLAYWRIGHT_BROWSERS_PATH = process.env.PLAYWRIGHT_BROWSERS_PATH;
    const native = (manifest.runtime?.hostProfile ?? manifest.runtime?.profile) === "native-python-node/1";
    if (native && !browser && ["plan", "preview", "render"].includes(operation)) throw Error(AUTOMATION_BROWSER_MISSING);
    const child = spawn(interpreter, [path5.join(core, ...entry.split("/")), ...args], { stdio: "inherit", env });
    const completion = new Promise((resolve, reject) => {
      child.on("error", () => reject(Error("RUNTIME_START_FAILED")));
      child.on("exit", (code, signal) => signal ? reject(Error("RUNTIME_INTERRUPTED")) : code === 0 ? resolve(0) : reject(Error("RUNTIME_FAILED")));
    });
    if (child.pid) {
      try {
        await metadata.registerProcess(child.pid);
      } catch {
        child.kill("SIGTERM");
        await completion.catch(() => {
        });
        throw Error("RUNTIME_SESSION_FAILED");
      }
    }
    let activeChild = child;
    const interrupt = (signal) => {
      activeChild.kill(signal);
    };
    const term = () => interrupt("SIGTERM"), int = () => interrupt("SIGINT");
    process.on("SIGTERM", term);
    process.on("SIGINT", int);
    try {
      await completion;
      if (native && operation === "setup" && !browser) {
        const installer = spawn(
          process.platform === "win32" ? "npx.cmd" : "npx",
          AUTOMATION_BROWSER_INSTALL_ARGS,
          { stdio: "inherit", env, cwd: os3.tmpdir(), shell: process.platform === "win32" }
        );
        activeChild = installer;
        const installed = new Promise((resolve, reject) => {
          installer.on("error", () => reject(Error("BROWSER_DEPENDENCY_SETUP_FAILED")));
          installer.on("exit", (code, signal) => code === 0 && !signal ? resolve() : reject(Error("BROWSER_DEPENDENCY_SETUP_FAILED")));
        });
        if (installer.pid) {
          try {
            await metadata.registerProcess(installer.pid);
          } catch {
            installer.kill("SIGTERM");
            await installed.catch(() => {
            });
            throw Error("RUNTIME_SESSION_FAILED");
          }
        }
        await installed;
        if (!await automationBrowserPath()) throw Error(AUTOMATION_BROWSER_MISSING);
      }
      return 0;
    } finally {
      process.off("SIGTERM", term);
      process.off("SIGINT", int);
    }
  }, options2);
}

// packages/motion-spec/src/prepare-music.ts
import fs8 from "node:fs/promises";
import { createReadStream } from "node:fs";
import path6 from "node:path";
import crypto10 from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
var execute = promisify(execFile);
async function command(binary, args, timeout = 3e4) {
  try {
    return await execute(binary, args, { timeout, maxBuffer: 1024 * 1024, windowsHide: true });
  } catch (e) {
    throw Error(e.code === "ENOENT" ? "MUSIC_RENDER_DEPENDENCY_MISSING" : "MUSIC_PREPARATION_FAILED");
  }
}
async function probe(file) {
  const { stdout } = await command("ffprobe", ["-v", "error", "-show_entries", "format=duration:stream=codec_type", "-of", "json", file]);
  let value;
  try {
    value = JSON.parse(stdout);
  } catch {
    throw Error("MUSIC_AUDIO_INVALID");
  }
  const duration = Number(value.format?.duration);
  if (!value.streams?.some((s) => s.codec_type === "audio") || !Number.isFinite(duration) || duration <= 0) throw Error("MUSIC_AUDIO_INVALID");
  return duration;
}
async function digest3(file) {
  const hash = crypto10.createHash("sha256");
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest("hex");
}
async function save(file, value) {
  await fs8.writeFile(file, JSON.stringify(value, null, 2) + "\n", { flag: "wx", mode: 384 });
}
async function musicLevel(file) {
  const { stderr } = await command("ffmpeg", [
    "-hide_banner",
    "-nostats",
    "-i",
    file,
    "-vn",
    "-af",
    "loudnorm=I=-16:TP=-2:LRA=11:print_format=json",
    "-f",
    "null",
    "-"
  ], 30 * 60 * 1e3);
  const measurement = stderr.match(/\{\s*"input_i"\s*:[\s\S]*?\}/)?.[0];
  let value;
  try {
    value = JSON.parse(measurement ?? "");
  } catch {
    throw Error("MUSIC_LEVEL_MEASUREMENT_FAILED");
  }
  const inputLufs = Number(value.input_i), inputPeak = Number(value.input_tp);
  if (!Number.isFinite(inputLufs) || !Number.isFinite(inputPeak)) throw Error("MUSIC_AUDIO_SILENT");
  const gain = Math.min(18, -16 - inputLufs, -2 - inputPeak);
  return {
    mode: "static-gain",
    input_lufs: inputLufs,
    input_true_peak_dbfs: inputPeak,
    target_lufs: -16,
    peak_ceiling_dbfs: -2,
    maximum_boost_db: 18,
    gain_db: gain,
    expected_output_lufs: inputLufs + gain,
    limited_by_headroom_or_boost: gain < -16 - inputLufs - 0.01
  };
}
async function prepareRecommendedMusic(client, input, outputDirectory) {
  const directory = path6.resolve(outputDirectory), parent = await fs8.realpath(path6.dirname(directory));
  if (parent !== path6.dirname(directory)) throw Error("SYMLINK_OUTPUT_REJECTED");
  try {
    await fs8.lstat(directory);
    throw Error("MUSIC_OUTPUT_EXISTS");
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
  await command("ffmpeg", ["-version"]);
  await command("ffprobe", ["-version"]);
  await fs8.mkdir(directory, { mode: 448 });
  const fitted = path6.join(directory, "duration-matched.tmp.wav");
  try {
    const recommendation = await client.recommendMusic(input);
    await save(path6.join(directory, "recommendation.json"), recommendation);
    const original = path6.join(directory, "original.audio"), output = path6.join(directory, "background.wav");
    const download = await client.downloadRecommendedMusic(recommendation, original);
    await save(path6.join(directory, "download.json"), download);
    const sourceDuration = await probe(original), duration = recommendation.fit.target_duration_s;
    if (Math.abs(sourceDuration - recommendation.track.duration_s) > 0.15) throw Error("MUSIC_DURATION_MISMATCH");
    const loops = recommendation.fit.repeat_count - 1;
    await command("ffmpeg", [
      "-hide_banner",
      "-loglevel",
      "error",
      "-n",
      ...loops > 0 ? ["-stream_loop", String(loops)] : [],
      "-i",
      original,
      "-map",
      "0:a:0",
      "-vn",
      "-t",
      String(duration),
      "-ar",
      "48000",
      "-ac",
      "2",
      "-c:a",
      "pcm_f32le",
      fitted
    ], 30 * 60 * 1e3);
    await fs8.chmod(fitted, 384);
    const loudness = await musicLevel(fitted);
    await command("ffmpeg", [
      "-hide_banner",
      "-loglevel",
      "error",
      "-n",
      "-i",
      fitted,
      "-map",
      "0:a:0",
      "-vn",
      "-af",
      `volume=${loudness.gain_db}dB`,
      "-ar",
      "48000",
      "-ac",
      "2",
      "-c:a",
      "pcm_s16le",
      output
    ], 30 * 60 * 1e3);
    await fs8.chmod(output, 384);
    const actualDuration = await probe(output);
    if (Math.abs(actualDuration - duration) > 0.05) throw Error("MUSIC_PREPARED_DURATION_INVALID");
    const result = {
      profile: "motiongit.prepared-music/1",
      status: "ready",
      output,
      duration_s: actualDuration,
      bytes: (await fs8.stat(output)).size,
      sha256: await digest3(output),
      original: { path: original, sha256: download.sha256, duration_s: sourceDuration, trackId: download.trackId },
      fit: recommendation.fit,
      license: download.license,
      attribution: download.attribution,
      source_url: download.source_url,
      credits: 0,
      loudness,
      mixPending: true,
      review: { audibleSeamsChecked: false, finalMixListened: false },
      next: "Bind output to the current template music input. Preserve separate voice and motion SFX; apply fades and lower music under speech. Listen to the complete final mix, including loop seams."
    };
    await save(path6.join(directory, "prepared-music.json"), result);
    return result;
  } catch (e) {
    const code = typeof e.message === "string" && /^[A-Za-z0-9_.-]{1,80}$/.test(e.message) ? e.message : "MUSIC_PREPARATION_FAILED";
    await save(path6.join(directory, "failure.json"), { status: "failed", code, usable: false });
    throw Error(code);
  } finally {
    await fs8.rm(fitted, { force: true });
  }
}

// packages/motion-spec/src/cli.ts
var C = process.stdout.isTTY ? { r: "\x1B[31m", g: "\x1B[32m", y: "\x1B[33m", d: "\x1B[2m", b: "\x1B[1m", x: "\x1B[0m" } : { r: "", g: "", y: "", d: "", b: "", x: "" };
var mark = (l) => l === "error" ? `${C.r}\u2717${C.x}` : l === "warn" ? `${C.y}!${C.x}` : `${C.d}\xB7${C.x}`;
function walk(dir) {
  const out = [];
  const rec = (d) => {
    for (const e of fs9.readdirSync(d, { withFileTypes: true })) {
      const p = path7.join(d, e.name);
      const rel = path7.relative(dir, p).split(path7.sep).join("/");
      if (e.isSymbolicLink()) continue;
      if (e.isDirectory()) {
        if (!isForbidden(rel + "/")) rec(p);
        else out.push(rel + "/");
      } else out.push(rel);
    }
  };
  rec(dir);
  return out;
}
async function runMotionCommand(args, options2 = {}) {
  if (args[0] === "--offline") {
    args = args.slice(1);
    options2 = { ...options2, offline: true };
  }
  const [cmd, a, b, ...extra] = args;
  const print = options2.print ?? console.log;
  if (["--version", "version"].includes(cmd)) {
    print(MOTION_HELPER_VERSION);
    return 0;
  }
  if (a && ["start", "inspect", "read", "new", "api", "update", "run"].includes(cmd)) {
    const file = path7.resolve(a), stat = fs9.statSync(file);
    if (!stat.isFile() || stat.size > PERSONAL_LIMITS.archiveBytes) throw Error("PACKAGE_LIMIT_EXCEEDED");
    const archive = fs9.readFileSync(file);
    if (await packageIsPersonal(archive)) {
      const { verified: pkg, trust } = await verifyOfficialPersonalPackage(archive, options2);
      const emit = (value) => print(JSON.stringify(value, null, 2));
      if (cmd === "inspect") {
        emit(pkg.publicSummary);
        return 0;
      }
      if (cmd === "start") {
        emit({ ...await startPersonalPackage(pkg), ...await checkPersonalPackageAccess(pkg, options2) });
        return 0;
      }
      if (cmd === "read") {
        const document = await readPackageDocument(pkg, b);
        emit({ ...document, ...await checkPersonalPackageAccess(pkg, options2) });
        return 0;
      }
      if (cmd === "new" && b) {
        const instance = await createPersonalInstance(pkg, b);
        emit({ ...instance, ...await checkPersonalPackageAccess(pkg, options2) });
        return 0;
      }
      if (cmd === "update") {
        if (options2.offline) throw Error("OFFLINE_UPDATE_UNAVAILABLE");
        const update = await queryTemplateUpdate(pkg, options2);
        if (b === "--download" && extra[0]) {
          let recoveryPackage;
          if (extra.length !== 1) {
            if (extra.length !== 3 || extra[1] !== "--using-personal") throw Error("INVALID_UPDATE_ARGUMENTS");
            const recoveryPath = path7.resolve(extra[2]), stat2 = fs9.lstatSync(recoveryPath);
            if (!stat2.isFile() || stat2.isSymbolicLink() || process.platform !== "win32" && stat2.mode & 63 || typeof process.getuid === "function" && stat2.uid !== process.getuid() || stat2.size > PERSONAL_LIMITS.archiveBytes) throw Error("RECOVERY_PERSONAL_INPUT_INVALID");
            const bytes = fs9.readFileSync(recoveryPath);
            try {
              recoveryPackage = (await verifyOfficialPersonalPackage(bytes, { ...options2, trust })).verified;
            } finally {
              bytes.fill(0);
            }
          }
          emit(await downloadTemplateUpdate(pkg, update, extra[0], { trust, transport: options2.transport, recoveryPackage }));
        } else if (b) throw Error("INVALID_UPDATE_ARGUMENTS");
        else emit(update);
        return 0;
      }
      if (cmd === "run") return runPersonalPackage(pkg, trust, [b, ...extra].filter((x) => x !== void 0), options2);
      if (cmd === "api") {
        if (options2.offline) throw Error("OFFLINE_API_UNAVAILABLE");
        const client = new OfficialCreatorClient(pkg, options2);
        const input = () => {
          if (!extra[0]) throw Error("INPUT_FILE_REQUIRED");
          const s = fs9.statSync(extra[0]);
          if (!s.isFile() || s.size > 2 * 1024 * 1024) throw Error("INPUT_LIMIT_EXCEEDED");
          return parseProtectedJson(fs9.readFileSync(extra[0]));
        };
        switch (b) {
          case "status":
            emit(await client.status());
            break;
          case "usage":
            emit(await client.usage());
            break;
          case "voices":
            emit(await client.voices(extra[0] ? { language: extra[0] } : {}));
            break;
          case "music-categories":
            emit(await client.musicCategories());
            break;
          case "music-recommend":
            emit(await client.recommendMusic(input()));
            break;
          case "music-download":
            if (!extra[1]) throw Error("OUTPUT_FILE_REQUIRED");
            emit(await client.downloadRecommendedMusic(input(), extra[1]));
            break;
          case "music-prepare":
            if (!extra[1]) throw Error("OUTPUT_DIRECTORY_REQUIRED");
            emit(await prepareRecommendedMusic(client, input(), extra[1]));
            break;
          case "search":
            emit(await client.search(input()));
            break;
          case "select":
            emit(await client.selectAsset(extra[0]));
            break;
          case "quote":
            if (!extra[1]) throw Error("STATE_FILE_REQUIRED");
            emit(await client.prepareGeneration(input(), extra[1]));
            break;
          case "submit":
            if (!extra[0] || !extra[1]) throw Error("EXPLICIT_BUDGET_REQUIRED");
            emit(await client.submitGeneration(extra[0], Number(extra[1])));
            break;
          case "task":
            emit(await client.task(extra[0]));
            break;
          case "receipt":
            emit(await client.receipt(extra[0]));
            break;
          case "asset":
            emit(await client.asset(extra[0]));
            break;
          case "download":
            if (!extra[1]) throw Error("OUTPUT_FILE_REQUIRED");
            emit(await client.downloadAsset(extra[0], extra[1]));
            break;
          case "production":
            emit(await client.registerProduction(input()));
            break;
          default:
            throw Error("UNSUPPORTED_API_OPERATION");
        }
        return 0;
      }
      throw Error("INVALID_PERSONAL_COMMAND");
    }
    if (cmd !== "inspect") throw Error("PERSONAL_PACKAGE_REQUIRED");
  }
  if (cmd === "inspect" && a) {
    const r = await inspectPackage(path7.resolve(a), { recommendAuthoring: RECOMMENDED_AUTHORING });
    console.log(`${C.b}${path7.basename(a)}${C.x}  ${C.d}sha256 ${r.packageSha256}  ${r.fileCount} files  spec ${SPEC_VERSION}${C.x}`);
    if (r.manifest?.template) console.log(`${r.manifest.template.name}  v${r.manifest.template.version}  ${C.d}${r.manifest.runtime?.profile ?? ""}${C.x}`);
    for (const k of r.checks) console.log(`  ${k.status === "pass" ? `${C.g}\u2713${C.x}` : k.status === "warn" ? `${C.y}!${C.x}` : `${C.r}\u2717${C.x}`} ${k.label}`);
    for (const f of r.findings.filter((x) => x.level !== "info")) console.log(`    ${mark(f.level)} ${f.message}${f.path ? `  ${C.d}${f.path}${C.x}` : ""}`);
    console.log(r.ok ? `
${C.g}\u901A\u8FC7${C.x}\uFF1A\u53EF\u4EE5\u4E0A\u4F20\u5230 https://motiongit.com/publish` : `
${C.r}\u672A\u901A\u8FC7${C.x}\uFF1A\u8BF7\u4FEE\u6539\u540E\u91CD\u65B0\u6253\u5305`);
    if (process.argv.includes("--json")) console.log(JSON.stringify({ ok: r.ok, checks: r.checks, findings: r.findings }, null, 2));
    return r.ok ? 0 : 1;
  }
  if (cmd === "scan" && a) {
    const dir = path7.resolve(a);
    let errors = 0, warns = 0;
    for (const rel of walk(dir)) {
      const bad = isForbidden(rel);
      if (bad) {
        console.log(`  ${mark("error")} ${rel}  ${C.d}${bad}\uFF0C\u4E0D\u8981\u6253\u5305${C.x}`);
        errors++;
        continue;
      }
      if (!isTextFile(rel)) continue;
      const p = path7.join(dir, rel);
      if (fs9.statSync(p).size > 2 * 1024 * 1024) continue;
      const lines = fs9.readFileSync(p, "utf8").split("\n");
      lines.forEach((line, i) => {
        for (const h of scanText(line)) {
          console.log(`  ${mark(h.level)} ${rel}:${i + 1}  ${h.label}`);
          h.level === "error" ? errors++ : warns++;
        }
      });
    }
    console.log(errors ? `
${C.r}${errors} \u5904\u9700\u8981\u5904\u7406${C.x}${warns ? `\uFF0C${warns} \u5904\u5EFA\u8BAE\u68C0\u67E5` : ""}` : `
${C.g}\u6CA1\u6709\u53D1\u73B0\u4E2A\u4EBA\u4FE1\u606F\u6216\u51ED\u636E${C.x}${warns ? `\uFF08${warns} \u5904\u5EFA\u8BAE\u68C0\u67E5\uFF09` : ""}`);
    return errors ? 1 : 0;
  }
  if (cmd === "pack" && a && b) {
    const dir = path7.resolve(a);
    if (!fs9.existsSync(path7.join(dir, "motion.json"))) throw Error("\u76EE\u5F55\u6839\u90E8\u7F3A\u5C11 motion.json");
    const files = walk(dir).filter((rel) => !rel.endsWith("/") && !isForbidden(rel) && rel !== "integrity.json" && !rel.endsWith(".DS_Store"));
    const skipped = walk(dir).filter((rel) => isForbidden(rel));
    for (const s of skipped) console.log(`  ${C.d}\u8DF3\u8FC7 ${s}${C.x}`);
    const out = path7.resolve(b);
    const stage = fs9.mkdtempSync(path7.join(os4.tmpdir(), "motion-pack-"));
    let res;
    try {
      const artifact = path7.join(stage, "candidate.motion");
      res = await buildPackage(files.map((rel) => ({ path: rel, data: fs9.readFileSync(path7.join(dir, rel)) })), artifact);
      const report = await inspectPackage(artifact, { recommendAuthoring: RECOMMENDED_AUTHORING });
      if (!report.ok) throw Error("Package failed static inspection: " + report.findings.filter((f) => f.level === "error").map((f) => f.code).join(", "));
      fs9.copyFileSync(artifact, out, fs9.constants.COPYFILE_EXCL);
    } finally {
      fs9.rmSync(stage, { recursive: true, force: true });
    }
    console.log(`${C.g}\u5DF2\u6253\u5305${C.x} ${out}
  ${files.length + 1} \u4E2A\u6587\u4EF6 \xB7 ${(res.size / 1024).toFixed(1)} KB \xB7 sha256 ${res.sha256}`);
    console.log(`
\u4E0B\u4E00\u6B65\uFF1Anode ${path7.relative(process.cwd(), process.argv[1])} inspect ${path7.relative(process.cwd(), out)}`);
    return 0;
  }
  print(`MotionGit motion CLI (helper ${MOTION_HELPER_VERSION}; author spec ${SPEC_VERSION}; personal spec ${PERSONAL_SPEC_VERSION}, personal-download-v1)

  inspect <file.motion> [--json]   \u53EA\u8BFB\u68C0\u67E5\u5305\uFF08\u4E0E motiongit.com \u89C4\u5219\u4E00\u81F4\uFF09
  scan <dir>                       \u626B\u63CF\u4E2A\u4EBA\u4FE1\u606F\u4E0E\u51ED\u636E
  pack <dir> <out.motion>          \u6253\u5305\u5E76\u751F\u6210 integrity.json
  start <personal.motion>          \u4ECE\u968F\u5305\u5165\u53E3\u8BC6\u522B\u5F53\u524D\u6A21\u677F\u5E76\u8BFB\u53D6\u5236\u4F5C\u5F15\u5BFC
  read <personal.motion> [path]    \u9A8C\u7B7E\u5E76\u8BFB\u53D6\u6A21\u677F\u8BF4\u660E
  new <personal.motion> <dir>      \u65B0\u5EFA\u5236\u4F5C\u5B9E\u4F8B\uFF0C\u4FDD\u7559\u6765\u6E90
  api <personal.motion> <action>  \u4F7F\u7528\u5305\u5185\u539F\u8D26\u6237 Key \u8C03\u7528\u5B98\u65B9 API
  update <personal.motion>        \u533F\u540D\u67E5\u8BE2\u6A21\u677F\u66F4\u65B0
  update <personal.motion> --download <new.motion> [--using-personal <own-other.motion>]  \u4F7F\u7528\u5305\u5185\u672C\u4EBA\u6807\u8BC6\u4E0B\u8F7D\u65B0\u7248\uFF0C\u65E0\u9700\u7F51\u9875\u767B\u5F55
  run <personal.motion> <operation> [args]         \u6267\u884C\u5DF2\u9A8C\u8BC1\u6A21\u677F
  --offline <command>             \u4F7F\u7528\u6B64\u524D\u5B98\u65B9\u4FE1\u4EFB\u4E0E\u89E3\u9501\u7F13\u5B58

API actions: status, usage, voices [language], music-categories,
  search <query.json>, select <source_ref>, quote <request.json> <state.json>,
  submit <state.json> <max_credits>, task <id>, receipt <id>, asset <id>,
  download <id> <new-file>, production <event.json>

\u89C4\u8303\uFF1Ahttps://motiongit.com/spec`);
  return !cmd || ["help", "--help", "-h"].includes(cmd) ? 0 : 1;
}
if (process.argv[1] && fs9.existsSync(process.argv[1]) && fs9.realpathSync(process.argv[1]) === fs9.realpathSync(fileURLToPath(import.meta.url))) {
  runMotionCommand(process.argv.slice(2)).then((code) => {
    process.exitCode = code;
  }).catch((e) => {
    console.error(e.message);
    process.exitCode = 2;
  });
}
export {
  runMotionCommand
};
