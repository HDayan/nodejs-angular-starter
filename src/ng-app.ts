import { AppServerModule } from "../angular-src/src/app/app.server.module";
// These are important and needed before anything else
import "zone.js/dist/zone-node";
import "reflect-metadata";

import { renderModuleFactory } from "@angular/platform-server";
import { enableProdMode } from "@angular/core";

import * as express from "express";
import { join } from "path";
import { readFileSync } from "fs";

// Import module map for lazy loading
import { provideModuleMap } from "@nguniversal/module-map-ngfactory-loader";
import { Application } from "express";

/**
 * Use Angular-Universal to deliever our app.
 */
export class AngularApp {
  init(app: Application) {
    enableProdMode();

    const DIST_FOLDER = join(process.cwd(), "dist");

    const {
      AppServerModuleNgFactory,
      LAZY_MODULE_MAP
    } = require("./dist/server/main");

    // Our index.html we'll use as our template
    const template = readFileSync(
      join(DIST_FOLDER, "browser", "index.html")
    ).toString();

    app.engine("html", (_, options, callback) => {
      renderModuleFactory(AppServerModuleNgFactory, {
        // Our index.html
        document: template,
        url: options.req.url,
        // DI so that we can get lazy-loading to work differently (since we need it to just instantly render it)
        extraProviders: [provideModuleMap(LAZY_MODULE_MAP)]
      }).then(html => {
        callback(null, html);
      });
    });

    app.set("view engine", "html");
    app.set("views", join(DIST_FOLDER, "browser"));

    // Server static files from /browser
    app.get("*.*", express.static(join(DIST_FOLDER, "browser")));

    // All regular routes use the Universal engine
    app.get("*", (req, res) => {
      res.render(join(DIST_FOLDER, "browser", "index.html"), { req });
    });
  }
}

export default new AngularApp();