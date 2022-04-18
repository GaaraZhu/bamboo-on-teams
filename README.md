# Bamboo-on-Teams
[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)
![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)

A serverless ChatOps tool for interacting with Bamboo from Microsoft Teams.

## Blogpost
[Chat the Ops up](https://gaarazhu.github.io/chat-the-ops-up/)

## Features
* Bamboo interaction - interact with Bamboo in Microsoft Teams with wide range of [commands](https://github.com/GaaraZhu/bamboo-on-teams#available-commands).
* Result notification - receive notification in Microsoft Teams for Bamboo jobs.
* Hanging detection - detect hanging Bamboo jobs and alert in Microsoft Teams.

## Demo
[![Demo](https://img.youtube.com/vi/JR8zbS7uKuA/0.jpg)](https://youtu.be/JR8zbS7uKuA)

## How it works
### Bamboo interaction
User interacts with Bamboo through Teams outgoing webhook and bamboo-on-teams service.
 ![Bamboo interaction](https://github.com/GaaraZhu/bamboo-on-teams/blob/main/resources/interactionSeq.png)

### Result notification & Hanging detection
Bamboo-on-teams stepfunction pulls job status from Bamboo and pushes to Teams channel through incoming webhook, and a warning message will be sent the same way out if the job is hanging.
 ![Result notification & hanging detection](https://github.com/GaaraZhu/bamboo-on-teams/blob/main/resources/statusCheckerSeq.png)

## Setup ##
1. Create an [incoming webhook](https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook) in Teams to received job notification and
copy the URL out as the `notificationURL` parameter value.

2. Create an [outgoing webhook](https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-outgoing-webhook?tabs=urljsonpayload%2Cdotnet) in Teams to point to the Bamboo-on-Teams service URL, and copy the HMAC token out as the `teamsHMACSharedToken` parameter value.

3. Create a [personal access token](https://confluence.atlassian.com/bamboo/personal-access-tokens-976779873.html) for the dedicated bamboo-on-teams bamboo account, and copy it out as the `bambooAPIToken` parameter value.

4. Configure required parameters in SSM
```
## Infrastructure configuration ##
# ID of the AWS account in which the stack is going to be created
/bamboo-on-teams/accountId

# Custom deployment bucket
/bamboo-on-teams/deploymentBucket

# VPC configuration to access the private bamboo REST API(Optional if Bamboo Rest API is public available)
/bamboo-on-teams/securityGroupId
/bamboo-on-teams/subnetId

## Application configuration - SecureString using the default AWS account key ##
/bamboo-on-teams/applicationConfig
```
Sample application configuration:
```
{
    "bambooHostUrl": "test.co.nz",
    "bambooAPIToken": "NjsDAFDHkoVOASXIM4QDSDFSgRQ",
    "hmacToken": "neasdffz+LPsYZGsdddxyOvWSiK8=",
    "notificationURL": "https://test.webhook.office.com/webhookb2/85dcasdfaf@864e4889-04a2-416e-9f88-ca5ce1c6c1b7/IncomingWebhook/9db3asdfaa369/be873347-c615-4984-ad7a-f7952283551e",
    "releaseApproval": {
         "bambooPlanId": "API-RCV",
         "requiredForEnvs": ["uat", "prod"]
    }
}
```

5. Build and deploy Bamboo-on-Teams through npm scripts in [package.json](https://github.com/GaaraZhu/bamboo-on-teams/blob/main/package.json).

6. In Teams channel, tag the outgoing webhook and run commands.

## Synopsis ##
\<command\> [options]

Use "<command> help" for information on a specific command. The synopsis for each command shows its options and their usage.

## Available commands ##
### Build commands ###
* list-plans
* search-plans
* list-branches
* list-builds
* desc-build
* create-branch
* build
* batch-build

### Deploy commands ###
* list-projects
* search-projects
* list-envs
* list-releases
* list-deploys
* create-release
* deploy-latest
* deploy-release
* deploy-build
* promote-release
* batch-deploy
* release

### Other commands ###
* help

## Command usage ##
### list-plans ###
```
Usage: list-plans
List bamboo plans.
```
### search-plans ###
```
Usage: search-plans [options]
Search build plans.
Options:
  -s, --service <service>  wildcard service name, e.g. customers
  -h, --help               display help for command
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
  -s, --service <service>       service name, e.g. customers-v1
  -b, --vcs-branch <vcsBranch>  vcsBranch name, e.g. master
  -h, --help                    display help for command
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
### batch-build ###
```
Usage: batch-build [options]
Trigger branch build in batches for services.
Options:
  -s, --services <services>  service names separated by comma without spaces,
                             e.g. customers-v1,accounts-v1
  -b, --branch <branch>      bamboo branch name, e.g. master
  -h, --help                 display help for command
```
### list-projects ###
```
Usage: list-projects
List deployment projects.
```
### search-projects ###
```
Usage: search-projects [options]
Search deployment projects.
Options:
  -s, --service <service>  wildcard service name, e.g. customers
  -h, --help               display help for command
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
  -b, --branch <branch>    bamboo branch name, e.g. master
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
Promote the release from one environment to another.
Options:
  -s, --service <service>        service name, e.g. customers-v1
  -se, --source-env <sourceEnv>  source environment name, e.g. dev
  -te, --target-env <targetEnv>  target environment name, e.g. test
  -h, --help                     display help for command
```
### batch-deploy ###
```
Usage: batch-deploy [options]
Deploy services in batch with the latest build in a branch to an environment.
Options:
  -s, --services <services>  service names separated by comma without spaces,
                             e.g. customers-v1,accounts-v1
  -b, --branch <branch>      bamboo branch name, e.g. master
  -e, --env <env>            env name, e.g. dev
  -h, --help                 display help for command
```

### release ###
```
Usage: release [options]
Release services in sequential batches.
Options:
  -s, --services <services>  sequential service name batches separated by semi-collon and with comma to separate service names in each batch,
                             e.g. customers-v1,accounts-v1;transactions-v1
  -b, --branch <branch>      bamboo branch name, e.g. master
  -e, --env <env>            env name, e.g. dev
  -h, --help                 display help for command
```

## Contribution ##
Your contributions are always welcome!

## License ##
This work is licensed under [MIT](https://opensource.org/licenses/MIT).
