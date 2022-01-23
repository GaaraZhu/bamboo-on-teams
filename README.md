# Bamboo-on-Teams ![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg) #
A serverless ChatOps tool for interacting with Bamboo from Microsoft Teams.

## Setup ##
1. Create an [incoming webhook](https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook) in Teams to received job notification and
copy the URL out as the `notificationURL` parameter value.

2. Create an [outgoing webhook](https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-outgoing-webhook?tabs=urljsonpayload%2Cdotnet) in Teams to point to the Bamboo-on-Teams service URL, and copy the HMAC token out as the `teamsHMACSharedToken` parameter value.

3. Create a [personal access token](https://confluence.atlassian.com/bamboo/personal-access-tokens-976779873.html) for the dedicated bamboo-on-teams bamboo account, and copy it out as the `bambooAPIToken` parameter value.

4. Configure required parameters in SSM
```
/bamboo-on-teams/accountId
/bamboo-on-teams/deploymentBucket
/bamboo-on-teams/securityGroupId
/bamboo-on-teams/subnetId
/bamboo-on-teams/bambooAPIToken
/bamboo-on-teams/bambooHostUrl
/bamboo-on-teams/bambooProjectId
/bamboo-on-teams/teamsHMACSharedToken
/bamboo-on-terams/teamsNotificationURL
```
5. Deploy Bamboo-on-Teams through npm deploy script.

6. In Teams channel, tag the outgoing webhook and run commands.

## Synopsis ##
\<command\> [options]

Use "<command> help" for information on a specific command. The synopsis for each command shows its options and their usage.

## Available commands ##
### Build commands ###
* list-plans
* list-branches
* list-builds
* desc-build
* create-branch
* build

### Deploy commands ###
* list-projects
* list-envs
* list-releases
* list-deploys
* create-release
* deploy-latest
* deploy-release
* deploy-build
* promote-release

### Other commands ###
* help

## Command usage ##
### list-plans ###
```
Usage: list-plans
List bamboo plans.
```
### list-branches ###
```
Usage: list-branches [options]
List branch plans for a service.
Options:
  -s, --service <service>  service name, e.g. customers-v1
  -h, --help               display help for command
```
### list-builds ###
```
Usage: list-builds [options]
List builds for a service in a branch plan.
Options:
  -s, --service <service>  service name, e.g. customers-v1
  -b, --branch <branch>    bamboo branch name, e.g. release-1.0.0
  -h, --help               display help for command
```
### desc-build ###
```
Usage: desc-build [options]
Describe a build.
Options:
  -b, --build <build>  build key, e.g. API-CCV28-1
  -h, --help           display help for command
```
### create-branch ###
```
Usage: create-branch [options
Create branch for a plan.
Options:
  -s, --service <service>  service name, e.g. customers-v1
  -b, --branch <branch>    vcsBranch name, e.g. master
  -h, --help               display help for command
```
### build ###
```
Usage: build [options]
Trigger a branch build for a service.
Options:
  -s, --service <service>  service name, e.g. customers-v1
  -b, --branch <branch>    bamboo branch name, e.g. master
  -h, --help               display help for command
```
### list-projects ###
```
Usage: list-projects
List deployment projects.
```
### list-envs ###
```
Usage: list-envs [options]
List available environments for a service.
Options:
  -s, --service <service>  service name, e.g. customers-v1
  -h, --help               display help for command
```
### list-releases ###
```
Usage: list-releases [options]
List the releases created from a service branch.
Options:
  -s, --service <service>  service name, e.g. customers-v1
  -b, --branch <branch>    bamboo branch name, e.g. release-1.0.0
  -h, --help               display help for command
```
### list-deploys ###
```
Usage: list-deploys [options]
List the deployments in a service environment.
Options:
  -s, --service <service>  service name, e.g. customers-v1
  -e, --env <env>          env name, e.g. dev
  -h, --help               display help for command
```
### create-release ###
```
Usage: create-release [options]
Create a release for a service build.
Options:
  -s, --service <service>  service name, e.g. customers-v1
  -b, --build <build>      build key, e.g. API-CCV28-1
  -r, --release <release>  release name, e.g. v1.0.0
  -h, --help               display help for command
```
### deploy-latest ###
```
Usage: deploy-latest [options]
Deploy the service with the latest build in a branch to an environment.
Options:
  -s, --service <service>  service name, e.g. customers-v1
  -b, --branch <branch>    bamboo branch name, e.g. master
  -e, --env <env>          env name, e.g. dev
  -h, --help               display help for command
```
### deploy-release ###
```
Usage: deploy-release [options]
Deploy a release to a service environment.
Options:
  -s, --service <service>  service name, e.g. customers-v1
  -e, --env <env>          env name, e.g. dev
  -r, --release <release>  release name, e.g. v1.0.0
  -h, --help               display help for command
```
### deploy-build ###
```
Usage: deploy-build [options]
Deploy a service build to an environment.
Options:
  -s, --service <service>     service name, e.g. customers-v1
  -e, --env <env>             env name, e.g. dev
  -b, --build-key <buildKey>  bamboo build key, e.g. API-CPV1-30
  -h, --help                  display help for command
```
### promote-release ###
```
Usage: promote-release [options]
promote the release from one environment to another.
Options:
  -s, --service <service>        service name, e.g. customers-v1
  -se, --source-env <sourceEnv>  source environment name, e.g. dev
  -te, --target-env <targetEnv>  target environment name, e.g. test
  -h, --help                     display help for command
```

## Contribution ##
Your contributions are always welcome!

## License ##
This work is licensed under [MIT](https://opensource.org/licenses/MIT).
