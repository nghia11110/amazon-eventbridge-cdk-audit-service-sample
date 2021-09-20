import { Stack } from "@aws-cdk/core";
import { StateMachineTarget } from "./sf-state-machine-target";

import '@aws-cdk/assert/jest';

let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  new StateMachineTarget(stack, 'stateMachine', {
    logicalEnv: 'test',
    accountId: '11111111'
  });
});

test('should create call ac-api Lambda function', () => {
  expect(stack).toHaveResourceLike('AWS::Lambda::Function', {
    FunctionName: 'test-call-ac-api',
    Runtime: 'nodejs14.x',
    TracingConfig: {
      Mode: 'Active'
    }
  });
});

test('should create call fitting-api Lambda function', () => {
  expect(stack).toHaveResourceLike('AWS::Lambda::Function', {
    FunctionName: 'test-call-fitting-api',
    Runtime: 'nodejs14.x',
    TracingConfig: {
      Mode: 'Active'
    }
  });
});

test('should create state machine', () => {
  expect(stack).toHaveResource('AWS::StepFunctions::StateMachine', {
    StateMachineName: 'test-log-eventbridge-event'
  });
});