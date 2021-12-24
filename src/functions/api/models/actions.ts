export enum Actions {
    BUILD = "BUILD",
    DEPLOY = "DEPLOY",
}

export class BuildAction {
    readonly action: Actions.BUILD
    service: string;
    branch: string

    constructor(service: string, branch: string) {
        this.service = service;
        this.branch = branch;
    }
};
