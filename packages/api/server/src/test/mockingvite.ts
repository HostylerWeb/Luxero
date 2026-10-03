// Mockingvite = Vitest + Mockingoose aka Mongoose Mocking for Vitest
// A Vitest compatable version of Mockingoose
// Docs avaiable here https://github.com/alonronin/mockingoose

import mongoose from "mongoose";
import { vi } from "vitest";

if (!/^5/.test(mongoose.version)) {
  mongoose.Promise = Promise;
}

mongoose.connect = vi.fn().mockImplementation(() => Promise.resolve());

mongoose.createConnection = vi.fn().mockReturnValue({
  catch() {
    /* no op */
  },
  model: mongoose.model.bind(mongoose),
  on: vi.fn(),
  once: vi.fn(),
  then(resolve: (value: unknown) => void) {
    return Promise.resolve(resolve(this));
  },
});

const ops = [
  "find",
  "findOne",
  "count",
  "countDocuments",
  "estimatedDocumentCount",
  "distinct",
  "findOneAndUpdate",
  "findOneAndDelete",
  "findOneAndRemove",
  "findOneAndReplace",
  "remove",
  "update",
  "updateOne",
  "updateMany",
  "deleteOne",
  "deleteMany",
  "save",
  "aggregate",
  "$save",
];

type MockOp = (typeof ops)[number];

interface MockContext {
  op?: MockOp;
  model: { modelName: string };
  _mongooseOptions?: { lean?: boolean; rawResult?: boolean };
  [key: string]: unknown;
}

const mockedReturn = async function (
  this: MockContext,
  cb?: (err: unknown, mock: unknown) => void
) {
  const {
    op,
    model: { modelName },
    _mongooseOptions = {},
  } = this;
  const Model = mongoose.model(modelName);

  let mock = (mockingoose as unknown as { __mocks: Record<string, Record<string, unknown>> })
    .__mocks[modelName]?.[op as string];

  let err: unknown = null;

  if (mock instanceof Error) {
    err = mock;
  }

  if (typeof mock === "function") {
    mock = await (mock as (ctx: MockContext) => Promise<unknown>)(this);
  }

  if (!mock && op === "save") {
    mock = this;
  }

  if (!mock && op === "$save") {
    mock = this;
  }

  if (
    mock &&
    !(mock instanceof Model) &&
    ![
      "remove",
      "deleteOne",
      "deleteMany",
      "update",
      "updateOne",
      "updateMany",
      "count",
      "countDocuments",
      "estimatedDocumentCount",
      "distinct",
    ].includes(op as string)
  ) {
    mock = Array.isArray(mock) ? mock.map((item) => new Model(item)) : new Model(mock);

    if (op === "insertMany") {
      if (!Array.isArray(mock)) mock = [mock];

      for (const doc of mock as Array<{ validateSync: () => Error | null }>) {
        const e = doc.validateSync();
        if (e) throw e;
      }
    }

    if (_mongooseOptions.lean || _mongooseOptions.rawResult) {
      mock = Array.isArray(mock)
        ? mock.map((item) => (item as { toObject: () => unknown }).toObject())
        : (mock as { toObject: () => unknown }).toObject();
    }
  }

  if (cb) {
    return cb(err, mock);
  }

  if (err) {
    throw err;
  }

  return mock;
};

ops.forEach((op) => {
  (mongoose.Query.prototype as unknown as Record<string, unknown>)[op] = vi
    .fn()
    .mockImplementation(function (
      this: MockContext,
      criteria: unknown,
      doc: unknown,
      options: unknown,
      callback?: (err: unknown, mock: unknown) => void
    ) {
      if (
        [
          "find",
          "findOne",
          "count",
          "countDocuments",
          "remove",
          "deleteOne",
          "deleteMany",
          "update",
          "updateOne",
          "updateMany",
          "findOneAndUpdate",
          "findOneAndRemove",
          "findOneAndDelete",
          "findOneAndReplace",
        ].includes(op) &&
        typeof criteria !== "function"
      ) {
        (this as unknown as { merge: (c: unknown) => void }).merge(criteria);
      }

      if (["distinct"].includes(op) && typeof doc !== "function") {
        (this as unknown as { merge: (c: unknown) => void }).merge(doc);
      }

      if (/update/i.test(op) && typeof doc !== "function" && doc) {
        (this as unknown as { setUpdate: (d: unknown) => void }).setUpdate(doc);
      }

      let _criteria: unknown = criteria;
      let _doc: unknown = doc;
      let _options: unknown = options;
      let _callback: unknown = callback;

      switch (arguments.length) {
        case 4:
        case 3:
          if (typeof _options === "function") {
            _callback = _options;
            _options = {};
          }
          break;
        case 2:
          if (typeof _doc === "function") {
            _callback = _doc;
            _doc = _criteria;
            _criteria = undefined;
          }
          _options = undefined;
          break;
        case 1:
          if (typeof _criteria === "function") {
            _callback = _criteria;
            _criteria = _options = _doc = undefined;
          } else {
            _doc = _criteria;
            _criteria = _options = undefined;
          }
      }

      this.op = op as MockOp;

      if (!_callback) {
        return this;
      }

      return (
        this as unknown as { exec: { call: (ctx: unknown, cb: unknown) => unknown } }
      ).exec.call(this, _callback);
    });
});

