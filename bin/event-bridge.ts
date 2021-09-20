import 'source-map-support/register';
import { App } from '@aws-cdk/core';
import { PipelineStack } from '../lib/pipeline-stack';

const app = new App();
new PipelineStack(app, 'EventBirdgePipeline', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT || '165665469676',
        region: process.env.CDK_DEFAULT_REGION || 'ap-northeast-1',
    }
});

app.synth();