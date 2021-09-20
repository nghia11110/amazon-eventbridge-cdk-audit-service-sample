import { Stack } from "@aws-cdk/core";
import { EventBridgeStack } from "./eventbridge-stack";

import '@aws-cdk/assert/jest';

let stack: Stack;

beforeEach(() => {
  stack = new EventBridgeStack(stack, 'eventbridge', {
    logicalEnv: 'test'
  });
});

test('should create an EventBridge bus', () => {
  expect(stack).toHaveResource('AWS::Events::EventBus', {
    Name: 'test-arthur-event-bus'
  });
});

test('should create a CloudWatch log group', () => {
  expect(stack).toHaveResource('AWS::Logs::LogGroup', {
    LogGroupName: '/aws/events/test-arthur-events',
    RetentionInDays: 1
  });
});

test('should create rule for basic_info_changed arthur events going to Step Function state machine', () => {
  expect(stack).toHaveResourceLike('AWS::Events::Rule', {
    Name: 'test-basic-info-changed-arthur-events-rule',
    Description: 'Rule matching basic_info_changed arthur events',
    EventBusName: {Ref: 'ArthurEventBus87E21057'},
    EventPattern: {
      'detail-type': ['Arthur Basic Info Changed']
    },
    Targets: [{
      Arn: {Ref: 'StateMachineTargetLogEventBridgeEvent336B976B'}
    }]
  });
});

test('should create rule for all events going to CloudWatch log group', () => {
  expect(stack).toHaveResourceLike('AWS::Events::Rule', {
    Name: 'test-all-events-rule',
    Description: 'Rule matching all events',
    EventBusName: {Ref: 'ArthurEventBus87E21057'},
    EventPattern: {
      source: [{prefix: ''}]
    },
    Targets: [{
      Id: 'test-all-events-cw-logs'
    }]
  });
});