mongoose.Query.prototype.exec = vi.fn().mockImplementation(function (
  this: MockContext,
  cb?: (err: unknown, mock: unknown) => void
) {
  return mockedReturn.call(this, cb);
});

mongoose.Aggregate.prototype.exec = vi.fn().mockImplementation(async function (
  this: MockContext,
  cb?: (err: unknown, mock: unknown) => void
) {
  const {
    _model: { modelName },
  } = this as unknown as { _model: { modelName: string } };

  let mock = (mockingoose as unknown as { __mocks: Record<string, Record<string, unknown>> })
    .__mocks[modelName]?.aggregate;

  let err: unknown = null;

  if (mock instanceof Error) {
    err = mock;
  }

  if (typeof mock === "function") {
    mock = await (mock as (ctx: MockContext) => Promise<unknown>)(this);
  }

  if (cb) {
    return cb(err, mock);
  }

  if (err) {
    throw err;
  }

  return mock;
});

mongoose.Model.insertMany = vi.fn().mockImplementation(function (
  this: MockContext,
  _arr: unknown,
  options: unknown,
  cb?: (err: unknown, mock: unknown) => void
) {
  const op = "insertMany";
  const { modelName } = this as unknown as { modelName: string };

  let _options: unknown = options;
  let _cb: unknown = cb;

  if (typeof _options === "function") {
    _cb = _options;
    _options = null;
  } else {
    this._mongooseOptions = _options as MockContext["_mongooseOptions"];
  }

  Object.assign(this, { op, model: { modelName } });
  return mockedReturn.call(this, _cb as ((err: unknown, mock: unknown) => void) | undefined);
});

const instance = ["remove", "save", "$save"];

instance.forEach((methodName) => {
  mongoose.Model.prototype[methodName] = vi.fn().mockImplementation(function (
    this: MockContext,
    options: unknown,
    cb?: (err: unknown, mock: unknown) => void
  ) {
    const op = methodName;
    const { modelName } = (this as unknown as { constructor: { modelName: string } }).constructor;

    let _cb: unknown = cb;

    if (typeof options === "function") {
      _cb = options;
    }

    Object.assign(this, { op, model: { modelName } });

    const hooks = (
      this as unknown as { constructor: { hooks: { execPre: Function; execPost: Function } } }
    ).constructor.hooks;

    return new Promise<unknown>((resolve, reject) => {
      hooks.execPre(op, this, [_cb], (err: unknown) => {
        if (err) {
          reject(err);
          return;
        }

        const ret = mockedReturn.call(
          this,
          _cb as ((err: unknown, mock: unknown) => void) | undefined
        );

        if (_cb) {
          hooks.execPost(op, this, [ret], (err2: unknown) => {
            if (err2) {
              reject(err2);
              return;
            }

            resolve(ret);
          });
        } else {
          (ret as Promise<unknown>)
            .then((ret2) => {
              hooks.execPost(op, this, [ret2], (err3: unknown) => {
                if (err3) {
                  reject(err3);
                  return;
                }

                resolve(ret2);
              });
            })
            .catch(reject);
        }
      });
    });
  });
});

vi.doMock("mongoose", () => mongoose);

const proxyTarget = Object.assign(() => void 0, {
  __mocks: {} as Record<string, Record<string, unknown>>,
  resetAll() {
    this.__mocks = {};
  },
  toJSON() {
    return this.__mocks;
  },
});

const getMockController = (prop: string) => {
  return {
    toReturn(o: unknown, op = "find") {
      Object.hasOwn(proxyTarget.__mocks, prop)
        ? (proxyTarget.__mocks[prop][op] = o)
        : (proxyTarget.__mocks[prop] = { [op]: o });

      return this;
    },

    reset(op: string) {
      if (op) {
        delete proxyTarget.__mocks[prop][op];
      } else {
        delete proxyTarget.__mocks[prop];
      }

      return this;
    },

    toJSON() {
      return proxyTarget.__mocks[prop] || {};
    },
  };
};

const proxyTraps = {
  get(target: Record<string, unknown>, prop: string) {
    if (Object.hasOwn(target, prop)) {
      return Reflect.get(target, prop);
    }

    return getMockController(prop);
  },
  apply: (_target: unknown, _thisArg: unknown, [prop]: [string]) => mockModel(prop),
};

const mockingoose = new Proxy(proxyTarget, proxyTraps);

/**
 * Returns a helper with which you can set up mocks for a particular Model
 */
const mockModel = (model: unknown) => {
  const modelName =
    typeof model === "function" ? (model as { modelName?: string }).modelName : (model as string);
  if (typeof modelName === "string") {
    return getMockController(modelName);
  } else {
    throw new Error("model must be a string or mongoose.Model");
  }
};

export default mockingoose;
