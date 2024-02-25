env?=dev
region?=eu-west-1

pkg-name = $(shell npm run get-name -s)
pkg-version = $(shell npm run get-version -s)
accountId = $(shell aws sts get-caller-identity --query Account --output text)

templateBucket?=cf-templates-ns-32903290

frontendBucket?=$(shell grep 'Bucket' $(stackName).outputs | cut -f2)
distributionId?=$(shell grep 'Distribution' $(stackName).outputs | cut -f2)

stackName=${pkg-name}-$(env)

# List all other stacks dependencies
stackNames=$(stackName)
# Generate targets files names
stackOutputs:=$(patsubst %, %.outputs, $(stackNames))

.PHONY: all test

# First rule is the default rule
all: clean build deploy upload-webapp

# Intermediate targets are deleted once
# they have served their purpose
.INTERMEDIATE: $(stackNames)

# Make actual files corresponding to the name
# of the stacks to avoid rebuilding .outputs
# files every time
$(stackNames):
	@touch $@

# Make sure we remove the outputs if the
# command failed
.DELETE_ON_ERROR: %.outputs

.PHONY: describe show set-npmrc build deploy clean clean-stack empty-buckets invalidate-delivery dev

# describe requires all stack outputs
describe: $(stackOutputs)
# Grep is used to show the file name
	@grep '' *.outputs

# Loop through all stackNames and generate appropriate outputs
%.outputs: %
	@aws cloudformation describe-stacks --stack-name $< \
		--region $(region) \
		--query "sort_by(Stacks[0].Outputs, &OutputKey)[*].[OutputKey, OutputValue]" \
		--output text > $@

show:
	@aws cloudformation describe-stacks --stack-name $(stackName) \
		--query "sort_by(Stacks[0].Outputs, &OutputKey)[*].[OutputKey, OutputValue]" \
		--output text

node_modules:
	# devDependencies required here to build the bundle
	@npm install
	@touch node_modules

build: node_modules
	@npm run build

deploy:
	sam deploy \
		--region $(region) \
		--template-file template.yml \
		--no-fail-on-empty-changeset \
		--stack-name $(stackName) \
		--capabilities CAPABILITY_NAMED_IAM

upload-webapp: $(stackName).outputs
	aws s3 sync --acl=private ./build s3://$(frontendBucket)/

clean-stack: empty-buckets
	aws --region $(region) \
	    cloudformation delete-stack \
		--stack-name $(stackName)

	aws --region $(region) \
		cloudformation wait stack-delete-complete \
		--stack-name $(stackName)

clean:
	-@rm -f *.outputs
	-@rm -rf node_modules
	-@rm -rf dist

invalidate-delivery: $(stackName).outputs
	-@echo "Invalidating $(distributionId)"; \
	invalidationId=$(shell aws cloudfront create-invalidation --profile nt --distribution-id $(distributionId) --paths '/*' --query "Invalidation.Id" --output text); \
	aws cloudfront wait invalidation-completed --id $${invalidationId} --distribution-id $(distributionId)
