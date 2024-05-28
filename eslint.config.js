import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import pluginReactHooks from "eslint-plugin-react-hooks";

export default [
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...fixupConfigRules({
    ...pluginReactConfig,
    rules: {
      ...pluginReactConfig.rules,
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
    },
    settings: {
      ...pluginReactConfig.settings,
      react: {
        version: "18.2.0",
      },
    },
  }),
  {
    plugins: {
      "react-hooks": fixupPluginRules(pluginReactHooks),
    },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
    },
  },
];
