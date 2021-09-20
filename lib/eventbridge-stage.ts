import { CfnOutput, Construct, Stage, StageProps, Tags } from "@aws-cdk/core"
import { EventBridgeStack } from "./eventbridge-stack";

interface DeployStageProps extends StageProps {
  logicalEnv: string;
}

export class EventBridgeDeployStage extends Stage {

  public readonly arthurBusName: CfnOutput;
  public readonly arthurLogGroupName: CfnOutput;
  public readonly deadLetterQueueName: CfnOutput;

  constructor(scope: Construct, id: string, props?: DeployStageProps) {
    super(scope, id, props);
    
    const logicalEnv = props?.logicalEnv || 'development';
    const stack = new EventBridgeStack(this, 'EventBridge', {logicalEnv});

    Tags.of(stack).add('environment', logicalEnv);
    Tags.of(stack).add('service', 'eventbridge');

    this.arthurBusName = stack.arthurBusName;
    this.arthurLogGroupName = stack.arthurLogGroupName;
    this.deadLetterQueueName = stack.deadLetterQueueName;
  }
}