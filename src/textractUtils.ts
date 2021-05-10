import aws from "aws-sdk";
import { config } from "./config";

aws.config.update({
  accessKeyId: config.awsAccesskeyID,
  secretAccessKey: config.awsSecretAccessKey,
  region: config.awsRegion,
});

const textract = new aws.Textract();

// See: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Textract.html#startDocumentTextDetection-property
interface TextDetectionRequest {
  DocumentLocation: {
    S3Object: {
      Bucket: string;
      Name: string;
      // Version: string;
    };
  };
  NotificationChannel: {
    RoleArn: string;
    SNSTopicArn: string;
  };
}

export const textractScan = async function textractScan(fileName: string) {
  const params: TextDetectionRequest = {
    DocumentLocation: {
      S3Object: {
        Bucket: config.s3Bucket, // Name of the bucket
        Name: fileName, // Name of the file
      },
    },
    NotificationChannel: {
      RoleArn: config.roleArn, // Role that has access to the SNS channel
      SNSTopicArn: config.snsTopicArn, // The topic channel, where we publish the finished job and ask for it later
    },
  };

  console.log(params);
  const request = textract.startDocumentTextDetection(params);
  return request.promise();
};

export const textractGetResult = async function (JobId: string) {
  const params = { JobId };
  const request = textract.getDocumentTextDetection(params);
  return request.promise();
};
