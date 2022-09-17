# Bamboo-on-teams Cheatsheet
Let's say the outgoing webhook is named as `Bamboo` in Teams channel.

## Build and deploy service(s)
\
Build service **customers-v1** and **accounts-v1** from VCS branch **feature/API-129** (create bamboo branch plan if not exist) and deploy to environment **test1**:
```
@Bamboo build-and-deploy -s customers-v1,accounts-v1 -b feature/API-129 -e test1
```

## Search build plan
\
Search Bamboo plans with keyword **accounts** in the name:
```
@Bamboo search-plans -s accounts
```

## Create branch plan
\
Create branch plan from a feature branch **feature/API-129** for service **customers-v1**:
```
@Bamboo create-branch -s customers-v1 -b feature/API-129
```
for services:
* customers-v1
* accounts-v1
* cards-v1
* banks-v1
```
@Bamboo batch-create-branch -s customers-v1,accounts-v1,cards-v1,banks-v1 -b feature/API-129
```

## Trigger branch build
\
Trigger branch build from a branch plan **feature-API-129** for service **customers-v1**:
```
@Bamboo build -s customers-v1 -b feature-API-129
```
for services:
* customers-v1
* accounts-v1
* cards-v1
* banks-v1
```
@Bamboo batch-build -s customers-v1,accounts-v1,cards-v1,banks-v1 -b feature-API-129
```

## Search deployment project
\
Search Bamboo deployment projects with keyword **accounts** in the name:
```
@Bamboo search-projects -s accounts
```

## Deploy branch build
\
Deploy latest build from a branch plan **feature-API-129** to environment **test1** for service **customers-v1**:
```
@Bamboo deploy -s customers-v1 -b feature-API-129 -e test1
```
for services **without** dependencies:
* customers-v1
* accounts-v1
* cards-v1
* banks-v1
```
@Bamboo batch-deploy -s customers-v1,accounts-v1,cards-v1,banks-v1 -b feature-API-129 -e test1
```

## Release services
\
Release with the latest build from a branch plan **feature-API-129** to environment **test1** for service **customers-v1**:
```
@Bamboo release -s customers-v1 -b feature-API-129 -e test1
```
for services **with/without** dependencies:
* customers-v1
* accounts-v1
* cards-v1 (depends on previous 2 services)
* banks-v1 (depends on cards-v1)
```
@Bamboo release -s customers-v1,accounts-v1;cards-v1;banks-v1 -b feature-API-129 -e test1
```

## Promote release
\
Promote the release from **test1** to **uat** with the same builds for services with/without dependencies:
* customers-v1
* accounts-v1
* cards-v1 (depends on previous 2 services)
* banks-v1 (depends on cards-v1)
```
@Bamboo promote-release -s customers-v1,accounts-v1;cards-v1;banks-v1 -se test1 -te uat
```

