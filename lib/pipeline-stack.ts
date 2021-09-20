import { Construct, SecretValue, Stack, StackProps } from "@aws-cdk/core"
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions';
import { CdkPipeline, ShellScriptAction, SimpleSynthAction } from "@aws-cdk/pipelines";
import * as ssm from '@aws-cdk/aws-ssm';
import { EventBridgeDeployStage } from "./eventbridge-stage";

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const sourceArtifacts = new codepipeline.Artifact();
    const cloudAssemblyArtifacts = new codepipeline.Artifact();

    const pipeline = new CdkPipeline(this, 'EventBridgePipeline', {
      crossAccountKeys: false, // https://docs.aws.amazon.com/cdk/api/latest/docs/pipelines-readme.html#a-note-on-cost
      pipelineName: 'EventBridge',
      cloudAssemblyArtifact: cloudAssemblyArtifacts,

      // source
      sourceAction: new codepipeline_actions.GitHubSourceAction({
        actionName: 'Source',
        output: sourceArtifacts,
        owner: ssm.StringParameter.fromStringParameterName(this, 'GithubUsername', 'github_username').stringValue,
        repo: 'eventbridge-infrastructure',
        oauthToken: SecretValue.secretsManager('github_token', { jsonField: 'github_token' }),
        branch: 'main'
      }),

      // build
      synthAction: SimpleSynthAction.standardNpmSynth({
        sourceArtifact: sourceArtifacts,
        cloudAssemblyArtifact: cloudAssemblyArtifacts,
        buildCommand: 'npm run build',
        synthCommand: 'npm run synth'
      })
    });

    // deploy to staging
    const stagingDeploy = new EventBridgeDeployStage(this, 'Staging', {
      logicalEnv: 'stg'
    });
    const stagingStage = pipeline.addApplicationStage(stagingDeploy);

    const e2eTestAction = new ShellScriptAction({
      actionName: 'Test',
      useOutputs: {
        AUDIT_EVENT_BUS_NAME: pipeline.stackOutput(stagingDeploy.arthurBusName),
        AUDIT_LOG_GROUP_NAME: pipeline.stackOutput(stagingDeploy.arthurLogGroupName),
      },
      additionalArtifacts: [sourceArtifacts],
      commands: [
        'cd test',
        'npm ci',
        'npm test'
      ]
    });

    stagingStage.addActions(e2eTestAction);
    e2eTestAction.project.role?.addManagedPolicy({managedPolicyArn: 'arn:aws:iam::aws:policy/AmazonEventBridgeFullAccess'});
    // e2eTestAction.project.role?.addManagedPolicy({managedPolicyArn: 'arn:aws:iam::aws:policy/CloudWatchLogsReadOnlyAccess'});

    // deploy to production
    pipeline.addApplicationStage(new EventBridgeDeployStage(this, 'Production', {
      logicalEnv: 'production'
    }), {
      manualApprovals: true
    });
  }
}