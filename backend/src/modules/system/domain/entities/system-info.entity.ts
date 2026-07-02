import { AppVersion } from "../value-objects/app-version.vo.js";
import { ServiceStatus } from "../value-objects/service-status.vo.js";

export type SystemInfoProps = {
  name: string;
  description: string;
  version: AppVersion;
  environment: string;
  architecture: string;
  modules: string[];
  status: ServiceStatus;
  uptime: number;
};

export class SystemInfo {
  readonly name: string;
  readonly description: string;
  readonly version: AppVersion;
  readonly environment: string;
  readonly architecture: string;
  readonly modules: string[];
  readonly status: ServiceStatus;
  readonly uptime: number;

  constructor(props: SystemInfoProps) {
    this.name = props.name;
    this.description = props.description;
    this.version = props.version;
    this.environment = props.environment;
    this.architecture = props.architecture;
    this.modules = props.modules;
    this.status = props.status;
    this.uptime = props.uptime;
  }
}
