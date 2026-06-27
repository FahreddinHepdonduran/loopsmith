/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
// Never overwrite an existing render. Each video must use a fresh name
// under output/. If the name already exists, the render fails on purpose.
Config.setOverwriteOutput(false);
