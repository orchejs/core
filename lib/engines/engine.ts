import * as fs from 'fs';
import { EventEmitter } from 'events';

import { OrcheConfig } from '../interfaces/orche-config';
import { CompatVersions } from '../interfaces/compat-versions';
import { PackageUtils } from '../utils/package.utils';
import { PathUtils } from '../utils/path.utils';


export abstract class Engine {

  protected app: any;
  protected server: any;
  protected config: OrcheConfig;
  protected abstract compatVersions: CompatVersions;

  constructor(userConfig?: OrcheConfig) {
    const isCompatible = this.isEngineVersionSupported();

    if (!isCompatible) {
      throw new Error(`Engine version not supported. For ${this.compatVersions.dependency}
      you should use a version from ${this.compatVersions.from} to ${this.compatVersions.to}`);
    }

    this.loadOrcheConfig(userConfig);
  }

  protected isEngineVersionSupported(): boolean {
    const pUtils: PackageUtils = new PackageUtils();
    
    return pUtils.isDependencyVersionCompatible(this.compatVersions.dependency, 
                                                this.compatVersions.from, 
                                                this.compatVersions.to);
  }

  /**
   * Priority hierarchy:
   * 1 - User configs
   * 2 - System variable ORCHE_CONFIG
   * 3 - App .orcherc
   * load .orcherc local or SYSTEM VARIABLE
   */
  protected loadOrcheConfig(appConfig?: OrcheConfig): void {
    const cfgApp = appConfig.appName || PathUtils.appDirName;

    let envOrcheCfg;
    if (process.env.ORCHE_CONFIG) {
      const fileContent = fs.readFileSync(process.env.ORCHE_CONFIG, 'utf8');
      envOrcheCfg = fileContent[cfgApp];
    }

    let localOrcheCfg;
    if (PathUtils.localConfigFile) {
      const fileContent = fs.readFileSync(PathUtils.localConfigFile, 'utf8');
      localOrcheCfg = fileContent;
    }

    // TODO :: made config merge

    this.config = appConfig;
  }

  public abstract loadServer(): Promise<any>;
  protected abstract setupSettings(): void;
  protected abstract setupMiddleware(): void;

}
