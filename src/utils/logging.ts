type Arguments = unknown[];

type Handler = (...args: Arguments) => void;

type Color = [number, number, number];

type Theme = { bg: Color; fg: Color };

type HandlerConfig = {
  handler: Handler;
  levelValue: number;
};

type Logger = {
  log: Handler;
  as: (level: string) => Handler;

  loggers: Record<string, Logger>;
  getLogger: (namespace: string, config?: LoggerConfig) => Logger;

  namespace: string;

  level: string;
  minLevel: string;

  enabled: boolean;
  // TODO!: add a way to override enabled for all children, permanently (setting enabled recursively would still allow them to reset it themselves)
} & Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

type LoggerConfig = {
  level?: string;
  minLevel?: string;
  enabled?: boolean;
};

type NamespaceConfig = {
  enabled?: boolean;
  minLevel?: string;
};

const namespaceConfigs: Record<string, NamespaceConfig> = {};

const loadNamespaceConfigsFromLocalStorage = () => {
  const nc = window.localStorage.getItem("LOGGING_NAMESPACE_CONFIG");
  if (nc) {
    const ncObj: Record<string, NamespaceConfig> = JSON.parse(nc);

    for (const [key, value] of Object.entries(ncObj)) {
      namespaceConfigs[key] = value;
    }
  }
};
loadNamespaceConfigsFromLocalStorage();

const getNamespaceConfig = (namespace: string) => {
  return { ...namespaceConfigs[namespace] };
};

const handlers: Record<string, HandlerConfig> = {};

const defineHandler = (name: string, levelValue: number, handler: Handler) => {
  handlers[name] = { handler, levelValue: levelValue };
};

const defineRelativeHandler = (
  name: string,
  siblingName: string,
  relation: -1 | 0 | 1,
  handler: Handler
) => {
  name = name.toUpperCase();
  siblingName = siblingName.toUpperCase();
  const sibling = handlers[siblingName];
  if (sibling === undefined) {
    console.warn(`No handler named '${siblingName}' found`); // Using basic console.warn inside the logging module to avoid potential problems.
    return;
  }

  const targetLevel = sibling.levelValue + (relation === 1 ? 1 : 0);

  if (relation !== 0) {
    for (const [, value] of Object.entries(handlers)) {
      if (value.levelValue >= targetLevel) {
        value.levelValue++;
      }
    }
  }

  defineHandler(name, targetLevel, handler);
};

const colorize = (
  text: string,
  r: number | undefined,
  g: number | undefined,
  b: number | undefined,
  fgR: number | undefined,
  fgG: number | undefined,
  fgB: number | undefined
) => {
  if (r === undefined) {
    r = Math.floor(Math.random() * 200);
  }
  if (g === undefined) {
    g = Math.floor(Math.random() * 200);
  }
  if (b === undefined) {
    b = Math.floor(Math.random() * 200);
  }

  if (fgR === undefined) {
    fgR = Math.floor(Math.random() * 200);
  }
  if (fgG === undefined) {
    fgG = Math.floor(Math.random() * 200);
  }
  if (fgB === undefined) {
    fgB = Math.floor(Math.random() * 200);
  }
  return `\x1b[48;2;${r};${g};${b};38;2;${fgR};${fgG};${fgB}m${text}`;
};

const themes: Record<string, Theme> = {
  NONE: { bg: [255, 255, 255], fg: [0, 0, 0] },
  TRACE: { bg: [255, 255, 200], fg: [0, 0, 0] },
  DEBUG: { bg: [200, 255, 200], fg: [0, 0, 0] },
  LOG: { bg: [230, 230, 230], fg: [0, 0, 0] },
  INFO: { bg: [200, 255, 255], fg: [0, 0, 0] },
  WARN: { bg: [255, 180, 0], fg: [0, 0, 0] },
  ERROR: { bg: [255, 130, 130], fg: [0, 0, 0] },
  FATAL: { bg: [255, 0, 0], fg: [255, 255, 255] },
};

const theme = (text: string, themeName: string) => {
  const theme = themes[themeName as keyof typeof themes] ?? {
    bg: [255, 255, 255],
    fg: [0, 0, 0],
  };
  return colorize(
    text,
    theme.bg[0],
    theme.bg[1],
    theme.bg[2],
    theme.fg[0],
    theme.fg[1],
    theme.fg[2]
  );
};

defineHandler("NONE", 0, console.log.bind(console));

const defineConsoleHandler = (
  name: string,
  methodName: string,
  sibling: string,
  relation: -1 | 0 | 1
) => {
  name = name.toUpperCase();
  methodName = methodName.toLowerCase();
  sibling = sibling.toUpperCase();
  if (
    !["trace", "debug", "log", "info", "warn", "error"].includes(methodName)
  ) {
    throw new Error(`Invalid console method name: ${methodName}`);
  }
  const method =
    console[
      methodName as "trace" | "debug" | "log" | "info" | "warn" | "error"
    ].bind(console);

  defineRelativeHandler(
    name.toUpperCase(),
    sibling.toUpperCase(),
    relation,
    method.bind(console)
  );
};

