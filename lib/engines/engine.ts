import * as fs from 'fs';
import { EventEmitter } from 'events';

import { OrcheEngines } from '../constants/orche-engines';
import { OrcheConfig } from '../interfaces/orche-config';
import { CompatVersions } from '../interfaces/compat-versions';
import { PackageUtils } from '../utils/package.utils';
import { PathUtils } from '../utils/path.utils';
import { LogUtils } from '../utils/log.utils';


export abstract class Engine {

  protected app: any;
  protected server: any;
  protected config: OrcheConfig;

  constructor(compatVersions: CompatVersions, userConfig?: OrcheConfig) {
    const isCompatible = this.isEngineVersionSupported(compatVersions);

    if (!isCompatible) {
      throw new Error(`Engine version not supported. For ${compatVersions.dependency}
      you should use a version from ${compatVersions.from} to ${compatVersions.to}`);
    }

    this.loadOrcheConfig(userConfig);
  }

  private isEngineVersionSupported(compatVersions: CompatVersions): boolean {
    const pUtils: PackageUtils = new PackageUtils();

    return pUtils.isDependencyVersionCompatible(
      compatVersions.dependency,
      compatVersions.from,
      compatVersions.to);
  }

  /**
   * Priority hierarchy:
   * 1 - User configs
   * 2 - System variable ORCHE_CONFIG
   * 3 - App .orcherc
   * load .orcherc local or SYSTEM VARIABLE
   */
  protected loadOrcheConfig(appCfg?: OrcheConfig): void {
    const configAppFileName = appCfg.appName || PathUtils.appDirName;

    // Loads the environment orche config file contents
    let envCfg: OrcheConfig = {};
    if (process.env.ORCHE_CONFIG) {
      const envConfigFile = fs.existsSync(process.env.ORCHE_CONFIG);

      if (envConfigFile) {
        try {
          const fileContent = fs.readFileSync(process.env.ORCHE_CONFIG, 'utf8');
          envCfg = fileContent[configAppFileName];

          LogUtils.debug(`Orche's environment config file loaded. 
            File: ${process.env.ORCHE_CONFIG}`);
        } catch (error) {
          LogUtils.error(`Orche's environment config file could not be loaded. Error: 
            ${error.stack}`);
        }

      } else {
        LogUtils.error(`Orche's environment config file not found. File: 
          ${process.env.ORCHE_CONFIG}`);
      }

    }

    // Load's the local orche config file contents
    let localCfg: OrcheConfig = {};
    const localConfigFile = fs.existsSync(PathUtils.localConfigFile);
    if (localConfigFile) {
      try {
        const fileContent = fs.readFileSync(PathUtils.localConfigFile, 'utf8');
        localCfg = fileContent;
        LogUtils.debug(`Orche's environment config file loaded. 
          File: ${process.env.ORCHE_CONFIG}`);
      } catch (error) {
        LogUtils.error(`Orche's local config file could not be loaded. Error: ${error.stack}`);
      }
    }

    /*
     * Config's merge, following this priority:
     * 1 - ENV's orche file configuration
     * 2 - LOCAL's orche file configuration
     * 3 - code orche config
     */
    appCfg.apiEngine = envCfg.apiEngine || localCfg.apiEngine || appCfg.apiEngine ||
      OrcheEngines.ExpressJS;

    const path = envCfg.path || localCfg.path || appCfg.path;
    appCfg.path = PathUtils.urlSanitation(path);

    appCfg.port = envCfg.port || localCfg.port || appCfg.port || 3000;
    appCfg.appName = envCfg.appName || localCfg.appName || appCfg.appName || PathUtils.appDirName;
    appCfg.corsConfig = envCfg.corsConfig || localCfg.corsConfig || appCfg.corsConfig;
    appCfg.debug = envCfg.debug || localCfg.debug || appCfg.debug || false;
    appCfg.extensions = envCfg.extensions || localCfg.extensions || appCfg.extensions;
    appCfg.initMessage = envCfg.initMessage || localCfg.initMessage || appCfg.initMessage;
    appCfg.settings = envCfg.settings || localCfg.settings || appCfg.settings;

    this.config = appCfg;
  }

  public abstract loadServer(): Promise<any>;
  protected abstract setupSettings(): void;
  protected abstract setupExtensions(): void;

}
