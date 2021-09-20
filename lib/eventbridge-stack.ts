import * as cdk from '@aws-cdk/core';
import { EventBus, Rule, CfnRule } from '@aws-cdk/aws-events';
import * as targets from '@aws-cdk/aws-events-targets';
import { StateMachineTarget } from './constructs/sf-state-machine-target';
import { CfnOutput } from '@aws-cdk/core';
import { LogGroup, RetentionDays } from '@aws-cdk/aws-logs';
import * as sqs from '@aws-cdk/aws-sqs';
import { SqsEventSource } from '@aws-cdk/aws-lambda-event-sources';
import { Code, Runtime, Tracing, Function, LayerVersion } from '@aws-cdk/aws-lambda';

interface EventBridgeStackProps extends cdk.StackProps {
  logicalEnv: string;
}

export class EventBridgeStack extends cdk.Stack {
  public readonly arthurBusName: CfnOutput;
  public readonly arthurLogGroupName: CfnOutput;
  public readonly deadLetterQueueName: CfnOutput;

  constructor(scope: cdk.Construct, id: string, props?: EventBridgeStackProps) {
    super(scope, id, props);

    const prefix = props?.logicalEnv;

    // step functions state machine target
    const stateMachineTarget = new StateMachineTarget(this, 'StateMachineTarget', {
      logicalEnv: prefix!,
      accountId: this.account,
    });

    // cloudwatch log group target
    const arthurLogGroup = new LogGroup(this, 'ArthurLogGroup', {
      logGroupName: `/aws/events/${prefix}-arthur-events`,
      retention: RetentionDays.ONE_DAY
    });

    // create dead letter queue
    const deadLetterQueue = new sqs.Queue(this, 'DeadLetterQueue', {
      queueName: `${prefix}-dead-letter-queue`,
      retentionPeriod: cdk.Duration.days(10),
    });

    // 3rd party library layer
    const slackLayer = new LayerVersion(this, 'SlackLayer', {
      layerVersionName: `${prefix}-slack-layer`,
      compatibleRuntimes: [
        Runtime.NODEJS_12_X,
        Runtime.NODEJS_14_X,
      ],
      code: Code.fromAsset('src/layers/slack-utils'),
      description: '3rd party library: slack',
    });

    // create DLQ lambda function
    const dlqLambda = new Function(this, 'DlqLambda', {
      memorySize: 1024,
      timeout: cdk.Duration.seconds(30),
      functionName: `${prefix}-dlq`,
      runtime: Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: Code.fromAsset('./lib/lambda/v1/dead-letter-queue'),
      environment: {
      },
      tracing: Tracing.ACTIVE,
      layers: [ slackLayer ],
    });

    // add dead letter queue as event source for dlq lambda function
    dlqLambda.addEventSource(new SqsEventSource(deadLetterQueue));

    // arthur eventbridge
    const arthurBus = new EventBus(this, 'ArthurEventBus', {
      eventBusName: `${prefix}-arthur-event-bus`
    });

    // rule with step function state machine as a target
    const BasicInfoChangedArthurEventsRule = new Rule(this, 'BasicInfoChangedArthurEventsRule', {
      ruleName: `${prefix}-basic-info-changed-arthur-events-rule`,
      description: 'Rule matching basic_info_changed arthur events',
      eventBus: arthurBus,
      eventPattern: {
        detailType: ['Arthur Basic Info Changed']
      }
    });

    BasicInfoChangedArthurEventsRule.addTarget(new targets.SfnStateMachine(stateMachineTarget.stateMachine, {
      deadLetterQueue,
    }));

    // rule with cloudwatch log group as a target
    new CfnRule(this, 'AllEventsBusRule', {
      name: `${prefix}-all-events-rule`,
      eventBusName: arthurBus.eventBusName,
      description: 'Rule matching all events',
      eventPattern: {   
        source: [{prefix: ''}]
      },
      targets: [{
        id: `${prefix}-all-events-cw-logs`,
        arn: `arn:aws:logs:${arthurLogGroup.stack.region}:${arthurLogGroup.stack.account}:log-group:${arthurLogGroup.logGroupName}`
      }]
    });

    // outputs
    this.arthurBusName = new CfnOutput(this, 'ArthurEventBusName', {
      value: arthurBus.eventBusName,
      description: 'Name of the arthur bus created for event-bridge events'
    });

    this.arthurLogGroupName = new CfnOutput(this, 'ArthurLogGroupName', {
      value: arthurLogGroup.logGroupName,
      description: 'Name of the log group created to store all events from arthur'
    });

    this.deadLetterQueueName = new CfnOutput(this, 'DeadLetterQueueName', {
      value: deadLetterQueue.queueName,
      description: 'Name of the sqs queue created to store all failed events from arthur'
    });
  }
}