defineConsoleHandler("TRACE", "trace", "NONE", 1);
defineConsoleHandler("DEBUG", "debug", "TRACE", 1);
defineConsoleHandler("LOG", "log", "DEBUG", 1);
defineConsoleHandler("INFO", "info", "LOG", 1);
defineConsoleHandler("WARN", "warn", "INFO", 1);
defineConsoleHandler("ERROR", "error", "WARN", 1);
defineRelativeHandler("FATAL", "error", 1, console.error.bind(console));

if (!handlers["LOG"]) {
  throw new Error("No handler named 'LOG' found");
}
const DEFAULT_LEVEL: string = "LOG";

const DEFAULT_HANDLER_CONFIG = handlers[DEFAULT_LEVEL];

const getHandlerConfig = (level: string) =>
  handlers[level] ?? DEFAULT_HANDLER_CONFIG;

const getLoggerGlobally = (namespace: string, config?: LoggerConfig) => {
  const namespaces = namespace.split(":");
  let logger = RootLogger;
  for (const name of namespaces) {
    logger = logger.getLogger(name, config);
  }
  return logger;
};

const createPrefix = (level: string, namespace: string) => {
  let l = `[${level}]`;
  if (themes[level] !== undefined) {
    l = theme(l, level);
  }
  const n = `[${namespace}]`;
  return l + n;
};

// TODO!: consider having everything configurable be overidable by namespaceConfig.

const createLogger = (namespace: string, config?: LoggerConfig) => {
  const {
    level: configLevel,
    minLevel: configMinLevel,
    enabled: configEnabled,
  } = config ?? {};

  const { enabled: namespaceEnabled, minLevel: namespaceMinLevel } =
    getNamespaceConfig(namespace) ?? {};

  const _namespace = namespace;

  let _level: string;
  let _minLevelConfig = {
    name: "",
    levelValue: 0,
  };

  let handlerConfig: HandlerConfig;

  let _enabled = namespaceEnabled ?? configEnabled ?? true;

  const logger: Logger = {
    get log() {
      if (
        !logger.enabled ||
        handlerConfig.levelValue < _minLevelConfig.levelValue
      ) {
        return () => {};
      }

      return handlerConfig.handler;
    },

    // TODO!: this one should not handle wrong names gracefully, but rather fail hard, since we're acting "as" something, so that something has to exist. The proxy version, on the other hand, is already vague with its index signature, so it would make more sense for that one to use a fall back.
    as(level: string) {
      const local_handlerConfig = getHandlerConfig(level.toUpperCase());
      if (
        !logger.enabled ||
        local_handlerConfig.levelValue < _minLevelConfig.levelValue
      ) {
        return () => {};
      }
      return local_handlerConfig.handler.bind(
        console,
        createPrefix(level.toUpperCase(), _namespace)
      );
    },

    loggers: {},

    getLogger: (namespace: string, config?: LoggerConfig) => {
      if (namespace.includes(":")) {
        return getLoggerGlobally(namespace, config);
      }
      let l = logger.loggers[namespace];
      if (!l) {
        l = createLogger(logger.namespace + ":" + namespace, config);
        logger.loggers[namespace] = l;
      }
      return l;
    },

    get namespace() {
      return _namespace;
    },

    get level(): string {
      return _level;
    },

    set level(name: string) {
      _level = name.toUpperCase();
      const local_handlerConfig = getHandlerConfig(_level);
      handlerConfig = {
        ...local_handlerConfig,
        handler: local_handlerConfig.handler.bind(
          console,
          createPrefix(_level, _namespace)
        ),
      };
    },

    get minLevel() {
      return _minLevelConfig.name;
    },

    set minLevel(name: string) {
      const local_handlerConfig = getHandlerConfig(name.toUpperCase());
      _minLevelConfig = {
        name: name.toUpperCase(),
        levelValue: local_handlerConfig.levelValue,
      };
    },

    get enabled() {
      return _enabled;
    },

    set enabled(enabled: boolean) {
      const namespaceConfig = getNamespaceConfig(namespace);
      const namespaceEnabled = namespaceConfig?.enabled;
      if (namespaceEnabled === false) {
        enabled = false;
        return;
      }
      _enabled = enabled;
    },
  };

  logger.level = configLevel ?? DEFAULT_LEVEL;
  const mLvl = namespaceMinLevel ?? configMinLevel;
  if (mLvl) {
    logger.minLevel = mLvl;
  }

  const proxy = new Proxy(logger, {
    get(target, prop) {
      if (typeof prop === "string") {
        if (Object.prototype.hasOwnProperty.call(target, prop)) {
          return target[prop as keyof Logger];
        }
        const upperCaseProp = prop.toUpperCase();
        const handlerConfig = handlers[upperCaseProp];
        const handler = handlerConfig?.handler;
        if (!handler || !handlerConfig) {
          return console.error.bind(
            console,
            createPrefix(upperCaseProp, _namespace) + "[Invalid logging level]"
          );
        }
        if (
          !logger.enabled ||
          handlerConfig?.levelValue < _minLevelConfig.levelValue
        ) {
          return () => {};
        }
        return handler.bind(console, createPrefix(upperCaseProp, _namespace));
      }
      throw Error("Unknown property symbol.");
    },
  });

  return proxy;
};

const RootLogger = createLogger("*");

export { RootLogger };
