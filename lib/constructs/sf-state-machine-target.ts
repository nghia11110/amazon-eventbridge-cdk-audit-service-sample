import { Construct } from "@aws-cdk/core";
import { Code, Runtime, Tracing, Function, LayerVersion } from "@aws-cdk/aws-lambda";
import { StateMachine } from "@aws-cdk/aws-stepfunctions";
import * as tasks from '@aws-cdk/aws-stepfunctions-tasks';
import { acConfig, pickssBaseURLConfig } from '../../src/config';

interface StateMachineTargetProps {
  logicalEnv: string;
  accountId: string;
}

export class StateMachineTarget extends Construct {

  public readonly stateMachine: StateMachine;

  constructor(scope: Construct, id: string, props: StateMachineTargetProps) {
    super(scope, id);

    const prefix = props.logicalEnv;

    // 3rd party library layer
    const axiosLayer = new LayerVersion(this, 'AxiosLayer', {
      layerVersionName: `${prefix}-axios-layer`,
      compatibleRuntimes: [
        Runtime.NODEJS_12_X,
        Runtime.NODEJS_14_X,
      ],
      code: Code.fromAsset('src/layers/axios-utils'),
      description: '3rd party library: axios',
    });

    // lambda function
    const callAcApiFn = new Function(this, 'callAcApiFn', {
      functionName: `${prefix}-call-ac-api`,
      runtime: Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: Code.fromAsset('./lib/lambda/v1/call-ac-api'),
      environment: {
        AC_API_HOST: acConfig[prefix].host.api,
        METHOD: 'post',
        AC_API_PATH: '/v1.13/arthur/sync',
      },
      tracing: Tracing.ACTIVE,
      layers: [ axiosLayer ],
    });

    const callFittingApiFn = new Function(this, 'callFittingApiFn', {
      functionName: `${prefix}-call-fitting-api`,
      runtime: Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: Code.fromAsset('./lib/lambda/v1/call-fitting-api'),
      environment: {
        AC_API_HOST: pickssBaseURLConfig[prefix],
        METHOD: 'post',
        AC_API_PATH: '/v1.13/arthur/sync',
      },
      tracing: Tracing.ACTIVE,
      layers: [ axiosLayer ],
    });

    // state machine
    const callAcApiJob = new tasks.LambdaInvoke(this, 'CallAcApi', {
      lambdaFunction: callAcApiFn,
      payloadResponseOnly: true,
    });

    const callFittingApiJob = new tasks.LambdaInvoke(this, 'CallFittingApi', {
      lambdaFunction: callFittingApiFn,
      payloadResponseOnly: true,
    });

    const definition = callAcApiJob.next(callFittingApiJob);

    this.stateMachine = new StateMachine(this, 'LogEventBridgeEvent', {
      definition,
      stateMachineName: `${prefix}-log-eventbridge-event`
    });
  }
}